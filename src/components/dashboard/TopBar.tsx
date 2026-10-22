import { useTranslation } from "react-i18next";
import { LuBell, LuMenu } from "react-icons/lu";
import { initials } from "../../lib/format";

type TopBarProps = {
  name: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
};

export function TopBar({ name, menuOpen, onOpenMenu }: TopBarProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-dashboard/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={t("dashboard.nav.openMenu")}
        aria-expanded={menuOpen}
        aria-controls="dashboard-drawer"
        className="rounded-md p-1 text-heading hover:text-primary lg:hidden"
      >
        <LuMenu className="size-6" aria-hidden />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label={t("dashboard.topBar.notifications")}
          className="rounded-full p-2 text-heading hover:bg-white hover:text-primary"
        >
          <LuBell className="size-5" aria-hidden />
        </button>
        <span
          role="img"
          aria-label={t("dashboard.topBar.account", { name })}
          title={name}
          className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        >
          {initials(name)}
        </span>
      </div>
    </header>
  );
}
