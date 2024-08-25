import { useTranslation } from "react-i18next";
import type { Chart } from "~/lib/types.ts";
import ChartCard from "./ChartCard.tsx";

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
          <h2 className="text-2xl font-bold">{section.title}</h2>
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
