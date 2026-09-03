import type { IncomingMessage, ServerResponse } from "node:http";
import { config, endpoints } from "../config.js";
import type { Endpoint, EndpointName, HttpMethod } from "../config.js";
import type { HandlerMap } from "../shared_type/handler.js";
import { sendError } from "../shared_functions/send.js";
import { errors } from "../configs/errors.js"

const routes = new Map<string, Endpoint>();
for (const endpoint of endpoints) {
  routes.set(`${endpoint.method} ${endpoint.path}`, endpoint);
}

export interface RouteContext {
  endpoint: Endpoint;
  token: string | null;
  query: URLSearchParams;
}

export interface ResolvedRoute {
  endpoint: Endpoint | null;
  token: string | null;
  query: URLSearchParams;
  versionMismatch: boolean;
}

export function analyzeUrl(url: string): {
  path: string;
  query: URLSearchParams;
  versionMismatch: boolean;
} {
  const { pathname, searchParams } = new URL(url, "http://localhost");
  const isApiRequest = pathname.startsWith("/snap2card/api/");
  const versionMismatch = isApiRequest && !pathname.startsWith(config.basePath);
  const stripped = pathname.startsWith(config.basePath)
    ? pathname.slice(config.basePath.length)
    : pathname;
  const path = stripped === "" || stripped === "/" ? "/" : stripped.startsWith("/") ? stripped : `/${stripped}`;
  return { path, query: searchParams, versionMismatch };
}

export function extractBearerToken(authorization: string | undefined): string | null {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export const router = {
  options: { basePath: config.basePath, version: config.version },
  endpoints,

  resolve(req: IncomingMessage): ResolvedRoute {
    const { path, query, versionMismatch } = analyzeUrl(req.url ?? "");
    const method = (req.method ?? "GET").toUpperCase() as HttpMethod;
    const endpoint = routes.get(`${method} ${path}`) ?? null;
    const token = extractBearerToken(req.headers.authorization);
    return { endpoint, token, query, versionMismatch };
  },

  route(
    req: IncomingMessage,
    res: ServerResponse,
    handlers: HandlerMap
  ): void {
    const { endpoint, token, query, versionMismatch } = this.resolve(req);

    if (versionMismatch) {
      sendError(req, res, errors.versionMismatch);
      return;
    }

    if (endpoint === null) {
      sendError(req, res, errors.notFound);
      return;
    }

    if (endpoint.auth && token === null) {
      sendError(req, res, errors.invalidOrExpiredToken);
      return;
    }

    if (!(req.headers["content-type"] ?? "").toLowerCase().includes(endpoint.contentType)) {
      sendError(req, res, errors.unsupportedContentType);
      return;
    }

    var handler = undefined;
    try {
      handler = handlers[endpoint.name as EndpointName];
    }
    catch (e) {
      console.log(e)
      sendError(req, res, errors.notFound)
    }
    if (handler === undefined) {
      sendError(req, res, errors.internalServerError);
      return;
    }

    void handler(req, res, { endpoint, token, query });
  },
};