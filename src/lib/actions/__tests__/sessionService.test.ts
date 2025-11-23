import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLearningSession, getSessions, getSessionById } from '../sessionActions';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/ai/providers/openai';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    learningSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock OpenAI client
vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe('sessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLearningSession', () => {
    it('should create a learning session with AI-generated modules', async () => {
      const mockUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: null,
      };

      const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        name: 'JavaScript Fundamentals',
        description: 'AI-generated learning path for JavaScript Fundamentals',
        originalPrompt: 'JavaScript Fundamentals',
        modules: [
          {
            id: 'module-1',
            learningSessionId: 'session-123',
            name: 'Module 1: Introduction to JavaScript',
            overview: 'Learn the basics of JavaScript programming',
            order: 0,
            isComplete: false,
          },
          {
            id: 'module-2',
            learningSessionId: 'session-123',
            name: 'Module 2: Variables and Data Types',
            overview: 'Understanding JavaScript variables and data types',
            order: 1,
            isComplete: false,
          },
        ],
      };

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                modules: [
                  {
                    name: 'Module 1: Introduction to JavaScript',
                    overview: 'Learn the basics of JavaScript programming',
                    order: 0,
                  },
                  {
                    name: 'Module 2: Variables and Data Types',
                    overview: 'Understanding JavaScript variables and data types',
                    order: 1,
                  },
                ],
              }),
            },
          },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse as any);
      vi.mocked(prisma.learningSession.create).mockResolvedValue(mockSession as any);

      const result = await createLearningSession({
        userId: 'user-123',
        topic: 'JavaScript Fundamentals',
        length: 'medium',
        complexity: 'beginner',
      });

      expect(result).toEqual(mockSession);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        })
      );
      expect(prisma.learningSession.create).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        createLearningSession({
          userId: 'invalid-user',
          topic: 'JavaScript Fundamentals',
        })
      ).rejects.toThrow('User not found');
    });

    it('should handle OpenAI API errors gracefully with fallback', async () => {
      const mockUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        bio: null,
      };

      const mockSessionWithFallback = {
        id: 'session-123',
        userId: 'user-123',
        name: 'JavaScript Fundamentals',
        description: 'AI-generated learning path for JavaScript Fundamentals',
        originalPrompt: 'JavaScript Fundamentals',
        modules: [
          {
            id: 'module-1',
            name: 'Module 1: JavaScript Fundamentals',
            overview: 'This module covers fundamental concepts of JavaScript Fundamentals. You will learn key principles and practical applications.',
            order: 0,
            isComplete: false,
          },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('OpenAI API error'));
      vi.mocked(prisma.learningSession.create).mockResolvedValue(mockSessionWithFallback as any);

      const result = await createLearningSession({
        userId: 'user-123',
        topic: 'JavaScript Fundamentals',
      });

      // Should still create a session with fallback modules
      expect(result).toBeDefined();
      expect(result.modules.length).toBeGreaterThan(0);
    });
  });

  describe('getSessions', () => {
    it('should return all sessions for a user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'JavaScript Fundamentals',
          description: 'Learn JavaScript',
          originalPrompt: 'JavaScript Fundamentals',
          modules: [{ id: 'module-1', isComplete: false }],
        },
        {
          id: 'session-2',
          userId: 'user-123',
          name: 'React Basics',
          description: 'Learn React',
          originalPrompt: 'React Basics',
          modules: [{ id: 'module-2', isComplete: true }],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getSessions('user-123');

      expect(result).toEqual(mockSessions);
      expect(prisma.learningSession.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          modules: {
            select: {
              id: true,
              isComplete: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
    });
  });

  describe('getSessionById', () => {
    it('should return a session by ID', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        name: 'JavaScript Fundamentals',
        description: 'Learn JavaScript',
        originalPrompt: 'JavaScript Fundamentals',
        modules: [
          {
            id: 'module-1',
            name: 'Module 1',
            overview: 'Overview',
            order: 0,
            isComplete: false,
          },
        ],
      };

      vi.mocked(prisma.learningSession.findUnique).mockResolvedValue(mockSession as any);

      const result = await getSessionById('session-123');

      expect(result).toEqual(mockSession);
      expect(prisma.learningSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        include: {
          modules: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  });
});
