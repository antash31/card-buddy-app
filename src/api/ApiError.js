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

  /**
   * The request failed for a reason that says nothing about the user's credentials: the server could
   * not be reached, timed out, was busy, or broke. Signing someone out over this would throw away a
   * perfectly good session because of a dropped connection.
   */
  get isTransient() {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}
