/**
 * Functional tests for /api/modules/[id]/messages API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { createMockRequest, getResponseJSON } from '@/lib/test-utils/api';
import * as chatService from '@/lib/services/chatService';
import { ChatMessageAuthor } from '@prisma/client';

// Mock the chat service
vi.mock('@/lib/services/chatService', () => ({
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

describe('GET /api/modules/[id]/messages - Retrieve Chat Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve all messages for a module', async () => {
    // Arrange
    const mockMessages = [
      {
        id: 'msg-1',
        moduleId: 'module-123',
        content: 'What is machine learning?',
        author: ChatMessageAuthor.User,
        order: 0,
        createdAt: new Date('2025-01-01T10:00:00Z'),
      },
      {
        id: 'msg-2',
        moduleId: 'module-123',
        content: 'Machine learning is a subset of artificial intelligence...',
        author: ChatMessageAuthor.AI,
        order: 1,
        createdAt: new Date('2025-01-01T10:00:05Z'),
      },
    ];

    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/module-123/messages',
    });

    // Act
    const response = await GET(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].author).toBe(ChatMessageAuthor.User);
    expect(data.data[1].author).toBe(ChatMessageAuthor.AI);
    expect(chatService.getMessages).toHaveBeenCalledWith('module-123');
  });

  it('should return empty array if no messages exist', async () => {
    // Arrange
    vi.mocked(chatService.getMessages).mockResolvedValue([]);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/module-456/messages',
    });

    // Act
    const response = await GET(request, { params: { id: 'module-456' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(chatService.getMessages).mockRejectedValue(
      new Error('Database query failed')
    );

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/module-123/messages',
    });

    // Act
    const response = await GET(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database query failed');
  });
});

describe('POST /api/modules/[id]/messages - Send Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a message and receive AI response', async () => {
    // Arrange
    const mockUserMessage = {
      id: 'msg-user-1',
      moduleId: 'module-123',
      content: 'Explain neural networks',
      author: ChatMessageAuthor.User,
      order: 0,
      createdAt: new Date(),
    };

    const mockAIMessage = {
      id: 'msg-ai-1',
      moduleId: 'module-123',
      content: 'Neural networks are computing systems inspired by biological neural networks...',
      author: ChatMessageAuthor.AI,
      order: 1,
      createdAt: new Date(),
    };

    vi.mocked(chatService.sendMessage).mockResolvedValue({ userMessage: mockUserMessage, aiMessage: mockAIMessage } as any);
    vi.mocked(chatService.getMessages).mockResolvedValue([mockUserMessage, mockAIMessage] as any);

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/modules/module-123/messages',
      body: {
        content: 'Explain neural networks',
      },
    });

    // Act
    const response = await POST(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.userMessage.content).toBe('Explain neural networks');
    expect(data.data.aiMessage.author).toBe(ChatMessageAuthor.AI);
    expect(chatService.sendMessage).toHaveBeenCalledWith({
      moduleId: 'module-123',
      content: 'Explain neural networks',
      author: ChatMessageAuthor.User,
    });
  });

  it('should return 400 if message content is missing', async () => {
    // Arrange
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/modules/module-123/messages',
      body: {},
    });

    // Act
    const response = await POST(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('content is required');
  });

  it('should return 400 if message content is empty string', async () => {
    // Arrange
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/modules/module-123/messages',
      body: {
        content: '   ',
      },
    });

    // Act
    const response = await POST(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('content is required');
  });

  it('should trim message content before sending', async () => {
    // Arrange
    const mockUserMessage = {
      id: 'msg-user-1',
      moduleId: 'module-123',
      content: 'What is AI?',
      author: ChatMessageAuthor.User,
      order: 0,
      createdAt: new Date(),
    };

    const mockAIMessage = {
      id: 'msg-ai-1',
      moduleId: 'module-123',
      content: 'AI stands for Artificial Intelligence...',
      author: ChatMessageAuthor.AI,
      order: 1,
      createdAt: new Date(),
    };

    vi.mocked(chatService.sendMessage).mockResolvedValue({ userMessage: mockUserMessage, aiMessage: mockAIMessage } as any);
    vi.mocked(chatService.getMessages).mockResolvedValue([mockUserMessage, mockAIMessage] as any);

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/modules/module-123/messages',
      body: {
        content: '   What is AI?   ',
      },
    });

    // Act
    const response = await POST(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(201);
    expect(chatService.sendMessage).toHaveBeenCalledWith({
      moduleId: 'module-123',
      content: 'What is AI?', // Trimmed
      author: ChatMessageAuthor.User,
    });
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(chatService.sendMessage).mockRejectedValue(
      new Error('Message limit exceeded')
    );

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/modules/module-123/messages',
      body: {
        content: 'Hello',
      },
    });

    // Act
    const response = await POST(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Message limit exceeded');
  });
});
