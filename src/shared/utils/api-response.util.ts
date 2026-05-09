import { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '@/shared/types';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta | Record<string, unknown>,
  ): Response {
    const body: ApiSuccessResponse<T> = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>,
    stack?: string,
  ): Response {
    const body: ApiErrorResponse = { success: false, message };
    if (errors) body.errors = errors;
    if (stack) body.stack = stack;
    return res.status(statusCode).json(body);
  }
}
