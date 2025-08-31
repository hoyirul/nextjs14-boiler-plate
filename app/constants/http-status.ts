export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_MESSAGES = {
  OK: "Success",
  CREATED: "Resource created successfully",
  BAD_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  SERVICE_UNAVAILABLE: "Service unavailable",
  GATEWAY_TIMEOUT: "Gateway timeout"
} as const;
