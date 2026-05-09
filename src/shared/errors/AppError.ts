export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors?: Record<string, string[]>) {
    return new AppError(message, 400, true, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  static unprocessable(message = 'Unprocessable Entity', errors?: Record<string, string[]>) {
    return new AppError(message, 422, true, errors);
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500, false);
  }
}
