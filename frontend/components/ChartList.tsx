import { ArrowLeftFilled, ArrowRightFilled } from "@fluentui/react-icons";
import { debounce } from "@std/async";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "react-headless-pagination";
import type { Chart } from "~/lib/types.ts";
import ChartCard from "./ChartCard.tsx";

export const ChartList: React.FC<{
  fetchCharts: (
    page: number,
  ) => Promise<{ charts: Chart[]; totalPages: number }>;

  onEmpty: () => React.ReactNode;
  pagination?: boolean;
}> = (props) => {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [charts, setCharts] = useState<Chart[] | undefined>(undefined);
  const fetchNonce = useRef(0);
  const initialFetch = useRef(true);
  const switchPage = useCallback(
    async (page: number) => {
      if (page < 0 || page >= totalPages) return;
      const nonce = ++fetchNonce.current;

      const { charts, totalPages: fetchedTotalPages } =
        await props.fetchCharts(page);

      if (nonce !== fetchNonce.current) return;

      setCharts(charts);
      setTotalPages(fetchedTotalPages);
    },
    [props.fetchCharts, totalPages],
  );
  useEffect(() => {
    if (initialFetch.current) {
      initialFetch.current = false;

      switchPage(0);
    }
  }, [switchPage]);
  const debouncedHandlePageChange = useMemo(
    () => debounce(switchPage, 500),
    [switchPage],
  );
  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      setCharts(undefined);
      debouncedHandlePageChange(page);
    },
    [debouncedHandlePageChange],
  );

  return (
    <div className="flex flex-col">
      {props.pagination && charts?.length !== 0 && (
        <Pagination
          currentPage={page}
          setCurrentPage={handlePageChange}
          totalPages={totalPages}
          edgePageCount={2}
          middlePagesSiblingCount={2}
          truncableText="..."
          className="flex flex-row justify-center items-center"
        >
          <Pagination.PrevButton
            className={clsx("gray-link", page === 0 && "disabled")}
          >
            <ArrowLeftFilled />
          </Pagination.PrevButton>

          <ul className="flex items-center px-2 gap-2">
            <Pagination.PageButton
              activeClassName="theme-link"
              inactiveClassName="gray-link"
              className="cursor-pointer no-underline"
            />
          </ul>

          <Pagination.NextButton
            className={clsx("gray-link", page === totalPages - 1 && "disabled")}
          >
            <ArrowRightFilled />
          </Pagination.NextButton>
        </Pagination>
      )}
      <div className="flex flex-col md:flex-row md:flex-wrap mt-2 gap-x-4 justify-center">
        {charts !== undefined
          ? charts.map((chart) => (
              <ChartCard key={chart.name} data={chart} className="mb-4" />
            ))
          : new Array(20)
              .fill(undefined)
              .map((_, i) => (
                <ChartCard data={undefined} key={i} className="mb-4" />
              ))}

        {charts?.length !== 0 &&
          new Array(20)
            .fill(undefined)
            .map((_, i) => <ChartCard spacer key={i} />)}
        {charts?.length === 0 && props.onEmpty()}
      </div>
      {props.pagination && charts?.length !== 0 && (
        <Pagination
          currentPage={page}
          setCurrentPage={handlePageChange}
          totalPages={totalPages}
          edgePageCount={2}
          middlePagesSiblingCount={2}
          truncableText="..."
          className="flex flex-row justify-center items-center"
        >
          <Pagination.PrevButton
            className={clsx("gray-link", page === 0 && "disabled")}
          >
            <ArrowLeftFilled />
          </Pagination.PrevButton>

          <ul className="flex items-center px-2 gap-2">
            <Pagination.PageButton
              activeClassName="theme-link"
              inactiveClassName="gray-link"
              className="cursor-pointer no-underline"
            />
          </ul>

          <Pagination.NextButton
            className={clsx("gray-link", page === totalPages - 1 && "disabled")}
          >
            <ArrowRightFilled />
          </Pagination.NextButton>
        </Pagination>
      )}
    </div>
  );
};

export default ChartList;
