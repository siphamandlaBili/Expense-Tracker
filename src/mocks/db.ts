import type { Transaction } from "../api/schemas";
import { goalsFixture, type StoredGoal } from "./fixtures";
import { generateTransactions } from "./generateTransactions";

// In-memory "database" behind the mock API. Transactions are generated from
// a fixed seed; goals are writable and saved to localStorage so changes
// survive a page refresh in the deployed demo.

const STORAGE_KEY = "moya-mock-db:v1:goals";

type DbState = {
  now: () => Date;
  transactions: Transaction[];
  goals: StoredGoal[];
  nextGoalNumber: number;
};

let state: DbState | null = null;

function readStoredGoals(): StoredGoal[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredGoal[]) : null;
  } catch {
    return null;
  }
}

function persistGoals(goals: StoredGoal[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // Storage can be unavailable (private mode, quota); the session still works.
  }
}

function nextNumberAfter(goals: StoredGoal[]) {
  const numbers = goals.map((goal) => Number(goal.id.replace(/\D/g, "")) || 0);
  return Math.max(0, ...numbers) + 1;
}

type ResetOptions = {
  /** Fixed clock for deterministic tests. Defaults to the real time. */
  now?: Date;
  /** Ignore and overwrite anything saved in localStorage. */
  fresh?: boolean;
};

export function resetDb({ now, fresh = false }: ResetOptions = {}) {
  const clock = now ? () => new Date(now) : () => new Date();
  const goals = (!fresh && readStoredGoals()) || structuredClone(goalsFixture);
  if (fresh) persistGoals(goals);

  state = {
    now: clock,
    transactions: generateTransactions(clock()),
    goals,
    nextGoalNumber: nextNumberAfter(goals),
  };
  return state;
}

function getState() {
  return state ?? resetDb();
}

export const db = {
  now: () => getState().now(),
  transactions: () => getState().transactions,
  goals: () => getState().goals,

  createGoal(input: Omit<StoredGoal, "id">): StoredGoal {
    const current = getState();
    const goal = {
      id: `goal_${String(current.nextGoalNumber).padStart(3, "0")}`,
      ...input,
    };
    current.nextGoalNumber += 1;
    current.goals = [...current.goals, goal];
    persistGoals(current.goals);
    return goal;
  },

  updateGoal(id: string, changes: Pick<StoredGoal, "monthlyBudget">) {
    const current = getState();
    const existing = current.goals.find((goal) => goal.id === id);
    if (!existing) return null;

    const updated = { ...existing, ...changes };
    current.goals = current.goals.map((goal) =>
      goal.id === id ? updated : goal,
    );
    persistGoals(current.goals);
    return updated;
  },

  deleteGoal(id: string) {
    const current = getState();
    const before = current.goals.length;
    current.goals = current.goals.filter((goal) => goal.id !== id);
    persistGoals(current.goals);
    return current.goals.length < before;
  },
};
