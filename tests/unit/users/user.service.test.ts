import { AppError } from '@/shared/errors/AppError';

jest.mock('@/modules/users/user.repository');
jest.mock('@/shared/utils/password.util');

import * as UserService from '@/modules/users/user.service';
import * as UserRepository from '@/modules/users/user.repository';
import * as PasswordUtil from '@/shared/utils/password.util';
import { Role } from '@/shared/types';

const mockRepo = UserRepository as jest.Mocked<typeof UserRepository>;
const mockPwd = PasswordUtil as jest.Mocked<typeof PasswordUtil>;

const fakeUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  email: 'john@example.com',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getUserById()', () => {
    it('should return a user when found', async () => {
      mockRepo.findUserById.mockResolvedValue(fakeUser);
      const user = await UserService.getUserById(fakeUser.id);
      expect(user.email).toBe('john@example.com');
    });

    it('should throw 404 when user is not found', async () => {
      mockRepo.findUserById.mockResolvedValue(null);
      await expect(UserService.getUserById('nonexistent-id')).rejects.toThrow(AppError);
    });
  });

  describe('createUser()', () => {
    it('should hash the password and create the user', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockPwd.hashPassword.mockResolvedValue('hashed');
      mockRepo.createUser.mockResolvedValue(fakeUser);

      const user = await UserService.createUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(mockPwd.hashPassword).toHaveBeenCalledWith('password123');
      expect(user.email).toBe('john@example.com');
    });

    it('should throw conflict when email already exists', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(fakeUser as never);

      await expect(
        UserService.createUser({
          name: 'John',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateUser()', () => {
    it('should update and return the user', async () => {
      mockRepo.findUserById.mockResolvedValue(fakeUser);
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockRepo.updateUser.mockResolvedValue({ ...fakeUser, name: 'Jane Doe' });

      const updated = await UserService.updateUser(fakeUser.id, { name: 'Jane Doe' });
      expect(updated.name).toBe('Jane Doe');
    });

    it('should throw 404 if user does not exist', async () => {
      mockRepo.findUserById.mockResolvedValue(null);
      await expect(UserService.updateUser('nonexistent', { name: 'X' })).rejects.toThrow(AppError);
    });
  });

  describe('deleteUser()', () => {
    it('should delete the user', async () => {
      mockRepo.findUserById.mockResolvedValue(fakeUser);
      mockRepo.deleteUser.mockResolvedValue(undefined);

      await expect(UserService.deleteUser(fakeUser.id)).resolves.toBeUndefined();
      expect(mockRepo.deleteUser).toHaveBeenCalledWith(fakeUser.id);
    });
  });
});
