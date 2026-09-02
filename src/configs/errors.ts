export interface ErrorBody {
  status: "error";
  message: string;
}

export interface ApiError {
  code: number;
  message: string;
}

export const errors = {
  invalidInputData: { code: 400, message: "Invalid input data" },
  missingRequiredField: (field: string): ApiError => ({
    code: 400,
    message: `Missing required field: ${field}`,
  }),
  invalidOrExpiredToken: { code: 401, message: "Invalid or expired token" },
  invalidEmailOrPassword: { code: 401, message: "Invalid email or password" },
  cardNotFound: { code: 404, message: "Card not found" },
  categoryNotFound: { code: 404, message: "Category not found" },
  notFound: { code: 404, message: "Not found" },
  internalServerError: { code: 500, message: "Internal server error" },
  versionMismatch: { code: 426, message: "Version mismatch" },
} as const;

export interface DbError {
  sqlstate: string;
  message: string;
  httpStatus: number;
}

export const dbErrors = {
  missingRequiredInput: { sqlstate: "50001", message: "Missing required input", httpStatus: 400 },
  valueExceedsMaxLength: { sqlstate: "50002", message: "Value exceeds max length", httpStatus: 400 },
  conflictingValues: { sqlstate: "50003", message: "Conflicting values", httpStatus: 400 },
  referencedRecordMissing: { sqlstate: "50004", message: "Referenced record missing", httpStatus: 404 },
  requiredStateMissing: { sqlstate: "50005", message: "Required state missing", httpStatus: 404 },
  invalidIdFormat: { sqlstate: "50006", message: "Invalid ID format", httpStatus: 400 },
  limitExceeded: { sqlstate: "50007", message: "Limit exceeded", httpStatus: 400 },
  invalidCredentials: { sqlstate: "50008", message: "Invalid credentials", httpStatus: 401 },
} as const satisfies Record<string, DbError>;

export const dbErrorBySqlstate: ReadonlyMap<string, DbError> = new Map(
  Object.values(dbErrors).map((dbError) => [dbError.sqlstate, dbError])
);

export function resolveDatabaseError(e: unknown): ApiError {
  const sqlstate = (e as { code?: string } | null | undefined)?.code;
  if (sqlstate != null && dbErrorBySqlstate.has(sqlstate)) {
    switch (dbErrorBySqlstate.get(sqlstate)!.httpStatus) {
      case 401:
        return errors.invalidEmailOrPassword;
      case 404:
        return errors.notFound;
      default:
        return errors.invalidInputData;
    }
  }
  return errors.internalServerError;
}
