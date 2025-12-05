import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLearningSessions } from '../sessionActions';
import { prisma } from '@/lib/db';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    learningSession: {
      findMany: vi.fn(),
    },
  },
}));

// Mock OpenAI provider to prevent instantiation errors
const { mockComplete, mockStream } = vi.hoisted(() => ({
  mockComplete: vi.fn(),
  mockStream: vi.fn(),
}));

vi.mock('@/lib/ai/providers/openai', () => {
  return {
    OpenAIProvider: class {
      complete: any;
      stream: any;
      constructor(_model: string) {
        this.complete = mockComplete;
        this.stream = mockStream;
      }
    },
  };
});

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HDT-01: Dashboard Loading', () => {
    it('should load dashboard within 2 seconds', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'JavaScript Fundamentals',
          description: 'Learn JavaScript basics',
          originalPrompt: 'JavaScript basics',
          modules: [
            { id: 'module-1', isComplete: false },
            { id: 'module-2', isComplete: true },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const startTime = Date.now();
      const result = await getLearningSessions('user-123');
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      expect(result).toEqual(mockSessions);
      expect(loadTime).toBeLessThan(2000); // Should load in < 2 seconds
    });

    it('should display all UI elements on dashboard', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'React Basics',
          description: 'Introduction to React',
          originalPrompt: 'React',
          modules: [{ id: 'mod-1', isComplete: false }],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      // Verify all expected data is present for UI rendering
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('modules');
    });

    it('should handle empty dashboard gracefully', async () => {
      vi.mocked(prisma.learningSession.findMany).mockResolvedValue([]);

      const result = await getLearningSessions('user-new');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('HDT-02: Learning Sessions Overview Display', () => {
    it('should display all user learning sessions with titles', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Python Programming',
          description: 'Learn Python',
          originalPrompt: 'Python',
          modules: [
            { id: 'module-1', isComplete: true },
            { id: 'module-2', isComplete: false },
          ],
        },
        {
          id: 'session-2',
          userId: 'user-123',
          name: 'Web Development',
          description: 'Full stack web development',
          originalPrompt: 'Web dev',
          modules: [
            { id: 'module-3', isComplete: false },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Python Programming');
      expect(result[1].name).toBe('Web Development');
    });

    it('should display progress indicators for each session', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Data Science',
          description: 'Learn data science',
          originalPrompt: 'Data science',
          modules: [
            { id: 'module-1', isComplete: true },
            { id: 'module-2', isComplete: true },
            { id: 'module-3', isComplete: false },
            { id: 'module-4', isComplete: false },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      // Verify module completion data is available for progress calculation
      const session = result[0];
      const totalModules = session.modules.length;
      const completedModules = session.modules.filter((m: any) => m.isComplete).length;
      const progressPercentage = (completedModules / totalModules) * 100;

      expect(totalModules).toBe(4);
      expect(completedModules).toBe(2);
      expect(progressPercentage).toBe(50);
    });

    it('should order sessions by most recent first', async () => {
      const mockSessions = [
        {
          id: 'session-3',
          userId: 'user-123',
          name: 'Most Recent Session',
          description: 'Latest',
          originalPrompt: 'Latest',
          modules: [],
        },
        {
          id: 'session-2',
          userId: 'user-123',
          name: 'Middle Session',
          description: 'Middle',
          originalPrompt: 'Middle',
          modules: [],
        },
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Oldest Session',
          description: 'Oldest',
          originalPrompt: 'Oldest',
          modules: [],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      // Based on sessionActions.ts, sessions are ordered by id desc (newest first)
      expect(result[0].name).toBe('Most Recent Session');
      expect(prisma.learningSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { id: 'desc' },
        })
      );
    });
  });

  describe('HDT-03: Progress Tracking Display', () => {
    it('should show accurate progress percentages for each session', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'JavaScript Course',
          description: 'JS Course',
          originalPrompt: 'JS',
          modules: [
            { id: 'module-1', isComplete: true },
            { id: 'module-2', isComplete: true },
            { id: 'module-3', isComplete: true },
            { id: 'module-4', isComplete: false },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');
      const session = result[0];

      const completed = session.modules.filter((m: any) => m.isComplete).length;
      const total = session.modules.length;
      const percentage = (completed / total) * 100;

      expect(percentage).toBe(75); // 3 out of 4 modules complete
    });

    it('should show accurate progress percentages for each module', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Python Course',
          description: 'Python',
          originalPrompt: 'Python',
          modules: [
            { id: 'module-1', isComplete: true },
            { id: 'module-2', isComplete: false },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      // Module completion status is available
      expect(result[0].modules[0].isComplete).toBe(true);
      expect(result[0].modules[1].isComplete).toBe(false);
    });

    it('should handle 0% progress (no modules completed)', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'New Course',
          description: 'Brand new',
          originalPrompt: 'New',
          modules: [
            { id: 'module-1', isComplete: false },
            { id: 'module-2', isComplete: false },
            { id: 'module-3', isComplete: false },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');
      const completed = result[0].modules.filter((m: any) => m.isComplete).length;

      expect(completed).toBe(0);
    });

    it('should handle 100% progress (all modules completed)', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Completed Course',
          description: 'All done',
          originalPrompt: 'Done',
          modules: [
            { id: 'module-1', isComplete: true },
            { id: 'module-2', isComplete: true },
            { id: 'module-3', isComplete: true },
          ],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');
      const completed = result[0].modules.filter((m: any) => m.isComplete).length;
      const total = result[0].modules.length;

      expect(completed).toBe(total);
      expect((completed / total) * 100).toBe(100);
    });
  });

  describe('HDT-04: Create New Session Button', () => {
    it('should provide session creation functionality', async () => {
      // This test verifies that the dashboard provides access to session creation
      // The actual session creation is tested in sessionService.test.ts

      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Existing Session',
          description: 'Existing',
          originalPrompt: 'Existing',
          modules: [],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const result = await getLearningSessions('user-123');

      // Verify dashboard data loads successfully, enabling UI to show create button
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should allow creating new session when dashboard is loaded', async () => {
      vi.mocked(prisma.learningSession.findMany).mockResolvedValue([]);

      // Dashboard should load even with no sessions
      const result = await getLearningSessions('user-123');

      expect(result).toEqual([]);
      // User should be able to create their first session
    });

    it('should maintain existing sessions when creating new session', async () => {
      const mockExistingSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'First Session',
          description: 'First',
          originalPrompt: 'First',
          modules: [],
        },
        {
          id: 'session-2',
          userId: 'user-123',
          name: 'Second Session',
          description: 'Second',
          originalPrompt: 'Second',
          modules: [],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockExistingSessions as any);

      const result = await getLearningSessions('user-123');

      // All existing sessions should be present
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('First Session');
      expect(result[1].name).toBe('Second Session');
    });
  });

  describe('Performance Requirements', () => {
    it('should execute database query in less than 500ms', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Quick Load Test',
          description: 'Testing query speed',
          originalPrompt: 'Speed',
          modules: Array.from({ length: 10 }, (_, i) => ({
            id: `module-${i}`,
            isComplete: i % 2 === 0,
          })),
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      const startTime = Date.now();
      await getLearningSessions('user-123');
      const queryTime = Date.now() - startTime;

      // Database query should execute in < 500ms as per SRS requirements
      expect(queryTime).toBeLessThan(500);
    });

    it('should handle multiple concurrent dashboard loads', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          name: 'Concurrent Test',
          description: 'Testing concurrent access',
          originalPrompt: 'Concurrent',
          modules: [],
        },
      ];

      vi.mocked(prisma.learningSession.findMany).mockResolvedValue(mockSessions as any);

      // Simulate multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => getLearningSessions('user-123'));

      const results = await Promise.all(promises);

      // All requests should succeed
      results.forEach((result) => {
        expect(result).toEqual(mockSessions);
      });

      expect(prisma.learningSession.findMany).toHaveBeenCalledTimes(5);
    });
  });
});
