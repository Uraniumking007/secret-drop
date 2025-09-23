import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouter } from "./router";

// Export the Start handler used by the runtime adapter (Bun in our case)
const handler = createStartHandler({
  createRouter,
})(defaultStreamHandler);

export default handler;
