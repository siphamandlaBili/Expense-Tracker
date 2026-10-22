import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
  TREND_MONTH_OPTIONS,
  type TrendMonths,
} from "../../lib/spendingFilters";

/** How many months /spending/trends returns (the API allows 1 to 24). */
export function TrendMonthsSelect({
  value,
  onChange,
}: {
  value: TrendMonths;
  onChange: (months: TrendMonths) => void;
}) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {t("spending.trend.range")}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value) as TrendMonths)
        }
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {TREND_MONTH_OPTIONS.map((months) => (
          <option key={months} value={months}>
            {t(`spending.trend.months${months}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
