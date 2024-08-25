import { useTranslation } from "react-i18next";
import type { Chart } from "~/lib/types.ts";
import ChartCard from "./ChartCard.tsx";
import { ArrowRightFilled } from "@fluentui/react-icons";
import { Link } from "@remix-run/react";

const ChartSection: React.FC<{
  sections: {
    title: string;
    items: Chart[];
    hasMore: boolean;
    listUrl?: string | undefined;
  }[];
}> = ({ sections }) => {
  const { t } = useTranslation("chartSection");
  return (
    <>
      {sections.map((section, i) => (
        <div className="flex flex-col mt-8" key={i}>
          <h2 className="text-2xl font-bold flex items-center">
            {section.title}
            {section.listUrl && (
              <Link to={section.listUrl} className="ml-2 flex items-center">
                <ArrowRightFilled className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300" />
              </Link>
            )}
          </h2>
          <div className="overflow-x-scroll">
            <div className="flex flex-nowrap flex-shrink min-h-[208px] mt-4 gap-4 relative min-w-max">
              {section.items.length > 0 ? (
                section.items.map((chart) => (
                  <ChartCard key={chart.name} data={chart} />
                ))
              ) : (
                <p className="text-lg">{t("notFound")}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChartSection;
