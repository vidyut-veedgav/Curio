import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserData, setUserData, createUser } from '../userService';
import { prisma } from '@/lib/db';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserData', () => {
    it('should return user data by ID', async () => {
      const mockUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: 'Software developer',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await getUserData('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(getUserData('invalid-id')).rejects.toThrow('User not found');
    });
  });

  describe('setUserData', () => {
    it('should update user first name', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: 'Software developer',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        firstName: 'Jane',
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          firstName: 'Jane',
        }),
      });
    });

    it('should update user last name', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        bio: 'Software developer',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        lastName: 'Smith',
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          lastName: 'Smith',
        }),
      });
    });

    it('should update user bio', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: 'Updated bio',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        bio: 'Updated bio',
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          bio: 'Updated bio',
        }),
      });
    });

    it('should update multiple fields at once', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john@example.com',
        bio: 'New bio',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'New bio',
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'New bio',
        }),
      });
    });

    it('should handle empty bio (set to null)', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: null,
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        bio: '',
      });

      expect(result).toEqual(mockUpdatedUser);
    });

    it('should not update email (business rule)', async () => {
      // Email updates should be handled by auth layer
      const mockUpdatedUser = {
        id: 'user-123',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com', // Email remains unchanged
        bio: 'Software developer',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

      const result = await setUserData('user-123', {
        firstName: 'Jane',
      });

      expect(result.email).toBe('john@example.com');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.not.objectContaining({
          email: expect.anything(),
        }),
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockNewUser = {
        id: 'user-new',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        bio: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockNewUser as any);

      const result = await createUser({
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
      });

      expect(result).toEqual(mockNewUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'alice@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
        },
      });
    });

    it('should create a user with bio', async () => {
      const mockNewUser = {
        id: 'user-new',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@example.com',
        bio: 'Product designer',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockNewUser as any);

      const result = await createUser({
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        bio: 'Product designer',
      });

      expect(result).toEqual(mockNewUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'bob@example.com',
          firstName: 'Bob',
          lastName: 'Wilson',
          bio: 'Product designer',
        },
      });
    });

    it('should throw error if user already exists', async () => {
      const mockExistingUser = {
        id: 'user-existing',
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
        bio: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockExistingUser as any);

      await expect(
        createUser({
          email: 'existing@example.com',
          firstName: 'New',
          lastName: 'User',
        })
      ).rejects.toThrow('User with this email already exists');

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
