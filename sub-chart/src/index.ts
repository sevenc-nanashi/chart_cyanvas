import { gzip as gzipBase } from "zlib"
import { promisify } from "util"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import { write as temporaryWrite } from "tempy"

import axios from "axios"
import dotenv from "dotenv"
import Express, { json as jsonHandler } from "express"
import morgan from "morgan"
import {
  mmwsToUSC,
  susToUSC,
  chsToUSC,
  USC,
  uscToLevelData,
} from "sonolus-pjsekai-engine-extended"
import * as sentry from "@sentry/node"
import urlJoin from "url-join"

dotenv.config({ path: ".env" })
dotenv.config({ path: "../.env" })

const sentryEnabled = !!process.env.SENTRY_DSN_SUB_CHART

const gzip = promisify(gzipBase)

const app = Express()

if (sentryEnabled) {
  const tracesSampleRate = parseFloat(
    process.env.SENTRY_TRACE_SAMPLE_RATE || "0.1"
  )
  sentry.init({
    dsn: process.env.SENTRY_DSN_SUB_CHART,
    tracesSampleRate,
  })
}

const files = new Map<string, { path: string; date: Date }>()

const BACKEND_HOST = process.env.BACKEND_HOST!

if (sentryEnabled) app.use(sentry.Handlers.requestHandler())

app.use(jsonHandler())
app.use(morgan("combined"))
app.get("/", (_req, res) => {
  res.json({ code: "ok" })
})

app.post("/convert", async (req, res) => {
  const { url: originalUrl } = req.body as { url: string }
  const url = originalUrl.startsWith("http")
    ? originalUrl
    : urlJoin(BACKEND_HOST, originalUrl)

  try {
    console.log("Converting", url)
    const chart = await axios.get(url, {
      responseType: "arraybuffer",
    })
    if (chart.status !== 200) {
      res
        .status(400)
        .json({ code: "invalid_request", message: "Failed to get chart file" })
      return
    }
    let type: "sus" | "mmws" | "chs"
    let usc: USC
    if (
      Buffer.from(chart.data.slice(0, 2)).compare(Buffer.from([0x1f, 0x8b])) ===
      0
    ) {
      type = "chs"
      console.log("Guessing type as", type)
      usc = chsToUSC(Buffer.from(chart.data))
    } else if (chart.data.slice(0, 4).toString() === "MMWS") {
      type = "mmws"
      console.log("Guessing type as", type)
      usc = mmwsToUSC(Buffer.from(chart.data))
    } else {
      type = "sus"
      console.log("Guessing type as", type)
      usc = susToUSC(chart.data.toString())
    }

    const baseJson = uscToLevelData(usc)
    const json = JSON.stringify(baseJson)
    const buffer = Buffer.from(json)
    const compressed = await gzip(buffer)
    const tempFile = await temporaryWrite(compressed)

    const id = randomUUID()
    files.set(id, { path: tempFile, date: new Date() })

    console.log("Registered as", id)

    res.json({ code: "ok", id, type })
  } catch (e) {
    console.error("Failed to convert", e)
    res.status(500).json({ code: "internal_server_error" })
  }
})

app.get("/download/:id", async (req, res) => {
  const { id } = req.params

  const file = files.get(id)
  if (!file) {
    res.status(404).json({ code: "not_found", message: "File not found" })
    return
  }

  res.sendFile(file.path)
  res.on("finish", () => {
    files.delete(id)
    fs.unlink(file.path)
    console.log("Deleted", id)
  })
})

if (sentryEnabled) app.use(sentry.Handlers.errorHandler())

if (require.main === module) {
  app.listen(3201, () => {
    console.log(`BACKEND_HOST = ${BACKEND_HOST}`)
    console.log("Listening on port 3201")
  })
}

export default app
