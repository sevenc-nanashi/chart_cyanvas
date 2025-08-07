import fs from "node:fs";
import http from "node:http";
import { promisify } from "node:util";
import { gunzip as gunzipCb } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import app from "~/server.ts";

const gunzip = promisify(gunzipCb);

test("GET /", async () => {
  const response = await app.request("/");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ code: "ok" });
});

describe("POST /convert", () => {
  const port = 10000 + Math.floor(Math.random() * 10000);
  let testServer: http.Server;
  beforeAll(() => {
    testServer = http.createServer((req, res) => {
      const path = req.url?.slice(1);
      if (!path || !fs.existsSync(`src/__tests__/assets/${path}`)) {
        res.statusCode = 404;
        res.end();
        return;
      }

      fs.createReadStream(`src/__tests__/assets/${path}`).pipe(res);
    });

    testServer.listen(port);
  });
  afterAll(() => {
    testServer.close();
  });

  for (const [type, name, path] of [
    ["sus", "sus", "test.sus"],
    ["mmws", "mmws", "test.mmws"],
    ["ccmmws", "ccmmws", "test.ccmmws"],
    ["chs", "ched2", "ched2.chs"],
    ["chs", "ched3", "ched3.chs"],
    ["vusc", "vusc", "test.usc"],
  ] as const) {
    it(`can convert ${name} file`, async () => {
      const response = await app.request("/convert", {
        method: "POST",
        body: JSON.stringify({ url: `http://127.0.0.1:${port}/${path}` }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        code: "ok",
        url: expect.any(String),
        type,
      });
    });
  }

  test("POST /convert returns valid url", async () => {
    const convertResponse = await app.request("/convert", {
      method: "POST",
      body: JSON.stringify({
        url: `http://127.0.0.1:${port}/test.sus`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { url } = await convertResponse.json();

    const response = await fetch(url);

    expect(response.status).toBe(200);

    const buffer = await gunzip(await response.arrayBuffer());

    expect(() => JSON.parse(buffer.toString())).not.toThrow();
  });
});
