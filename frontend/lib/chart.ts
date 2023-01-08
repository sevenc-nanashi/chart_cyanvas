export const chartWithCookie = (chart: Chart) => {
  if (typeof window === "undefined") {
    return chart
  }
  const chartData = document.cookie.split(";").find((cookie) => {
    const [key] = cookie.split("=")
    return key.trim() === `chart:${chart.name}`
  })
  if (!chartData) {
    return chart
  }
  const data: Chart = JSON.parse(chartData.split("=")[1])
  if (data.updatedAt > chart.updatedAt) {
    return {
      ...chart,
      ...data,
    }
  }
  return chart
}

export const saveChart = (chart: Chart) => {
  if (typeof window === "undefined") {
    return
  }
  document.cookie = `chart:${chart.name}=${JSON.stringify(chart)}`
}
