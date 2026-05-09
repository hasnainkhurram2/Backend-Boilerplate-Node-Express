import { Role } from '@/shared/types';

export const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

export const mockUser = {
  id: mockUserId,
  name: 'Test User',
  email: 'test@example.com',
  role: Role.USER,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdmin = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: 'Admin User',
  email: 'admin@example.com',
  role: Role.ADMIN,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockTokenPair = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
};
