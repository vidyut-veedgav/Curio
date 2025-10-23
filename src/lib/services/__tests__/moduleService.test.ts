import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getModules, getModuleById, markModuleComplete, getModuleTitle } from '../moduleService';
import { prisma } from '@/lib/db';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    module: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('moduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getModules', () => {
    it('should return all modules for a learning session', async () => {
      const mockModules = [
        {
          id: 'module-1',
          learningSessionId: 'session-123',
          name: 'Module 1: Introduction',
          overview: 'Introduction to the topic',
          order: 0,
          isComplete: false,
          chatMessages: [{ id: 'msg-1' }, { id: 'msg-2' }],
        },
        {
          id: 'module-2',
          learningSessionId: 'session-123',
          name: 'Module 2: Advanced Topics',
          overview: 'Advanced concepts',
          order: 1,
          isComplete: false,
          chatMessages: [],
        },
      ];

      vi.mocked(prisma.module.findMany).mockResolvedValue(mockModules as any);

      const result = await getModules('session-123');

      expect(result).toEqual(mockModules);
      expect(prisma.module.findMany).toHaveBeenCalledWith({
        where: { learningSessionId: 'session-123' },
        orderBy: { order: 'asc' },
        include: {
          chatMessages: {
            select: {
              id: true,
            },
          },
        },
      });
    });

    it('should return empty array if no modules exist', async () => {
      vi.mocked(prisma.module.findMany).mockResolvedValue([]);

      const result = await getModules('session-123');

      expect(result).toEqual([]);
    });
  });

  describe('getModuleById', () => {
    it('should return a module by ID with learning session info', async () => {
      const mockModule = {
        id: 'module-123',
        learningSessionId: 'session-123',
        name: 'Module 1: Introduction',
        overview: 'Introduction to the topic',
        order: 0,
        isComplete: false,
        learningSession: {
          id: 'session-123',
          name: 'JavaScript Fundamentals',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);

      const result = await getModuleById('module-123');

      expect(result).toEqual(mockModule);
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        include: {
          learningSession: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return null if module not found', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null);

      const result = await getModuleById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('markModuleComplete', () => {
    it('should mark a module as complete', async () => {
      const mockModule = {
        id: 'module-123',
        learningSessionId: 'session-123',
        name: 'Module 1',
        overview: 'Overview',
        order: 0,
        isComplete: true,
        learningSession: {
          id: 'session-123',
          name: 'JavaScript Fundamentals',
          userId: 'user-123',
          description: 'Learn JS',
          originalPrompt: 'JS',
          modules: [
            { id: 'module-123', isComplete: true },
            { id: 'module-456', isComplete: false },
          ],
        },
      };

      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);

      const result = await markModuleComplete('module-123');

      expect(result.module).toEqual(mockModule);
      expect(result.sessionComplete).toBe(false);
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: { isComplete: true },
        include: {
          learningSession: {
            include: {
              modules: true,
            },
          },
        },
      });
    });

    it('should detect when all modules in session are complete', async () => {
      const mockModule = {
        id: 'module-123',
        learningSessionId: 'session-123',
        name: 'Module 1',
        overview: 'Overview',
        order: 0,
        isComplete: true,
        learningSession: {
          id: 'session-123',
          name: 'JavaScript Fundamentals',
          userId: 'user-123',
          description: 'Learn JS',
          originalPrompt: 'JS',
          modules: [
            { id: 'module-123', isComplete: true },
            { id: 'module-456', isComplete: true },
            { id: 'module-789', isComplete: true },
          ],
        },
      };

      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);

      const result = await markModuleComplete('module-123');

      expect(result.sessionComplete).toBe(true);
    });

    it('should return sessionComplete as false when other modules are incomplete', async () => {
      const mockModule = {
        id: 'module-123',
        learningSessionId: 'session-123',
        name: 'Module 1',
        overview: 'Overview',
        order: 0,
        isComplete: true,
        learningSession: {
          id: 'session-123',
          name: 'JavaScript Fundamentals',
          userId: 'user-123',
          description: 'Learn JS',
          originalPrompt: 'JS',
          modules: [
            { id: 'module-123', isComplete: true },
            { id: 'module-456', isComplete: false },
          ],
        },
      };

      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);

      const result = await markModuleComplete('module-123');

      expect(result.sessionComplete).toBe(false);
    });
  });

  describe('getModuleTitle', () => {
    it('should return the module title', async () => {
      const mockModule = {
        name: 'Module 1: Introduction to JavaScript',
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);

      const result = await getModuleTitle('module-123');

      expect(result).toBe('Module 1: Introduction to JavaScript');
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        select: { name: true },
      });
    });

    it('should throw error if module not found', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null);

      await expect(getModuleTitle('invalid-id')).rejects.toThrow('Module not found');
    });
  });
});
