import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, sendMessage } from '../chatService';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    chatMessage: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    module: {
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

// Define mock enum since we're mocking Prisma
const ChatMessageAuthor = {
  User: 'User',
  AI: 'AI',
} as const;

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return all chat messages for a module', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          moduleId: 'module-123',
          content: 'Hello, can you explain variables?',
          author: ChatMessageAuthor.User,
          order: 0,
        },
        {
          id: 'msg-2',
          moduleId: 'module-123',
          content: 'Variables are containers for storing data values...',
          author: ChatMessageAuthor.AI,
          order: 1,
        },
      ];

      vi.mocked(prisma.chatMessage.findMany).mockResolvedValue(mockMessages as any);

      const result = await getMessages('module-123');

      expect(result).toEqual(mockMessages);
      expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: { moduleId: 'module-123' },
        orderBy: { order: 'asc' },
      });
    });

    it('should return empty array if no messages exist', async () => {
      vi.mocked(prisma.chatMessage.findMany).mockResolvedValue([]);

      const result = await getMessages('module-123');

      expect(result).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('should store a user message and generate AI response', async () => {
      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics of JavaScript programming',
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete JavaScript course',
        },
      };

      const mockUserMessage = {
        id: 'msg-1',
        moduleId: 'module-123',
        content: 'What are variables?',
        author: ChatMessageAuthor.User,
        order: 0,
      };

      const mockAIMessage = {
        id: 'msg-2',
        moduleId: 'module-123',
        content: 'Variables are containers for storing data values in JavaScript...',
        author: ChatMessageAuthor.AI,
        order: 1,
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

      vi.mocked(prisma.chatMessage.count).mockResolvedValue(0);
      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.chatMessage.findMany).mockResolvedValue([]);
      vi.mocked(prisma.chatMessage.create)
        .mockResolvedValueOnce(mockUserMessage as any)
        .mockResolvedValueOnce(mockAIMessage as any);
      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse as any);

      const result = await sendMessage({
        moduleId: 'module-123',
        content: 'What are variables?',
        author: ChatMessageAuthor.User as any,
      });

      expect(result.userMessage).toEqual(mockUserMessage);
      expect(result.aiMessage).toEqual(mockAIMessage);
      expect(prisma.chatMessage.create).toHaveBeenCalledTimes(2);
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500,
        })
      );
    });

    it('should store AI message without generating response', async () => {
      const mockAIMessage = {
        id: 'msg-1',
        moduleId: 'module-123',
        content: 'This is an AI message',
        author: ChatMessageAuthor.AI,
        order: 0,
      };

      vi.mocked(prisma.chatMessage.count).mockResolvedValue(0);
      vi.mocked(prisma.chatMessage.create).mockResolvedValue(mockAIMessage as any);

      const result = await sendMessage({
        moduleId: 'module-123',
        content: 'This is an AI message',
        author: ChatMessageAuthor.AI as any,
      });

      expect(result.userMessage).toEqual(mockAIMessage);
      expect(result.aiMessage).toBeNull();
      expect(prisma.chatMessage.create).toHaveBeenCalledTimes(1);
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should throw error if message limit is reached', async () => {
      vi.mocked(prisma.chatMessage.count).mockResolvedValue(100);

      await expect(
        sendMessage({
          moduleId: 'module-123',
          content: 'Test message',
          author: ChatMessageAuthor.User as any,
        })
      ).rejects.toThrow('Message limit reached for this module');

      expect(prisma.chatMessage.create).not.toHaveBeenCalled();
    });

    it('should throw error if OpenAI API fails', async () => {
      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics',
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete course',
        },
      };

      const mockUserMessage = {
        id: 'msg-1',
        moduleId: 'module-123',
        content: 'What are variables?',
        author: ChatMessageAuthor.User,
        order: 0,
      };

      vi.mocked(prisma.chatMessage.count).mockResolvedValue(0);
      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.chatMessage.findMany).mockResolvedValue([]);
      vi.mocked(prisma.chatMessage.create).mockResolvedValue(mockUserMessage as any);
      vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('OpenAI API error'));

      await expect(
        sendMessage({
          moduleId: 'module-123',
          content: 'What are variables?',
          author: ChatMessageAuthor.User as any,
        })
      ).rejects.toThrow('Failed to generate AI response. Please try again.');
    });

    it('should include chat history in OpenAI request', async () => {
      const mockModule = {
        id: 'module-123',
        name: 'Introduction to JavaScript',
        overview: 'Learn the basics',
        learningSession: {
          name: 'JavaScript Fundamentals',
          description: 'Complete course',
        },
      };

      const mockChatHistory = [
        {
          id: 'msg-old-1',
          moduleId: 'module-123',
          content: 'Previous question',
          author: ChatMessageAuthor.User,
          order: 0,
        },
        {
          id: 'msg-old-2',
          moduleId: 'module-123',
          content: 'Previous answer',
          author: ChatMessageAuthor.AI,
          order: 1,
        },
      ];

      const mockUserMessage = {
        id: 'msg-1',
        moduleId: 'module-123',
        content: 'Follow-up question',
        author: ChatMessageAuthor.User,
        order: 2,
      };

      const mockAIMessage = {
        id: 'msg-2',
        moduleId: 'module-123',
        content: 'Follow-up answer',
        author: ChatMessageAuthor.AI,
        order: 3,
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

      vi.mocked(prisma.chatMessage.count).mockResolvedValue(2);
      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.chatMessage.findMany).mockResolvedValue(mockChatHistory as any);
      vi.mocked(prisma.chatMessage.create)
        .mockResolvedValueOnce(mockUserMessage as any)
        .mockResolvedValueOnce(mockAIMessage as any);
      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockOpenAIResponse as any);

      await sendMessage({
        moduleId: 'module-123',
        content: 'Follow-up question',
        author: ChatMessageAuthor.User as any,
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
