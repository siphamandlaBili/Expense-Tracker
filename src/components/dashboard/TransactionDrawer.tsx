import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuX } from "react-icons/lu";
import type { Transaction } from "../../api/schemas";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { useBottomSheet } from "../../lib/useBottomSheet";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { useModal } from "../../lib/useModal";
import { CategoryBadge } from "./CategoryBadge";

type TransactionDrawerProps = {
  transaction: Transaction;
  currency?: string;
  onClose: () => void;
};

/** Matches the "out" animation durations in App.css. */
const SHEET_EXIT_MS = 200;

const prefersReducedMotion = () =>
  // No matchMedia (e.g. jsdom) means we can't animate reliably: skip it.
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;

/** Every field the API returns for a transaction, in a drawer. */
export function TransactionDrawer({
  transaction,
  currency,
  onClose,
}: TransactionDrawerProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);

  // Play the slide-out, then unmount. Reduced motion closes at once.
  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, SHEET_EXIT_MS);
  }, [onClose]);

  useModal(requestClose, closeRef);

  // The sheet's smallest snap point fits all of its content, so measure the
  // natural height: header + content + bottom safe-area padding.
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    const header = headerRef.current;
    const content = contentRef.current;
    if (!dialog || !header || !content) return;

    const observer = new ResizeObserver(() => {
      const safeArea = parseFloat(getComputedStyle(dialog).paddingBottom) || 0;
      // The content wrapper isn't stretched by the sheet, so its height is
      // the true content height whatever size the sheet currently is.
      setContentHeight(header.offsetHeight + content.offsetHeight + safeArea);
    });
    observer.observe(header);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Phones get a draggable bottom sheet; md and up a fixed side panel.
  const isSidePanel = useMediaQuery("(min-width: 48rem)");
  const sheet = useBottomSheet({
    enabled: !isSidePanel,
    contentHeight,
    onDismiss: requestClose,
  });

  const details = [
    {
      label: t("dashboard.transaction.date"),
      value: (
        <time dateTime={transaction.date}>
          {formatDateTime(transaction.date)}
        </time>
      ),
    },
    {
      label: t("dashboard.transaction.category"),
      value: (
        <span className="flex items-center gap-2">
          <CategoryBadge
            category={transaction.category}
            icon={transaction.icon}
            size="sm"
          />
          {transaction.category}
        </span>
      ),
    },
    {
      label: t("dashboard.transaction.description"),
      value: transaction.description,
    },
    {
      label: t("dashboard.transaction.paymentMethod"),
      value: transaction.paymentMethod,
    },
    {
      label: t("dashboard.transaction.reference"),
      value: <span className="font-mono text-xs">{transaction.id}</span>,
    },
  ];

  return (
    // Phones: bottom sheet. md and up: full-height panel from the right.
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
      <div
        aria-hidden
        data-testid="transaction-drawer-backdrop"
        className={`absolute inset-0 bg-heading/40 motion-reduce:animate-none ${closing ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        style={{ height: sheet.height }}
        className={`relative flex w-full flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl motion-reduce:animate-none motion-reduce:transition-none md:max-w-sm md:rounded-none md:pt-2 ${sheet.dragging ? "" : "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"} ${closing ? "animate-sheet-out md:animate-panel-out" : "animate-sheet-in md:animate-panel-in"}`}
      >
        {/* Drag area (phones): the handle and title bar resize the sheet. */}
        <div
          ref={headerRef}
          {...sheet.dragHandlers}
          className="cursor-grab touch-none select-none active:cursor-grabbing md:cursor-auto md:touch-auto"
        >
          <div className="flex justify-center pt-2 md:hidden">
            {sheet.canExpand ? (
              <button
                type="button"
                onClick={sheet.toggle}
                aria-label={
                  sheet.expanded
                    ? t("dashboard.transaction.collapse")
                    : t("dashboard.transaction.expand")
                }
                className="flex h-6 w-16 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="h-1.5 w-10 rounded-full bg-slate-300" />
              </button>
            ) : (
              <span
                aria-hidden
                className="flex h-6 w-16 items-center justify-center"
              >
                <span className="h-1.5 w-10 rounded-full bg-slate-300" />
              </span>
            )}
          </div>

          <div className="flex items-center justify-between px-5 pt-1 pb-3">
            <h2 id={titleId} className="font-semibold text-heading">
              {t("dashboard.transaction.title")}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label={t("dashboard.transaction.close")}
              className="rounded-full p-2 text-body hover:bg-dashboard hover:text-primary"
            >
              <LuX className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div ref={contentRef} className="px-5 pb-6">
            <div className="flex flex-col items-center text-center">
              <p className="text-lg font-semibold text-heading">
                {transaction.merchant}
              </p>
              <p className="mt-1 text-3xl font-bold text-heading">
                <span className="sr-only">
                  {t("dashboard.transaction.amount")}:{" "}
                </span>
                {formatCurrency(transaction.amount, currency)}
              </p>
            </div>

            <dl className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200/80">
              {details.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <dt className="text-body">{label}</dt>
                  <dd className="text-right font-medium text-heading">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
