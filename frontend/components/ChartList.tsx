import type { Chart } from "~/lib/types.ts";
import ChartCard from "./ChartCard.tsx";

export const ChartList: React.FC<{ charts: Chart[] | undefined }> = ({
  charts,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap mt-2 gap-4 justify-center">
      {charts !== undefined
        ? charts.map((chart) => <ChartCard key={chart.name} data={chart} />)
        : new Array(20)
            .fill(undefined)
            .map((_, i) => <ChartCard data={undefined} key={i} />)}

      {new Array(20).fill(undefined).map((_, i) => (
        <ChartCard spacer key={i} />
      ))}
    </div>
  );
};

export default ChartList;
