import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, addMessage, Message } from '../chatActions';
import { prisma } from '@/lib/db';

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
      } as any);

      const result = await getMessages('module-123');

      expect(result).toEqual(mockMessages);
      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        select: { messages: true },
      });
    });

    it('should return empty array if no messages exist', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue({
        id: 'module-123',
        messages: [],
      } as any);

      const result = await getMessages('module-123');

      expect(result).toEqual([]);
    });

    it('should throw error if module not found', async () => {
      vi.mocked(prisma.module.findUnique).mockResolvedValue(null);

      await expect(getMessages('module-123')).rejects.toThrow('Module not found');
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
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue({
        ...mockModule,
        messages: [...existingMessages, { role: 'user', content: 'Second message' }],
      } as any);

      await addMessage('module-123', { role: 'user', content: 'Second message' });

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
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue({
        ...mockModule,
        messages: [{ role: 'assistant', content: 'AI response' }],
      } as any);

      await addMessage('module-123', { role: 'assistant', content: 'AI response' });

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
      } as any);

      await expect(
        addMessage('module-123', { role: 'user', content: 'Test message' })
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
      } as any);

      vi.mocked(prisma.module.update).mockResolvedValue({
        id: 'module-123',
        messages: [...existingMessages, { role: 'assistant', content: 'Answer 2' }],
      } as any);

      await addMessage('module-123', { role: 'assistant', content: 'Answer 2' });

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
      } as any);

      vi.mocked(prisma.module.update).mockResolvedValue({
        id: 'module-123',
        messages: [{ role: 'user', content: 'First message' }],
      } as any);

      await addMessage('module-123', { role: 'user', content: 'First message' });

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [{ role: 'user', content: 'First message' }],
        },
      });
    });
  });
});
