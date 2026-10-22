import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { EmptyState } from "../../components/dashboard/Panel";

/** Placeholder for dashboard sections that aren't built yet. */
export function ComingSoonPage({ title }: { title: string }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <PageHeader title={title} />
      <div className="rounded-2xl border border-slate-200/80 bg-white">
        <EmptyState message={t("dashboard.comingSoon")} />
      </div>
    </div>
  );
}
