import http from "node:http"
import fs from "node:fs"
import { gunzip as gunzipCb } from "node:zlib"
import { promisify } from "node:util"
import request from "supertest"
import app from "~/index"

const gunzip = promisify(gunzipCb)

test("GET /", async () => {
  const response = await request(app).get("/")

  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual({ code: "ok" })
})

describe("POST /convert", () => {
  const port = 10000 + Math.floor(Math.random() * 10000)
  let testServer: http.Server
  beforeAll(() => {
    testServer = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" })
      fs.createReadStream("src/__tests__/assets/test.sus").pipe(res)
    })

    testServer.listen(port)
  })
  afterAll(() => {
    testServer.close()
  })

  it("can convert sus file", async () => {
    const response = await request(app)
      .post("/convert")
      .send({
        url: `http://127.0.0.1:${port}`,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ code: "ok", id: expect.any(String) })
  })

  test("GET /download/:id can download converted file", async () => {
    const convertResponse = await request(app)
      .post("/convert")
      .send({
        url: `http://127.0.0.1:${port}`,
      })
    const { id } = convertResponse.body

    const response = await request(app).get(`/download/${id}`)

    expect(response.statusCode).toBe(200)

    const buffer = await gunzip(response.body)

    expect(() => JSON.parse(buffer.toString())).not.toThrow()
  })

  test("GET /download/:id deletes file after download", async () => {
    const convertResponse = await request(app)
      .post("/convert")
      .send({
        url: `http://127.0.0.1:${port}`,
      })
    const { id } = convertResponse.body

    const response = await request(app).get(`/download/${id}`)

    expect(response.statusCode).toBe(200)

    const response2 = await request(app).get(`/download/${id}`)

    expect(response2.statusCode).toBe(404)
  })
})
