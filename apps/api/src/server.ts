import { createServer } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { createSocketServer } from "./realtime/socket";

const app = createApp();
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
