import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, addMessage } from '../chatActions';
import { Message } from '@/lib/ai/types';
import { prisma } from '@/lib/prisma/db';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    module: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return all chat messages for a module', async () => {
      const mockMessages: Message[] = [
        {
          role: 'user',
          content: 'Hello, can you explain variables?',
        },
        {
          role: 'assistant',
          content: 'Variables are containers for storing data values...',
        },
      ];

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: mockMessages,
        learningSession: {
          userId: 'user-123',
        },
      } as any);

      const result = await getMessages('module-123', 'user-123');

      expect(result).toEqual(mockMessages);
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        select: {
          messages: true,
          learningSession: {
            select: { userId: true },
          },
        },
      });
    });

    it('should return empty array if no messages exist', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: [],
        learningSession: {
          userId: 'user-123',
        },
      } as any);

      const result = await getMessages('module-123', 'user-123');

      expect(result).toEqual([]);
    });

    it('should throw error if module not found', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null);

      await expect(getMessages('module-123', 'user-123')).rejects.toThrow('Module not found');
    });

    it('should throw error if user does not own the module', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: [],
        learningSession: {
          userId: 'different-user',
        },
      } as any);

      await expect(getMessages('module-123', 'user-123')).rejects.toThrow('Unauthorized: You do not have access to this module');
    });
  });

  describe('addMessage', () => {
    it('should add a user message to the module', async () => {
      const existingMessages: Message[] = [
        { role: 'user', content: 'First message' },
      ];

      const mockModule = {
        id: 'module-123',
        messages: existingMessages,
        learningSession: {
          userId: 'user-123',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue({
        ...mockModule,
        messages: [...existingMessages, { role: 'user', content: 'Second message' }],
      } as any);

      await addMessage('module-123', { role: 'user', content: 'Second message' }, 'user-123');

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [
            { role: 'user', content: 'First message' },
            { role: 'user', content: 'Second message' },
          ],
        },
      });
    });

    it('should add an assistant message to the module', async () => {
      const existingMessages: Message[] = [];

      const mockModule = {
        id: 'module-123',
        messages: existingMessages,
        learningSession: {
          userId: 'user-123',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue({
        ...mockModule,
        messages: [{ role: 'assistant', content: 'AI response' }],
      } as any);

      await addMessage('module-123', { role: 'assistant', content: 'AI response' }, 'user-123');

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [{ role: 'assistant', content: 'AI response' }],
        },
      });
    });

    it('should throw error if message limit is reached', async () => {
      const fullMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: fullMessages,
        learningSession: {
          userId: 'user-123',
        },
      } as any);

      await expect(
        addMessage('module-123', { role: 'user', content: 'Test message' }, 'user-123')
      ).rejects.toThrow('Message limit reached for this module');

      expect(prisma.module.update).not.toHaveBeenCalled();
    });

    it('should append messages to existing conversation', async () => {
      const existingMessages: Message[] = [
        { role: 'user', content: 'Question 1' },
        { role: 'assistant', content: 'Answer 1' },
        { role: 'user', content: 'Question 2' },
      ];

      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: existingMessages,
        learningSession: {
          userId: 'user-123',
        },
      } as any);

      vi.mocked(prisma.module.update).mockResolvedValue({
        id: 'module-123',
        messages: [...existingMessages, { role: 'assistant', content: 'Answer 2' }],
      } as any);

      await addMessage('module-123', { role: 'assistant', content: 'Answer 2' }, 'user-123');

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [
            { role: 'user', content: 'Question 1' },
            { role: 'assistant', content: 'Answer 1' },
            { role: 'user', content: 'Question 2' },
            { role: 'assistant', content: 'Answer 2' },
          ],
        },
      });
    });

    it('should handle empty initial messages array', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: [],
        learningSession: {
          userId: 'user-123',
        },
      } as any);

      vi.mocked(prisma.module.update).mockResolvedValue({
        id: 'module-123',
        messages: [{ role: 'user', content: 'First message' }],
      } as any);

      await addMessage('module-123', { role: 'user', content: 'First message' }, 'user-123');

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [{ role: 'user', content: 'First message' }],
        },
      });
    });
  });
});
