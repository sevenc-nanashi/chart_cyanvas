import { serve } from "@hono/node-server";
import app from "./server.ts";

const port = 3201;
serve({ port, fetch: app.fetch }, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
