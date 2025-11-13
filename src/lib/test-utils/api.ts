/**
 * Test utilities for Next.js API route testing
 */

import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(options: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}): NextRequest {
  const { method, url, body, headers = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  } as RequestInit;

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit as any);
}

/**
 * Helper to parse response JSON
 */
export async function getResponseJSON(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Creates a test user ID for consistent testing
 */
export function createTestUserId(): string {
  return `test-user-${Date.now()}`;
}

/**
 * Mock session data for testing
 */
export const mockSessionData = {
  validSession: {
    userId: 'test-user-123',
    topic: 'Introduction to Machine Learning',
    description: 'Learn the basics of machine learning',
    length: 'medium' as const,
    complexity: 'beginner' as const,
  },
  minimalSession: {
    userId: 'test-user-123',
    topic: 'React Hooks',
  },
};
