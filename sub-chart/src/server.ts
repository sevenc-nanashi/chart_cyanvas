import { promisify } from "node:util";
import { gzip as gzipBase } from "node:zlib";
import { sentry } from "@hono/sentry";
import { zValidator } from "@hono/zod-validator";
import dotenv from "dotenv";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { uscToLevelData } from "sonolus-pjsekai-engine-extended/dist/convert.js";
import { anyToUSC } from "usctool";
import * as z from "zod";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: "../.env", quiet: true });

const sentryEnabled = !!process.env.SENTRY_DSN_SUB_CHART;

const gzip = promisify(gzipBase);

const app = new Hono();

if (sentryEnabled) {
  app.use("*", sentry({ dsn: process.env.SENTRY_DSN_SUB_CHART }));
}

const HOSTS_SUB_TEMP_STORAGE = process.env.HOSTS_SUB_TEMP_STORAGE;
if (!HOSTS_SUB_TEMP_STORAGE) {
  throw new Error("HOSTS_SUB_STORAGE is not defined");
}

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
    const { url } = c.req.valid("json");

    try {
      console.log("Converting", url);
      const chart = await fetch(url);
      if (!chart.ok) {
        return c.json(
          {
            code: "invalid_request",
            message: "Failed to get chart file",
          },
          400,
        );
      }
      const { format, usc } = anyToUSC(
        new Uint8Array(await chart.arrayBuffer()),
      );
      console.log(`Converted from ${format} to USC`);

      const baseJson = uscToLevelData(usc);
      const json = JSON.stringify(baseJson);
      const buffer = Buffer.from(json);
      const compressed = await gzip(buffer);
      const uploadResponse = await fetch(`${HOSTS_SUB_TEMP_STORAGE}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Encoding": "gzip",
        },
        body: compressed,
      });
      if (!uploadResponse.ok) {
        return c.json(
          {
            code: "internal_server_error",
            message: "Failed to upload converted chart",
          },
          500,
        );
      }
      const { url: dataUrl } = await uploadResponse.json();

      return c.json({ code: "ok", url: dataUrl, type: format });
    } catch (e) {
      console.error("Failed to convert", e);
      return c.json({ code: "internal_server_error", error: String(e) }, 500);
    }
  },
);

export default app;
