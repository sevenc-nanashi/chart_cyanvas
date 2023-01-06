import { gzip as gzipBase } from "zlib"
import { promisify } from "util"
import { randomUUID } from "crypto"
import { temporaryWrite } from "tempy"
import { promises as fs } from "fs"

import Express, { json as jsonHandler } from "express"
import morgan from "morgan"
import { fromSus } from "sonolus-pjsekai-engine-extended"
import dotenv from "dotenv"
import axios from "axios"
import urlJoin from "url-join"

dotenv.config({ path: ".env" })
dotenv.config({ path: "../.env" })

const gzip = promisify(gzipBase)

const app = Express()

const files = new Map<string, { path: string; date: Date }>()

const BACKEND_HOST = process.env.BACKEND_HOST!

app.use(jsonHandler())
app.use(morgan("combined"))
app.get("/", (_req, res) => {
  res.json({ code: "ok", name: "sub-sus" })
})

app.post("/convert", async (req, res) => {
  const { url: originalUrl } = req.body as { url: string }
  const url = urlJoin(BACKEND_HOST, originalUrl)

  try {
    console.log("Converting", url)
    const sus = await axios.get(url, {
      responseType: "text",
    })
    if (sus.status !== 200) {
      res
        .status(400)
        .json({ code: "invalid_request", message: "Failed to get sus file" })
      return
    }
    const baseJson = fromSus(sus.data)
    const json = JSON.stringify(baseJson)
    const buffer = Buffer.from(json)
    const compressed = await gzip(buffer)
    const tempFile = await temporaryWrite(compressed)

    const id = randomUUID()
    files.set(id, { path: tempFile, date: new Date() })

    console.log("Registered as", id)

    res.json({ code: "ok", id })
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

app.listen(3201, () => {
  console.log(`BACKEND_HOST = ${BACKEND_HOST}`)
  console.log("Listening on port 3201")
})
