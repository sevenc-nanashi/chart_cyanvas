import { useEffect, useRef } from "react"
import useTranslation from "next-translate/useTranslation"
import { useInView } from "react-intersection-observer"
import ChartCard from "./ChartCard"

type SectionItem = {
  title: string
  items: Chart[]
  itemsCountPerPage: number
  fetchMore: () => Promise<void>
  isFinished: boolean
}

const ChartSectionItem: React.FC<{
  section: SectionItem
}> = ({ section }) => {
  const { ref: firstDummyChartRef, inView: isFirstDummyChartInView } =
    useInView({
      rootMargin: "0px 1000px 0px 0px",
    })

  const isFetching = useRef(false)

  useEffect(() => {
    if (section.isFinished) return
    if (isFetching.current) return
    if (!isFirstDummyChartInView) return
    if (section.items && section.items.length < section.itemsCountPerPage)
      return
    isFetching.current = true
    section.fetchMore().finally(() => {
      setTimeout(() => {
        isFetching.current = false
      }, 0)
    })
  }, [isFirstDummyChartInView, section])

  return (
    <>
      {(section.items || [])
        .filter(
          (item, index) =>
            section.items.findIndex((i) => i.name === item.name) === index
        )
        .map((chart) => <ChartCard key={chart.name} data={chart} />)
        .concat(
          section.isFinished
            ? []
            : [...Array(5)].map((_, i) => (
                <ChartCard
                  key={i}
                  ref={i === 0 ? firstDummyChartRef : undefined}
                />
              ))
        )}
    </>
  )
}

const ChartSection: React.FC<{
  items: (Omit<SectionItem, "items"> & { items: Chart[] | null })[]
}> = ({ items }) => {
  const { t } = useTranslation("chartSection")
  return (
    <>
      {items.map((section, i) => (
        <div className="flex flex-col mt-8" key={i}>
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <div className="overflow-x-scroll">
            <div className="flex flex-nowrap flex-shrink min-h-[208px] mt-4 gap-4 relative min-w-max">
              {section.items == null || section.items.length > 0 ? (
                <ChartSectionItem section={section as SectionItem} />
              ) : (
                <p className="text-lg">{t("notFound")}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default ChartSection
