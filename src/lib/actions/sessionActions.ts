'use server'

import { prisma } from '@/lib/db';
import { OpenAIProvider } from '@/lib/ai/providers/openai';

const openai = new OpenAIProvider('gpt-4o-mini');

export interface CreateSessionInput {
  userId: string;
  topic: string;
  description?: string;
  length?: 'short' | 'medium' | 'long';
  complexity?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ModuleGeneration {
  name: string;
  overview: string;
  order: number;
}

/**
 * Creates a new learning session with AI-generated modules
 *
 * Flow:
 * 1. Call OpenAI to generate module structure based on topic
 * 2. Validate that at least one module was generated
 * 3. Create session and modules in database transaction
 *
 * @throws Error if AI fails to generate valid modules
 * @throws Error if user not found
 */
export async function createLearningSession(input: CreateSessionInput) {
  const { userId, topic, description, length = 'medium', complexity = 'intermediate' } = input;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate modules using OpenAI
  const modules = await generateModulesWithAI(topic, length, complexity, userId);

  if (!modules || modules.length === 0) {
    throw new Error('Failed to generate learning modules. Please try again with a different topic.');
  }

  // Create session with modules in a transaction
  const session = await prisma.learningSession.create({
    data: {
      userId,
      name: topic,
      description: description || `AI-generated learning path for ${topic}`,
      originalPrompt: topic,
      modules: {
        create: modules,
      },
    },
    include: {
      modules: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return session;
}

/**
 * Retrieves all learning sessions for a user
 */
export async function getSessions(userId: string) {
  return prisma.learningSession.findMany({
    where: { userId },
    include: {
      modules: {
        select: {
          id: true,
          isComplete: true,
        },
      },
    },
    orderBy: {
      id: 'desc', // Most recent first
    },
  });
}

/**
 * Retrieves a single learning session by ID
 */
export async function getSessionById(sessionId: string) {
  return prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

/**
 * Internal: Generate learning modules using OpenAI
 *
 * TODO: Implement actual OpenAI integration
 * This is a placeholder that returns mock data for now
 */
async function generateModulesWithAI(
  topic: string,
  length: string,
  complexity: string,
  userId: string
): Promise<ModuleGeneration[]> {
  // TODO: Replace with actual OpenAI API call
  // Example prompt structure:
  // "Create a ${length} learning curriculum for ${topic} at ${complexity} level.
  //  Generate 3-5 modules with clear objectives and overview for each."

  const moduleCount = length === 'short' ? 3 : length === 'medium' ? 5 : 7;

  // Fetch user data to personalize the curriculum
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bio: true, name: true },
  });

  const userContext = user?.bio
    ? `\n\nPersonalize this curriculum based on the learner's background: ${user.bio}`
    : '';

  try {
    const responseContent = await openai.complete(
      [
        {
          role: 'system',
          content: `You are an expert curriculum designer. Create a structured learning path with clear modules.

Return a JSON array of modules with this exact structure:
[
  {
    "name": "Module Title",
    "overview": "2-3 paragraph explanation of the module topic with learning objectives and key concepts",
    "order": 0
  }
]

Each overview MUST be a comprehensive 2-3 paragraph explanation that:
- Paragraph 1: Introduces the module topic and explains what the learner will explore
- Paragraph 2: Lists 3-5 specific learning objectives and key concepts to be covered
- Paragraph 3 (optional): Explains how this module connects to the broader learning path or real-world applications
- Uses full sentences and detailed explanations (NOT just bullet points or one-sentence summaries)
- Is appropriate for ${complexity} level learners
- Provides enough context that a learner could understand the module's scope without needing to chat${user?.bio ? '\n- Is personalized based on the learner\'s background and interests' : ''}`,
        },
        {
          role: 'user',
          content: `Create a ${length} learning curriculum for: ${topic}

Generate ${moduleCount} modules that progressively build knowledge.
Ensure each module has a clear focus and measurable outcomes.${userContext}`,
        },
      ],
      {
        temperature: 0.7,
      }
    );

    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(responseContent);
    const modules = parsed.modules || parsed;

    if (!Array.isArray(modules)) {
      throw new Error('Invalid module structure from OpenAI');
    }

    return modules.map((module: ModuleGeneration, index: number) => ({
      name: module.name,
      overview: module.overview,
      order: index,
    }));
  } catch (error) {
    console.error('Error generating modules with AI:', error);

    // Fallback: return basic module structure with detailed overviews
    return Array.from({ length: moduleCount }, (_, i) => ({
      name: `Module ${i + 1}: ${topic}`,
      overview: `This module provides a comprehensive introduction to ${topic}, designed for ${complexity} level learners. You'll explore fundamental concepts and gain practical understanding through structured lessons.

In this module, you will learn key principles, understand core concepts, develop practical skills, and explore real-world applications. Each lesson builds upon previous knowledge to create a solid foundation.

By the end of this module, you'll have the confidence to apply what you've learned and continue your learning journey with ${topic}.`,
      order: i,
    }));
  }
}
