import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, sendMessage, Message } from '../chatActions';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/ai/providers/openai';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    module: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

  describe('sendMessage', () => {
    it('should store a user message and generate AI response', async () => {
      const existingMessages: Message[] = [];

      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics of JavaScript programming',
        messages: existingMessages,
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete JavaScript course',
        },
      };

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: 'Variables are containers for storing data values in JavaScript...',
            },
          },
        ],
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);
      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse as any);

      const result = await sendMessage({
        moduleId: 'module-123',
        content: 'What are variables?',
        role: 'user',
      });

      expect(result.userMessage).toEqual({ role: 'user', content: 'What are variables?' });
      expect(result.aiMessage).toEqual({
        role: 'assistant',
        content: 'Variables are containers for storing data values in JavaScript...'
      });
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [
            { role: 'user', content: 'What are variables?' },
            { role: 'assistant', content: 'Variables are containers for storing data values in JavaScript...' },
          ],
        },
      });
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500,
        })
      );
    });

    it('should store assistant message without generating response', async () => {
      const existingMessages: Message[] = [];

      const mockModule = {
        id: 'module-123',
        messages: existingMessages,
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);

      const result = await sendMessage({
        moduleId: 'module-123',
        content: 'This is an assistant message',
        role: 'assistant',
      });

      expect(result.userMessage).toEqual({ role: 'assistant', content: 'This is an assistant message' });
      expect(result.aiMessage).toBeNull();
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'module-123' },
        data: {
          messages: [{ role: 'assistant', content: 'This is an assistant message' }],
        },
      });
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
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
        sendMessage({
          moduleId: 'module-123',
          content: 'Test message',
          role: 'user',
        })
      ).rejects.toThrow('Message limit reached for this module');

      expect(prisma.module.update).not.toHaveBeenCalled();
    });

    it('should throw error if OpenAI API fails', async () => {
      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics',
        messages: [],
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete course',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('OpenAI API error'));

      await expect(
        sendMessage({
          moduleId: 'module-123',
          content: 'What are variables?',
          role: 'user',
        })
      ).rejects.toThrow('Failed to generate AI response. Please try again.');
    });

    it('should include chat history in OpenAI request', async () => {
      const mockChatHistory: Message[] = [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
      ];

      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics',
        messages: mockChatHistory,
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete course',
        },
      };

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: 'Follow-up answer',
            },
          },
        ],
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.module.update).mockResolvedValue(mockModule as any);
      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse as any);

      await sendMessage({
        moduleId: 'module-123',
        content: 'Follow-up question',
        role: 'user',
      });

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user', content: 'Previous question' }),
            expect.objectContaining({ role: 'assistant', content: 'Previous answer' }),
            expect.objectContaining({ role: 'user', content: 'Follow-up question' }),
          ]),
        })
      );
    });
  });
});
