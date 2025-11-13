/**
 * Functional tests for /api/sessions API routes
 * These tests verify the complete HTTP request/response cycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { createMockRequest, getResponseJSON } from '@/lib/test-utils/api';
import * as sessionService from '@/lib/services/sessionService';

// Mock the session service
vi.mock('@/lib/services/sessionService', () => ({
  createLearningSession: vi.fn(),
  getSessions: vi.fn(),
}));

describe('POST /api/sessions - Create Learning Session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a session with valid data', async () => {
    // Arrange
    const mockSession = {
      id: 'session-123',
      userId: 'user-123',
      name: 'Introduction to Machine Learning',
      description: 'Learn ML basics',
      originalPrompt: 'Introduction to Machine Learning',
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          name: 'What is Machine Learning?',
          overview: 'Introduction to ML concepts',
          order: 0,
          isComplete: false,
          learningSessionId: 'session-123',
        },
      ],
    };

    vi.mocked(sessionService.createLearningSession).mockResolvedValue(mockSession as any);

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        userId: 'user-123',
        topic: 'Introduction to Machine Learning',
        description: 'Learn ML basics',
        length: 'medium',
        complexity: 'beginner',
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('session-123');
    expect(data.data.userId).toBe('user-123');
    expect(data.data.name).toBe('Introduction to Machine Learning');
    expect(data.data.modules).toHaveLength(1);
    expect(sessionService.createLearningSession).toHaveBeenCalledWith({
      userId: 'user-123',
      topic: 'Introduction to Machine Learning',
      description: 'Learn ML basics',
      length: 'medium',
      complexity: 'beginner',
    });
  });

  it('should create a session with minimal data (no optional fields)', async () => {
    // Arrange
    const mockSession = {
      id: 'session-456',
      userId: 'user-456',
      name: 'React Hooks',
      description: null,
      originalPrompt: 'React Hooks',
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    };

    vi.mocked(sessionService.createLearningSession).mockResolvedValue(mockSession as any);

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        userId: 'user-456',
        topic: 'React Hooks',
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('React Hooks');
  });

  it('should return 400 if userId is missing', async () => {
    // Arrange
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        topic: 'Machine Learning',
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('userId and topic are required');
  });

  it('should return 400 if topic is missing', async () => {
    // Arrange
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        userId: 'user-123',
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('userId and topic are required');
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(sessionService.createLearningSession).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        userId: 'user-123',
        topic: 'Machine Learning',
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
  });

  it('should handle invalid complexity values gracefully', async () => {
    // Arrange
    const mockSession = {
      id: 'session-789',
      userId: 'user-789',
      name: 'Python Basics',
      description: null,
      originalPrompt: 'Python Basics',
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    };

    vi.mocked(sessionService.createLearningSession).mockResolvedValue(mockSession as any);

    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/sessions',
      body: {
        userId: 'user-789',
        topic: 'Python Basics',
        complexity: 'expert', // Invalid value, should be ignored or handled by service
      },
    });

    // Act
    const response = await POST(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});

describe('GET /api/sessions - Retrieve User Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve all sessions for a user', async () => {
    // Arrange
    const mockSessions = [
      {
        id: 'session-1',
        userId: 'user-123',
        name: 'Machine Learning Basics',
        description: 'ML fundamentals',
        originalPrompt: 'Machine Learning',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'session-2',
        userId: 'user-123',
        name: 'React Advanced Patterns',
        description: 'Advanced React',
        originalPrompt: 'React patterns',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
    ];

    vi.mocked(sessionService.getSessions).mockResolvedValue(mockSessions as any);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/sessions?userId=user-123',
    });

    // Act
    const response = await GET(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe('Machine Learning Basics');
    expect(sessionService.getSessions).toHaveBeenCalledWith('user-123');
  });

  it('should return empty array if user has no sessions', async () => {
    // Arrange
    vi.mocked(sessionService.getSessions).mockResolvedValue([] as any);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/sessions?userId=user-456',
    });

    // Act
    const response = await GET(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return 400 if userId query parameter is missing', async () => {
    // Arrange
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/sessions',
    });

    // Act
    const response = await GET(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain('userId');
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(sessionService.getSessions).mockRejectedValue(
      new Error('Database query timeout')
    );

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/sessions?userId=user-123',
    });

    // Act
    const response = await GET(request);
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database query timeout');
  });
});
