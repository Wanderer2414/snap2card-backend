import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../controllers/router.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Endpoint {
  name: string;
  method: HttpMethod;
  path: string;
  auth: boolean;
}

export const config = {
  name: "Snap2Card",
  version: "1.0",
  basePath: "/snap2card/api/v1.0"
};

export const endpointDefinitions = [
  { name: "account-login", method: "POST", path: "/account/login", auth: false },
  { name: "account-retrieve", method: "GET", path: "/account", auth: true },
  { name: "account-edit", method: "PUT", path: "/account", auth: true },
  { name: "account-logout", method: "POST", path: "/account/logout", auth: true },
  { name: "activities-retrieve", method: "GET", path: "/activities", auth: true },
  { name: "card-create", method: "POST", path: "/cards", auth: true },
  { name: "card-edit", method: "PUT", path: "/cards", auth: true },
  { name: "card-list", method: "GET", path: "/cards/list", auth: true },
  { name: "card-retrieve", method: "GET", path: "/cards", auth: true },
  { name: "category-edit", method: "PUT", path: "/categories", auth: true },
  { name: "category-list", method: "GET", path: "/categories/list", auth: true },
  { name: "category-retrieve", method: "GET", path: "/categories", auth: true },
  { name: "history-retrieve", method: "GET", path: "/history", auth: true },
] as const;

export type EndpointName = (typeof endpointDefinitions)[number]["name"];

export const endpoints: readonly Endpoint[] = endpointDefinitions.map((definition) => ({
  name: definition.name,
  method: definition.method,
  path: definition.path,
  auth: definition.auth
}));

export function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export const handlers = {} as Record<EndpointName, Handler>;
for (const definition of endpointDefinitions) {
  handlers[definition.name] = (_req, res) => {
    sendJson(res, 501, { status: "error", message: "Not implemented" });
  };
}