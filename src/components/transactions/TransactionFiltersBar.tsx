import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
  SORT_OPTIONS,
  type CategoryMeta,
  type SortBy,
} from "../../api/schemas";
import type { DateRange } from "../../lib/dateRange";
import { DateRangePicker } from "../dashboard/DateRangePicker";

type TransactionFiltersBarProps = {
  /** Categories from /filters. */
  categories: CategoryMeta[];
  category?: string;
  dates?: DateRange;
  sortBy: SortBy;
  onCategoryChange: (category: string | undefined) => void;
  onDatesChange: (dates: DateRange | undefined) => void;
  onSortChange: (sortBy: SortBy) => void;
  onClear: () => void;
};

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-heading outline-none hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary";

/** The /transactions filters: category, date range and sort order. */
export function TransactionFiltersBar({
  categories,
  category,
  dates,
  sortBy,
  onCategoryChange,
  onDatesChange,
  onSortChange,
  onClear,
}: TransactionFiltersBarProps) {
  const { t } = useTranslation();
  const categoryId = useId();
  const sortId = useId();
  const filtered = Boolean(category || dates);

  return (
    <div
      role="group"
      aria-label={t("transactions.filters.label")}
      className="flex flex-wrap items-end gap-3"
    >
      <div>
        <label
          htmlFor={categoryId}
          className="mb-1 block text-xs font-medium text-body"
        >
          {t("transactions.filters.category")}
        </label>
        <select
          id={categoryId}
          value={category ?? ""}
          onChange={(event) =>
            onCategoryChange(event.target.value || undefined)
          }
          className={selectClass}
        >
          <option value="">{t("transactions.filters.allCategories")}</option>
          {categories.map(({ name }) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-1 block text-xs font-medium text-body" aria-hidden>
          {t("transactions.filters.dates")}
        </span>
        <DateRangePicker
          label={t("transactions.filters.chooseDates")}
          dates={dates}
          active={Boolean(dates)}
          onApply={onDatesChange}
        />
      </div>

      <div>
        <label
          htmlFor={sortId}
          className="mb-1 block text-xs font-medium text-body"
        >
          {t("transactions.filters.sort")}
        </label>
        <select
          id={sortId}
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortBy)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`transactions.sort.${option}`)}
            </option>
          ))}
        </select>
      </div>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-light"
        >
          {t("transactions.filters.clear")}
        </button>
      )}
    </div>
  );
}
