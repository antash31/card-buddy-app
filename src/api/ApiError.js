// #genai: Normalized error shape so UI never has to branch on axios internals.
export class ApiError extends Error {
  constructor({ message, code = 'unknown_error', status = 0, details = null }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}
