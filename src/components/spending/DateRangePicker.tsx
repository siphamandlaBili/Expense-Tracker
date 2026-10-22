import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendar, LuChevronDown } from "react-icons/lu";
import { formatDayLong } from "../../lib/format";
import type { DateRange } from "../../lib/spendingFilters";

type DateRangePickerProps = {
  /** The dates currently shown (button label and the picker's start value). */
  dates?: DateRange;
  /** True when custom dates are in use (vs. the page's period). */
  active: boolean;
  onApply: (range: DateRange) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

type RangeError =
  | "spending.customRange.errors.required"
  | "spending.customRange.errors.order"
  | "spending.customRange.errors.future";

function validateRange(from: string, to: string): RangeError | null {
  if (!from || !to) return "spending.customRange.errors.required";
  if (from > to) return "spending.customRange.errors.order";
  if (to > todayIso()) return "spending.customRange.errors.future";
  return null;
}

/** Button showing a date range, opening a from/to picker. */
export function DateRangePicker({
  dates,
  active,
  onApply,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary ${
          active
            ? "border-primary text-primary"
            : "border-slate-200 text-heading"
        }`}
      >
        <LuCalendar className="size-4" aria-hidden />
        {dates ? (
          <span>
            <span className="sr-only">{t("spending.customRange.open")}: </span>
            {formatDayLong(dates.startDate)} – {formatDayLong(dates.endDate)}
          </span>
        ) : (
          t("spending.customRange.open")
        )}
        <LuChevronDown className="size-4" aria-hidden />
      </button>

      {open && (
        <DateRangePopover
          initial={dates}
          onApply={(range) => {
            onApply(range);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function DateRangePopover({
  initial,
  onApply,
  onClose,
}: {
  initial?: DateRange;
  onApply: (range: DateRange) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const hintId = useId();
  const fromId = useId();
  const toId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const [from, setFrom] = useState(initial?.startDate ?? "");
  const [to, setTo] = useState(initial?.endDate ?? "");
  const [error, setError] = useState<RangeError | null>(null);

  // Focus the first field; close on Escape or a click outside.
  useEffect(() => {
    fromRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validateRange(from, to);
    setError(problem);
    if (!problem) onApply({ startDate: from, endDate: to });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl"
    >
      <h2 id={titleId} className="font-semibold text-heading">
        {t("spending.customRange.title")}
      </h2>
      <p id={hintId} className="mt-0.5 text-xs text-body">
        {t("spending.customRange.hint")}
      </p>
      <form noValidate onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={fromId}
              className="mb-1 block text-xs font-medium text-heading"
            >
              {t("spending.customRange.from")}
            </label>
            <input
              ref={fromRef}
              id={fromId}
              type="date"
              value={from}
              max={todayIso()}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor={toId}
              className="mb-1 block text-xs font-medium text-heading"
            >
              {t("spending.customRange.to")}
            </label>
            <input
              id={toId}
              type="date"
              value={to}
              max={todayIso()}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-600">
            {t(error)}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-body hover:bg-dashboard"
          >
            {t("spending.customRange.cancel")}
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            {t("spending.customRange.apply")}
          </button>
        </div>
      </form>
    </div>
  );
}
