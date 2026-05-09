import { AppError } from '@/shared/errors/AppError';

// Mock all external dependencies before importing the service
jest.mock('@/modules/users/user.repository');
jest.mock('@/infrastructure/redis/client');
jest.mock('@/shared/utils/password.util');
jest.mock('@/shared/utils/jwt.util');

import * as AuthService from '@/modules/auth/auth.service';
import * as UserRepository from '@/modules/users/user.repository';
import * as PasswordUtil from '@/shared/utils/password.util';
import * as JwtUtil from '@/shared/utils/jwt.util';
import * as RedisClient from '@/infrastructure/redis/client';
import { Role } from '@/shared/types';

const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
const mockPasswordUtil = PasswordUtil as jest.Mocked<typeof PasswordUtil>;
const mockJwtUtil = JwtUtil as jest.Mocked<typeof JwtUtil>;

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
};
(RedisClient.getRedisClient as jest.Mock).mockReturnValue(mockRedis);

const fakeUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test User',
  email: 'test@example.com',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (RedisClient.getRedisClient as jest.Mock).mockReturnValue(mockRedis);
  });

  describe('register()', () => {
    it('should register a new user and return auth tokens', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(fakeUser);
      mockPasswordUtil.hashPassword.mockResolvedValue('hashed_password');
      mockJwtUtil.signTokenPair.mockReturnValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      mockJwtUtil.msUntilExpiry.mockReturnValue(900_000);

      const result = await AuthService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access_token');
      expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict error if email already exists', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(fakeUser as never);

      await expect(
        AuthService.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login()', () => {
    it('should return tokens on valid credentials', async () => {
      const userWithPwd = { ...fakeUser, password: 'hashed' };
      mockUserRepository.findUserByEmail.mockResolvedValue(userWithPwd as never);
      mockPasswordUtil.comparePassword.mockResolvedValue(true);
      mockJwtUtil.signTokenPair.mockReturnValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      mockJwtUtil.msUntilExpiry.mockReturnValue(900_000);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.tokens.accessToken).toBe('access_token');
    });

    it('should throw unauthorized on wrong password', async () => {
      const userWithPwd = { ...fakeUser, password: 'hashed' };
      mockUserRepository.findUserByEmail.mockResolvedValue(userWithPwd as never);
      mockPasswordUtil.comparePassword.mockResolvedValue(false);

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(AppError);
    });

    it('should throw unauthorized when user does not exist', async () => {
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(
        AuthService.login({ email: 'nobody@example.com', password: 'password' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('logout()', () => {
    it('should delete the refresh token from Redis', async () => {
      await AuthService.logout(fakeUser.id);
      expect(mockRedis.del).toHaveBeenCalledWith(`refresh_token:${fakeUser.id}`);
    });
  });
});
