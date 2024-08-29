import { gzip as gzipBase } from "node:zlib";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { Readable } from "node:stream";
import { write as temporaryWrite } from "tempy";
import axios from "axios";
import dotenv from "dotenv";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { stream } from "hono/streaming";
import { sentry } from "@hono/sentry";
import { anyToUSC } from "usctool";
import { uscToLevelData } from "sonolus-pjsekai-engine-extended/dist/convert.cjs";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import urlJoin from "url-join";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });

const sentryEnabled = !!process.env.SENTRY_DSN_SUB_CHART;

const gzip = promisify(gzipBase);

const app = new Hono();

if (sentryEnabled) {
  app.use("*", sentry({ dsn: process.env.SENTRY_DSN_SUB_CHART }));
}

const files = new Map<string, { path: string; date: Date }>();

const HOSTS_BACKEND = process.env.HOSTS_BACKEND!;

app.use(logger());
app.get("/", (c) => {
  return c.json({ code: "ok" });
});

app.post(
  "/convert",
  zValidator(
    "json",
    z.object({
      url: z.string(),
    }),
  ),
  async (c) => {
    const { url: originalUrl } = c.req.valid("json");
    const url = originalUrl.startsWith("http")
      ? originalUrl
      : urlJoin(HOSTS_BACKEND, originalUrl);

    try {
      console.log("Converting", url);
      const chart = await axios.get(url, {
        responseType: "arraybuffer",
      });
      if (chart.status !== 200) {
        return c.json(
          {
            code: "invalid_request",
            message: "Failed to get chart file",
          },
          400,
        );
      }
      const { format, usc } = anyToUSC(chart.data);
      console.log(`Converted from ${format} to USC`);

      const baseJson = uscToLevelData(usc);
      const json = JSON.stringify(baseJson);
      const buffer = Buffer.from(json);
      const compressed = await gzip(buffer);
      const tempFile = await temporaryWrite(compressed);

      const id = randomUUID();
      files.set(id, { path: tempFile, date: new Date() });

      console.log("Registered as", id);

      return c.json({ code: "ok", id, type: format });
    } catch (e) {
      console.error("Failed to convert", e);
      return c.json({ code: "internal_server_error", error: String(e) }, 500);
    }
  },
);

app.get("/download/:id", async (c) => {
  const id = c.req.param("id");

  const file = files.get(id);
  if (!file) {
    return c.json({ code: "not_found", message: "File not found" }, 404);
  }

  return stream(c, async (stream) => {
    const fileStream = fs.createReadStream(file.path);
    const webStream = Readable.toWeb(fileStream) as ReadableStream;
    await stream.pipe(webStream);

    files.delete(id);
    await fs.promises.unlink(file.path);
    console.log("Deleted", id);
  });
});

export default app;
