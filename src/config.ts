
import { login_handler as account_login_handler } from "./handlers/account_login.js";
import { account_retrieve_handler } from "./handlers/account_retrieve.js";
import { account_edit_handler } from "./handlers/account_edit.js";
import { account_logout_handler } from "./handlers/account_logout.js";
import { activities_retrieve_handler } from "./handlers/activities_retrieve.js";
import { card_create_handler } from "./handlers/card_create.js";
import { card_edit_handler } from "./handlers/card_edit.js";
import { card_list_handler } from "./handlers/card_list.js";
import { card_retrieve_handler } from "./handlers/card_retrieve.js";
import { category_edit_handler } from "./handlers/category_edit.js";
import { category_list_handler } from "./handlers/category_list.js";
import { category_retrieve_handler } from "./handlers/category_retrieve.js";
import { history_retrieve_handler } from "./handlers/history_retrieve.js";
import { exam_create_handler } from "./handlers/exam_create.js";
import { exam_start_handler } from "./handlers/exam_start.js";
import { exam_result_handler } from "./handlers/exam_result.js";
import { exam_review_handler } from "./handlers/exam_review.js";
import { account_register_handler } from "./handlers/account_register.js";
import { category_create_handler } from "./handlers/category_create.js";
import { category_to_card_handler } from "./handlers/category_to_card.js";
import { card_to_category_handler } from "./handlers/card_to_category.js";
import { category_log_related_handler } from "./handlers/category_log_related.js";
import { exam_completed_handler } from "./handlers/exam_completed.js";
import { sendJson } from "./shared_functions/send.js";
import type { Handler } from "./shared_type/handler.js";

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
  basePath: "/snap2card/api/v1.0",
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
  { name: "exam-create", method: "POST", path: "/exams/create", auth: true },
  { name: "exam-start", method: "POST", path: "/exams/start", auth: true },
  { name: "exam-result", method: "POST", path: "/exams/result", auth: true },
  { name: "exam-review", method: "GET", path: "/exams/review", auth: true },
  { name: "account-register", method: "POST", path: "/account/register", auth: false },
  { name: "category-create", method: "POST", path: "/categories", auth: true },
  { name: "category-to-card", method: "POST", path: "/cards/categorize", auth: true },
  { name: "card-to-category", method: "POST", path: "/categories/categorize", auth: true },
  { name: "category-log-related", method: "GET", path: "/categories/logs", auth: true },
  { name: "exam-completed", method: "POST", path: "/exams/completed", auth: true },
] as const;

export type EndpointName = (typeof endpointDefinitions)[number]["name"];

export const endpoints: readonly Endpoint[] = endpointDefinitions.map((definition) => ({
  name: definition.name,
  method: definition.method,
  path: definition.path,
  auth: definition.auth
}));

export const handlers = {} as Record<EndpointName, Handler>;

handlers["account-login"] = account_login_handler;
handlers["account-register"] = account_register_handler;
handlers["account-retrieve"] = account_retrieve_handler;
handlers["account-edit"] = account_edit_handler;
handlers["account-logout"] = account_logout_handler;
// handlers["activities-retrieve"] = activities_retrieve_handler;
handlers["card-create"] = card_create_handler;
// handlers["card-edit"] = card_edit_handler;
handlers["card-list"] = card_list_handler;
handlers["card-retrieve"] = card_retrieve_handler;
// handlers["category-edit"] = category_edit_handler;
handlers["category-list"] = category_list_handler;
handlers["category-retrieve"] = category_retrieve_handler;
handlers["category-create"] = category_create_handler;
handlers["category-to-card"] = category_to_card_handler;
handlers["card-to-category"] = card_to_category_handler;
handlers["category-log-related"] = category_log_related_handler;
handlers["exam-create"] = exam_create_handler;
handlers["exam-start"] = exam_start_handler;
handlers["exam-result"] = exam_result_handler;
handlers["exam-review"] = exam_review_handler;
handlers["exam-completed"] = exam_completed_handler;
// handlers["history-retrieve"] = history_retrieve_handler;

for (const definition of endpointDefinitions) {
  if (handlers[definition.name] == null)
    handlers[definition.name] = async (_req, res) => {
      sendJson(_req, res, 501, { status: "error", message: "Not implemented" });
    };
}