
import type { IncomingMessage, ServerResponse } from "node:http";
import type { RouteContext } from "../controllers/router.js";
import type { EndpointName } from "../config.js";

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext
) => Promise<void>;

export type HandlerMap = Partial<Record<EndpointName, Handler>>;