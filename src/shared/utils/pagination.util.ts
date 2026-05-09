import type { PaginationMeta, PaginationQuery } from '@/shared/types';

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function normalizePagination(
  query: PaginationQuery,
  defaults: { sortBy?: string } = {},
): NormalizedPagination {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? defaults.sortBy ?? 'createdAt';
  const sortOrder = query.sortOrder ?? 'desc';

  return { page, limit, skip, sortBy, sortOrder };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
