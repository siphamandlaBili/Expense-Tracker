import { delay, http, HttpResponse, type RequestHandler } from "msw";
import { z } from "zod";
import { API_BASE_URL } from "../api/config";
import {
  createGoalInputSchema,
  isoDateSchema,
  periodSchema,
  sortBySchema,
  updateGoalInputSchema,
} from "../api/schemas";
import {
  categoryBreakdown,
  customRange,
  describeRange,
  goalProgress,
  inRange,
  monthlyTrends,
  periodRange,
  queryTransactions,
  spendingSummary,
  sum,
} from "./compute";
import { db } from "./db";
import {
  categoriesFixture,
  CUSTOMER_ID,
  dateRangePresetsFixture,
  profileFixture,
} from "./fixtures";

// Mock implementation of the spending API. Behaves like the real contract:
// validates input, returns 400/404/409 errors, and derives every figure from
// one transaction history. Override per test with `server.use(...)`.

const BASE = `${API_BASE_URL}/customers/:customerId`;

const error = (status: number, message: string) =>
  HttpResponse.json({ message }, { status });

const queryParams = (request: Request) =>
  Object.fromEntries(new URL(request.url).searchParams);

/** Wraps a resolver with simulated latency and the customer lookup. */
function forCustomer<P extends Record<string, string>>(
  resolver: (args: {
    request: Request;
    params: P;
  }) => Response | Promise<Response>,
) {
  return async ({
    request,
    params,
  }: {
    request: Request;
    params: Record<string, string | readonly string[] | undefined>;
  }) => {
    await delay();
    if (params.customerId !== CUSTOMER_ID) {
      return error(404, `Customer ${String(params.customerId)} not found`);
    }
    return resolver({ request, params: params as P });
  };
}

/** Parses with `schema`, or returns a 400 response describing the problem. */
function parse<T>(schema: z.ZodType<T>, input: unknown) {
  const result = schema.safeParse(input);
  return result.success
    ? { data: result.data, response: null }
    : { data: null, response: error(400, z.prettifyError(result.error)) };
}

const periodQuerySchema = z.object({
  period: periodSchema.default("30d"),
});

const categoriesQuerySchema = z
  .object({
    period: periodSchema.default("30d"),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
    { error: "startDate must be on or before endDate" },
  );

const trendsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(12),
});

const knownCategory = z
  .string()
  .refine((name) => categoriesFixture.some((c) => c.name === name), {
    error: "Unknown category",
  });

const transactionsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    category: knownCategory.optional(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
    sortBy: sortBySchema.default("date_desc"),
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
    { error: "startDate must be on or before endDate" },
  );

const createGoalBodySchema = createGoalInputSchema.extend({
  category: knownCategory,
});

const goalResponse = (goal: Parameters<typeof goalProgress>[0]) =>
  goalProgress(goal, db.transactions(), db.now());

export const handlers: RequestHandler[] = [
  http.get(
    `${BASE}/profile`,
    forCustomer(() =>
      HttpResponse.json({
        ...profileFixture,
        totalSpent: sum(db.transactions()),
      }),
    ),
  ),

  http.get(
    `${BASE}/spending/summary`,
    forCustomer(({ request }) => {
      const { data, response } = parse(periodQuerySchema, queryParams(request));
      if (response) return response;

      return HttpResponse.json(
        spendingSummary(
          db.transactions(),
          categoriesFixture,
          data.period,
          db.now(),
        ),
      );
    }),
  ),

  http.get(
    `${BASE}/spending/categories`,
    forCustomer(({ request }) => {
      const { data, response } = parse(
        categoriesQuerySchema,
        queryParams(request),
      );
      if (response) return response;

      const range =
        data.startDate && data.endDate
          ? customRange(data.startDate, data.endDate)
          : periodRange(data.period, db.now());

      return HttpResponse.json({
        dateRange: describeRange(range),
        ...categoryBreakdown(
          inRange(db.transactions(), range),
          categoriesFixture,
        ),
      });
    }),
  ),

  http.get(
    `${BASE}/spending/trends`,
    forCustomer(({ request }) => {
      const { data, response } = parse(trendsQuerySchema, queryParams(request));
      if (response) return response;

      return HttpResponse.json({
        trends: monthlyTrends(db.transactions(), data.months, db.now()),
      });
    }),
  ),

  http.get(
    `${BASE}/transactions`,
    forCustomer(({ request }) => {
      const { data, response } = parse(
        transactionsQuerySchema,
        queryParams(request),
      );
      if (response) return response;

      return HttpResponse.json(queryTransactions(db.transactions(), data));
    }),
  ),

  http.get(
    `${BASE}/goals`,
    forCustomer(() =>
      HttpResponse.json({ goals: db.goals().map(goalResponse) }),
    ),
  ),

  http.post(
    `${BASE}/goals`,
    forCustomer(async ({ request }) => {
      const { data, response } = parse(
        createGoalBodySchema,
        await request.json().catch(() => null),
      );
      if (response) return response;

      if (db.goals().some((goal) => goal.category === data.category)) {
        return error(409, `A goal for ${data.category} already exists`);
      }
      return HttpResponse.json(goalResponse(db.createGoal(data)), {
        status: 201,
      });
    }),
  ),

  http.patch(
    `${BASE}/goals/:goalId`,
    forCustomer<{ goalId: string }>(async ({ request, params }) => {
      const { data, response } = parse(
        updateGoalInputSchema,
        await request.json().catch(() => null),
      );
      if (response) return response;

      const updated = db.updateGoal(params.goalId, data);
      return updated
        ? HttpResponse.json(goalResponse(updated))
        : error(404, `Goal ${params.goalId} not found`);
    }),
  ),

  http.delete(
    `${BASE}/goals/:goalId`,
    forCustomer<{ goalId: string }>(({ params }) =>
      db.deleteGoal(params.goalId)
        ? new HttpResponse(null, { status: 204 })
        : error(404, `Goal ${params.goalId} not found`),
    ),
  ),

  http.get(
    `${BASE}/filters`,
    forCustomer(() =>
      HttpResponse.json({
        categories: categoriesFixture,
        dateRangePresets: dateRangePresetsFixture,
      }),
    ),
  ),
];
