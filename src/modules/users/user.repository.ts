import { AppDataSource } from '@/infrastructure/postgres/data-source';
import { UserEntity } from './user.entity';
import type { CreateUserDto, UpdateUserDto, UserDto } from './user.types';
import { normalizePagination, buildPaginationMeta } from '@/shared/utils/pagination.util';
import type { PaginationMeta, PaginationQuery } from '@/shared/types';

/**
 * PostgreSQL (TypeORM) repository for users.
 *
 * To switch to MongoDB, replace this file with a Mongoose implementation
 * that satisfies the same method signatures. The service layer stays unchanged.
 */
const repo = () => AppDataSource.getRepository(UserEntity);

export async function findUserById(id: string): Promise<UserDto | null> {
  const user = await repo().findOne({ where: { id } });
  return user ? toDto(user) : null;
}

export async function findUserByEmail(
  email: string,
  includePassword = false,
): Promise<(UserEntity & { password?: string }) | null> {
  const qb = repo().createQueryBuilder('user').where('user.email = :email', { email });
  if (includePassword) {
    qb.addSelect('user.password');
  }
  return qb.getOne();
}

export async function findUserByGoogleId(googleId: string): Promise<UserEntity | null> {
  return repo().findOne({ where: { googleId } });
}

export async function createUser(dto: CreateUserDto & { password: string }): Promise<UserDto> {
  const user = repo().create(dto);
  const saved = await repo().save(user);
  return toDto(saved);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<UserDto | null> {
  await repo().update(id, dto);
  return findUserById(id);
}

export async function updateRefreshToken(
  id: string,
  refreshToken: string | null,
): Promise<void> {
  await repo().update(id, { refreshToken: refreshToken ?? undefined });
}

export async function deleteUser(id: string): Promise<void> {
  await repo().delete(id);
}

export async function listUsers(
  query: PaginationQuery & { search?: string },
): Promise<{ data: UserDto[]; meta: PaginationMeta }> {
  const { page, limit, skip, sortBy, sortOrder } = normalizePagination(query, {
    sortBy: 'createdAt',
  });

  const qb = repo().createQueryBuilder('user');

  if (query.search) {
    qb.where('(user.name ILIKE :search OR user.email ILIKE :search)', {
      search: `%${query.search}%`,
    });
  }

  const [rows, total] = await qb
    .orderBy(`user.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: rows.map(toDto),
    meta: buildPaginationMeta(total, page, limit),
  };
}

function toDto(user: UserEntity): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
