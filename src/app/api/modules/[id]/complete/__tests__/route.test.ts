/**
 * Functional tests for /api/modules/[id]/complete API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '../route';
import { createMockRequest, getResponseJSON } from '@/lib/test-utils/api';
import * as moduleService from '@/lib/services/moduleService';

// Mock the module service
vi.mock('@/lib/services/moduleService', () => ({
  markModuleComplete: vi.fn(),
}));

describe('PATCH /api/modules/[id]/complete - Mark Module Complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark a module as complete', async () => {
    // Arrange
    const mockResult = {
      module: {
        id: 'module-123',
        name: 'Introduction to Machine Learning',
        overview: 'Learn the basics of ML',
        order: 0,
        isComplete: true, // Now complete
        learningSessionId: 'session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        learningSession: {
          id: 'session-123',
          name: 'ML Course',
          userId: 'user-123',
          description: 'Learn ML',
          originalPrompt: 'ML',
          modules: [],
        },
      },
      sessionComplete: false,
    };

    vi.mocked(moduleService.markModuleComplete).mockResolvedValue(mockResult as any);

    const request = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/modules/module-123/complete',
    });

    // Act
    const response = await PATCH(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.module.isComplete).toBe(true);
    expect(data.message).toContain('complete');
    expect(moduleService.markModuleComplete).toHaveBeenCalledWith('module-123');
  });

  it('should handle module not found error', async () => {
    // Arrange
    vi.mocked(moduleService.markModuleComplete).mockRejectedValue(
      new Error('Module not found')
    );

    const request = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/modules/nonexistent/complete',
    });

    // Act
    const response = await PATCH(request, { params: { id: 'nonexistent' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Module not found');
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(moduleService.markModuleComplete).mockRejectedValue(
      new Error('Database update failed')
    );

    const request = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/modules/module-123/complete',
    });

    // Act
    const response = await PATCH(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database update failed');
  });

  it('should handle multiple modules completing in succession', async () => {
    // Arrange
    const mockResults = [
      {
        module: {
          id: 'module-1',
          name: 'Module 1',
          overview: 'First module',
          order: 0,
          isComplete: true,
          learningSessionId: 'session-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          learningSession: { id: 'session-123', name: 'Test', userId: 'user-1', description: '', originalPrompt: '', modules: [] },
        },
        sessionComplete: false,
      },
      {
        module: {
          id: 'module-2',
          name: 'Module 2',
          overview: 'Second module',
          order: 1,
          isComplete: true,
          learningSessionId: 'session-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          learningSession: { id: 'session-123', name: 'Test', userId: 'user-1', description: '', originalPrompt: '', modules: [] },
        },
        sessionComplete: true,
      },
    ];

    vi.mocked(moduleService.markModuleComplete)
      .mockResolvedValueOnce(mockResults[0] as any)
      .mockResolvedValueOnce(mockResults[1] as any);

    // Act
    const request1 = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/modules/module-1/complete',
    });
    const response1 = await PATCH(request1, { params: { id: 'module-1' } });
    const data1 = await getResponseJSON(response1);

    const request2 = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/modules/module-2/complete',
    });
    const response2 = await PATCH(request2, { params: { id: 'module-2' } });
    const data2 = await getResponseJSON(response2);

    // Assert
    expect(response1.status).toBe(200);
    expect(data1.data.module.id).toBe('module-1');
    expect(response2.status).toBe(200);
    expect(data2.data.module.id).toBe('module-2');
  });
});
