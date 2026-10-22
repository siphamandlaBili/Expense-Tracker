import type { UseQueryResult } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { Link } from "react-router";
import type { Transaction, TransactionsPage } from "../../api/schemas";
import { formatCurrency, formatDate } from "../../lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { Panel, QueryContent, Skeleton } from "./Panel";
import { TransactionDrawer } from "./TransactionDrawer";

// Columns drop out as the card narrows, least important first, so the table
// never needs to scroll sideways (container queries on the card's width):
//   payment method < 48rem, category < 36rem, date < 32rem (it then moves
//   under the merchant). Merchant and amount always show; the drawer has
//   every field.
const COLUMN = {
  date: "hidden @lg:table-cell",
  category: "hidden @xl:table-cell",
  paymentMethod: "hidden @3xl:table-cell",
};

export function RecentTransactionsCard({
  query,
  currency,
  count,
}: {
  query: UseQueryResult<TransactionsPage>;
  currency?: string;
  /** How many transactions were requested, for the label. */
  count: number;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const closeDrawer = useCallback(() => setSelected(null), []);
  const hasTransactions = (query.data?.transactions.length ?? 0) > 0;

  return (
    <Panel
      title={t("dashboard.recent.title")}
      action={
        <span className="text-sm text-body">
          {t("dashboard.recent.lastCount", { count })}
        </span>
      }
    >
      <QueryContent
        query={query}
        loading={
          <div className="space-y-3">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-9 w-full" />
            ))}
          </div>
        }
        isEmpty={(data) => data.transactions.length === 0}
        emptyMessage={t("dashboard.recent.empty")}
      >
        {({ transactions }) => (
          <div className="@container -mx-4 sm:-mx-5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-dashboard text-xs font-semibold text-body">
                  <th
                    scope="col"
                    className={`${COLUMN.date} px-4 py-2.5 sm:px-5`}
                  >
                    {t("dashboard.recent.date")}
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    {t("dashboard.recent.merchant")}
                  </th>
                  <th scope="col" className={`${COLUMN.category} px-4 py-2.5`}>
                    {t("dashboard.recent.category")}
                  </th>
                  <th
                    scope="col"
                    className={`${COLUMN.paymentMethod} px-4 py-2.5`}
                  >
                    {t("dashboard.recent.paymentMethod")}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right sm:px-5">
                    {t("dashboard.recent.amount")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  // The whole row opens the drawer for pointer users; the
                  // merchant button is the keyboard and screen-reader target.
                  <tr
                    key={txn.id}
                    onClick={() => setSelected(txn)}
                    className="cursor-pointer transition-colors hover:bg-dashboard/70"
                  >
                    <td
                      className={`${COLUMN.date} px-4 py-3 whitespace-nowrap text-body sm:px-5`}
                    >
                      <time dateTime={txn.date}>{formatDate(txn.date)}</time>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelected(txn);
                        }}
                        className="rounded text-left font-medium text-heading outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {txn.merchant}
                        <span className="sr-only">
                          , {t("dashboard.recent.viewDetails")}
                        </span>
                      </button>
                      <time
                        dateTime={txn.date}
                        className="block text-xs text-body @lg:hidden"
                      >
                        {formatDate(txn.date)}
                      </time>
                    </td>
                    <td className={`${COLUMN.category} px-4 py-3`}>
                      <span className="flex items-center gap-2 text-heading">
                        <CategoryBadge
                          category={txn.category}
                          icon={txn.icon}
                        />
                        {txn.category}
                      </span>
                    </td>
                    <td
                      className={`${COLUMN.paymentMethod} px-4 py-3 text-body`}
                    >
                      {txn.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-heading sm:px-5">
                      {formatCurrency(txn.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryContent>

      {hasTransactions && (
        <div className="mt-3 flex justify-end">
          <Link
            to="/dashboard/transactions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t("dashboard.recent.viewAll")}
            <LuArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}

      {selected && (
        <TransactionDrawer
          transaction={selected}
          currency={currency}
          onClose={closeDrawer}
        />
      )}
    </Panel>
  );
}
