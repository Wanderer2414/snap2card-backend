
import { login_handler as account_login_handler } from "./handlers/account/account_login.js";
import { account_retrieve_handler } from "./handlers/account/account_retrieve.js";
import { account_avatar_retrieve_handler } from "./handlers/account/account_avatar_retrieve.js";
import { account_avatar_update_handler } from "./handlers/account/account_avatar_update.js";
import { account_edit_handler } from "./handlers/account/account_edit.js";
import { account_logout_handler } from "./handlers/account/account_logout.js";
import { account_register_handler } from "./handlers/account/account_register.js";
import { activities_retrieve_handler } from "./handlers/activities/activities_retrieve.js";
import { card_create_manual_handler } from "./handlers/card/card_create_manual.js";
import { card_create_document_handler } from "./handlers/card/card_create_document.js";
import { card_create_pdf_handler } from "./handlers/card/card_create_pdf.js";
import { card_edit_handler } from "./handlers/card/card_edit.js";
import { card_list_handler } from "./handlers/card/card_list.js";
import { card_retrieve_handler } from "./handlers/card/card_retrieve.js";
import { card_to_category_handler } from "./handlers/card/card_to_category.js";
import { category_create_handler } from "./handlers/category/category_create.js";
import { category_edit_handler } from "./handlers/category/category_edit.js";
import { category_list_handler } from "./handlers/category/category_list.js";
import { category_retrieve_handler } from "./handlers/category/category_retrieve.js";
import { category_to_card_handler } from "./handlers/category/category_to_card.js";
import { category_log_related_handler } from "./handlers/category/category_log_related.js";
import { recent_category_take_list_handler } from "./handlers/category/recent_category_take_list.js";
import { history_retrieve_handler } from "./handlers/history/history_retrieve.js";
import { exam_create_handler } from "./handlers/exam/exam_create.js";
import { exam_start_handler } from "./handlers/exam/exam_start.js";
import { exam_result_handler } from "./handlers/exam/exam_result.js";
import { exam_review_handler } from "./handlers/exam/exam_review.js";
import { exam_completed_handler } from "./handlers/exam/exam_completed.js";
import { vocabulary_from_pdf_handler } from "./handlers/vocabulary/vocabulary_from_pdf.js";
import { vocabulary_from_text_handler } from "./handlers/vocabulary/vocabulary_from_text.js";
import { sendJson } from "./shared_functions/send.js";
import type { Handler } from "./shared_type/handler.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Endpoint {
  name: string;
  method: HttpMethod;
  path: string;
  auth: boolean;
  contentType: string;
}


export const config = {
  name: "Snap2Card",
  version: "1.0",
  basePath: "/snap2card/api/v1.0",
};

export interface EndpointDefinition {
  name: string;
  method: HttpMethod;
  path: string;
  auth: boolean;
  contentType: string;
}

export const endpointDefinitions: readonly EndpointDefinition[] = [
  { name: "account-login", method: "POST", path: "/account/login", auth: false, contentType: "application/json" },
  { name: "account-retrieve", method: "GET", path: "/account", auth: true, contentType: "application/json" },
  { name: "account-avatar-retrieve", method: "GET", path: "/account/avatar", auth: true, contentType: "application/json" },
  { name: "account-avatar-update", method: "PUT", path: "/account/avatar", auth: true, contentType: "image/" },
  { name: "account-edit", method: "PUT", path: "/account", auth: true, contentType: "application/json" },
  { name: "account-logout", method: "POST", path: "/account/logout", auth: true, contentType: "application/json" },
  { name: "activities-retrieve", method: "GET", path: "/activities", auth: true, contentType: "application/json" },
  { name: "card-create-pdf", method: "POST", path: "/cards/pdf", auth: true, contentType: "application/pdf" },
  { name: "card-create-document", method: "POST", path: "/cards/document", auth: true, contentType: "application/json" },
  { name: "card-create", method: "POST", path: "/cards", auth: true, contentType: "application/json" },
  { name: "card-edit", method: "PUT", path: "/cards", auth: true, contentType: "application/json" },
  { name: "card-list", method: "GET", path: "/cards/list", auth: true, contentType: "application/json" },
  { name: "card-retrieve", method: "GET", path: "/cards", auth: true, contentType: "application/json" },
  { name: "category-edit", method: "PUT", path: "/categories", auth: true, contentType: "application/json" },
  { name: "category-list", method: "GET", path: "/categories/list", auth: true, contentType: "application/json" },
  { name: "category-retrieve", method: "GET", path: "/categories", auth: true, contentType: "application/json" },
  { name: "history-retrieve", method: "GET", path: "/history", auth: true, contentType: "application/json" },
  { name: "exam-create", method: "POST", path: "/exams/create", auth: true, contentType: "application/json" },
  { name: "exam-start", method: "POST", path: "/exams/start", auth: true, contentType: "application/json" },
  { name: "exam-result", method: "POST", path: "/exams/result", auth: true, contentType: "application/json" },
  { name: "exam-review", method: "GET", path: "/exams/review", auth: true, contentType: "application/json" },
  { name: "account-register", method: "POST", path: "/account/register", auth: false, contentType: "application/json" },
  { name: "category-create", method: "POST", path: "/categories", auth: true, contentType: "application/json" },
  { name: "category-to-card", method: "POST", path: "/cards/categorize", auth: true, contentType: "application/json" },
  { name: "card-to-category", method: "POST", path: "/categories/categorize", auth: true, contentType: "application/json" },
  { name: "category-log-related", method: "GET", path: "/categories/logs", auth: true, contentType: "application/json" },
  { name: "recent-category-take-list", method: "GET", path: "/categories/recent", auth: true, contentType: "application/json" },
  { name: "exam-completed", method: "POST", path: "/exams/completed", auth: true, contentType: "application/json" },
  { name: "vocabulary-from-text", method: "POST", path: "/vocabulary/from-text", auth: true, contentType: "application/json" },
  { name: "vocabulary-from-pdf", method: "POST", path: "/vocabulary/from-pdf", auth: true, contentType: "application/pdf" },
] as const;

export type EndpointName = (typeof endpointDefinitions)[number]["name"];

export const endpoints: readonly Endpoint[] = endpointDefinitions.map((definition) => ({
  name: definition.name,
  method: definition.method,
  path: definition.path,
  auth: definition.auth,
  contentType: definition.contentType,
}));

export const handlers = {} as Record<EndpointName, Handler>;

handlers["account-login"] = account_login_handler;
handlers["account-register"] = account_register_handler;
handlers["account-retrieve"] = account_retrieve_handler;
handlers["account-avatar-retrieve"] = account_avatar_retrieve_handler;
handlers["account-avatar-update"] = account_avatar_update_handler;
handlers["account-edit"] = account_edit_handler;
handlers["account-logout"] = account_logout_handler;
// handlers["activities-retrieve"] = activities_retrieve_handler;
handlers["card-create-pdf"] = card_create_pdf_handler;
handlers["card-create-document"] = card_create_document_handler;
handlers["card-create"] = card_create_manual_handler;
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
handlers["recent-category-take-list"] = recent_category_take_list_handler;
handlers["exam-create"] = exam_create_handler;
handlers["exam-start"] = exam_start_handler;
handlers["exam-result"] = exam_result_handler;
handlers["exam-review"] = exam_review_handler;
handlers["exam-completed"] = exam_completed_handler;
// handlers["history-retrieve"] = history_retrieve_handler;
handlers["vocabulary-from-text"] = vocabulary_from_text_handler;
handlers["vocabulary-from-pdf"] = vocabulary_from_pdf_handler;

for (const definition of endpointDefinitions) {
  if (handlers[definition.name] == null)
    handlers[definition.name] = async (_req, res) => {
      sendJson(_req, res, 501, { status: "error", message: "Not implemented" });
    };
}
