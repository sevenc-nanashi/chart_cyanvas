import { ArrowRightFilled } from "@fluentui/react-icons";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Await, Link } from "react-router";
import type { Chart } from "~/lib/types.ts";
import ChartCard from "./ChartCard.tsx";

const ChartSection: React.FC<{
  sections: {
    title: string;
    items: Chart[] | Promise<Chart[]>;
    listUrl?: string | undefined;
  }[];
}> = ({ sections }) => {
  const { t } = useTranslation("chartSection");
  return (
    <>
      {sections.map((section, i) => (
        <div className="flex flex-col mt-8" key={i}>
          <h2 className="text-2xl font-bold flex items-center">
            {section.listUrl ? (
              <>
                <Link
                  to={section.listUrl}
                  className="flex items-center gray-link"
                >
                  {section.title}
                  <ArrowRightFilled className="ml-2" />
                </Link>
              </>
            ) : (
              section.title
            )}
          </h2>
          <div className="overflow-x-scroll">
            <div className="flex flex-nowrap flex-shrink min-h-[208px] mt-4 gap-4 relative min-w-max">
              <Suspense
                fallback={new Array(5)
                  .fill(undefined)
                  .map((_, i) => <ChartCard data={undefined} key={i} />)}
              >
                <Await resolve={section.items}>
                  {(items) =>
                    items.length > 0 ? (
                      items.map((chart) => (
                        <ChartCard key={chart.name} data={chart} />
                      ))
                    ) : (
                      <p className="text-lg">{t("notFound")}</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChartSection;
