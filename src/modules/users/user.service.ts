import { AppError } from '@/shared/errors/AppError';
import { hashPassword } from '@/shared/utils/password.util';
import type { PaginationMeta } from '@/shared/types';
import type { CreateUserDto, UpdateUserDto, UserDto, ListUsersQuery } from './user.types';
import * as UserRepository from './user.repository';

export async function getUserById(id: string): Promise<UserDto> {
  const user = await UserRepository.findUserById(id);
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function listUsers(
  query: ListUsersQuery,
): Promise<{ data: UserDto[]; meta: PaginationMeta }> {
  return UserRepository.listUsers(query);
}

export async function createUser(dto: CreateUserDto): Promise<UserDto> {
  const existing = await UserRepository.findUserByEmail(dto.email);
  if (existing) throw AppError.conflict('A user with this email already exists');

  const password = await hashPassword(dto.password);
  return UserRepository.createUser({ ...dto, password });
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<UserDto> {
  const existing = await UserRepository.findUserById(id);
  if (!existing) throw AppError.notFound('User not found');

  if (dto.email && dto.email !== existing.email) {
    const emailTaken = await UserRepository.findUserByEmail(dto.email);
    if (emailTaken) throw AppError.conflict('Email is already in use');
  }

  const updated = await UserRepository.updateUser(id, dto);
  if (!updated) throw AppError.notFound('User not found');
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  const existing = await UserRepository.findUserById(id);
  if (!existing) throw AppError.notFound('User not found');
  await UserRepository.deleteUser(id);
}
