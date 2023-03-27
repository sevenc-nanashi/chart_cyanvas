import { GetServerSideProps, NextPage } from "next"
import getConfig from "next/config"
import urlcat from "urlcat"
import UploadChart from "../upload"

const { serverRuntimeConfig } = getConfig()
export const getServerSideProps: GetServerSideProps = async (context) => {
  const chartData = await fetch(
    urlcat(serverRuntimeConfig.backendHost!, "/api/charts/:name", {
      name: context.params!.name,
    }),
    {
      method: "GET",
    }
  ).then(async (res) => {
    const json = await res.json()

    if (json.code === "ok") {
      return json.chart
    } else {
      return null
    }
  })

  if (!chartData) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {
      chartData,
    },
  }
}

const EditChart: NextPage<{ chartData: Chart }> = ({ chartData }) => {
  return (
    <UploadChart
      isEdit
      chartData={{
        title: chartData.title,
        description: chartData.description,
        composer: chartData.composer,
        artist: chartData.artist || "",
        tags: chartData.tags.map((tag) => ({ id: tag, text: tag })),
        rating: chartData.rating,
        authorHandle: chartData.author.handle,
        authorName: chartData.author.name,
        isPublic: chartData.isPublic,
        isSusPublic: !!chartData.sus,
        variant: chartData.variantOf?.name || "",

        chart: null,
        bgm: null,
        cover: null,
      }}
    />
  )
}

export default EditChart
