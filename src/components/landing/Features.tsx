import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import {
  LuChartNoAxesColumnIncreasing,
  LuChartPie,
  LuFileText,
  LuTarget,
} from "react-icons/lu";

const FEATURES = [
  { key: "trends", icon: LuChartNoAxesColumnIncreasing },
  { key: "categories", icon: LuChartPie },
  { key: "transactions", icon: LuFileText },
  { key: "goals", icon: LuTarget },
] as const satisfies readonly { key: string; icon: IconType }[];

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <h2 id="features-heading" className="sr-only">
          {t("features.heading")}
        </h2>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon }) => (
            <li key={key}>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Icon className="size-8" aria-hidden />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-heading">
                {t(`features.${key}.title`)}
              </h3>
              <p className="mt-3 max-w-64 leading-relaxed text-body">
                {t(`features.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
