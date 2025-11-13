/**
 * Functional tests for /api/modules/[id] API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { createMockRequest, getResponseJSON } from '@/lib/test-utils/api';
import * as moduleService from '@/lib/services/moduleService';

// Mock the module service
vi.mock('@/lib/services/moduleService', () => ({
  getModuleById: vi.fn(),
}));

describe('GET /api/modules/[id] - Retrieve Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve a module by ID', async () => {
    // Arrange
    const mockModule = {
      id: 'module-123',
      name: 'Introduction to Machine Learning',
      overview: 'Learn the basics of ML',
      order: 0,
      isComplete: false,
      learningSessionId: 'session-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      learningSession: {
        id: 'session-123',
        name: 'ML Course',
        userId: 'user-123',
      },
    };

    vi.mocked(moduleService.getModuleById).mockResolvedValue(mockModule);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/module-123',
    });

    // Act
    const response = await GET(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('module-123');
    expect(data.data.name).toBe('Introduction to Machine Learning');
    expect(moduleService.getModuleById).toHaveBeenCalledWith('module-123');
  });

  it('should return 404 if module not found', async () => {
    // Arrange
    vi.mocked(moduleService.getModuleById).mockResolvedValue(null);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/nonexistent',
    });

    // Act
    const response = await GET(request, { params: { id: 'nonexistent' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(404);
    expect(data.error).toContain('Module not found');
  });

  it('should return 500 if service throws an error', async () => {
    // Arrange
    vi.mocked(moduleService.getModuleById).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/modules/module-123',
    });

    // Act
    const response = await GET(request, { params: { id: 'module-123' } });
    const data = await getResponseJSON(response);

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
  });
});
