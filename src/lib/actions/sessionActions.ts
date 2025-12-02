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
  content: string;
  order: number;
}

/**
 * Creates a new learning session with AI-generated modules
 *
 * Flow:
 * 1. Call OpenAI to generate session description and module structure based on topic
 * 2. Validate that at least one module was generated
 * 3. Iteratively generate content for each module
 * 4. Create session and modules in database transaction
 *
 * @throws Error if AI fails to generate valid modules
 * @throws Error if user not found
 */
export async function createLearningSession(input: CreateSessionInput) {
  const { userId, topic, length = 'medium', complexity = 'intermediate' } = input;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate session title, description, and modules using OpenAI
  const { sessionTitle, sessionDescription, modules } = await generateModules(topic, length, complexity);

  if (!modules || modules.length === 0) {
    throw new Error('Failed to generate learning modules. Please try again with a different topic.');
  }

  // Create session with modules in a transaction
  const session = await prisma.learningSession.create({
    data: {
      userId,
      name: sessionTitle,
      description: sessionDescription,
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
export async function getLearningSessions(userId: string) {
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
export async function getLearningSessionById(sessionId: string) {
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
 * Helper: Generate content (overview) for a specific module
 *
 * @param moduleName - The name of the module
 * @param topic - The overall topic of the learning session
 * @param complexity - The complexity level
 * @returns A 2-3 paragraph overview with learning objectives
 */
async function generateModuleContent(
  moduleName: string,
  topic: string,
  complexity: string
): Promise<string> {
  try {
    const responseContent = await openai.complete(
      [
        {
          role: 'system',
          content: `You are an expert curriculum content writer. Create detailed module overviews that guide learners effectively.

Your response should be 2-3 paragraphs that include:
- A brief introduction to the module's focus
- 3-5 specific learning objectives
- Key concepts and skills that will be covered
- How this fits into the broader learning path

Write at a ${complexity} level. Return only the overview text, no JSON or formatting.`,
        },
        {
          role: 'user',
          content: `Write a detailed overview for this module:

Module: ${moduleName}
Topic: ${topic}
Level: ${complexity}

Create engaging, clear content that helps learners understand what they'll gain from this module.`,
        },
      ],
      {
        temperature: 0.7,
      }
    );

    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }

    return responseContent.trim();
  } catch (error) {
    console.error('Error generating module content:', error);
    // Fallback content
    return `This module focuses on ${moduleName.toLowerCase()} within the context of ${topic}. You will explore key concepts and develop practical skills appropriate for ${complexity}-level learners.\n\nThrough this module, you'll gain hands-on experience and build a solid foundation that prepares you for more advanced topics. The content is designed to be engaging and applicable to real-world scenarios.`;
  }
}

/**
 * Internal: Generate learning session title, description, and modules using OpenAI
 *
 * First generates the session title, description, and module structure (names and order),
 * then iteratively populates each module with detailed content.
 */
async function generateModules(
  topic: string,
  length: string,
  complexity: string
): Promise<{ sessionTitle: string; sessionDescription: string; modules: ModuleGeneration[] }> {
  const moduleCount = length === 'short' ? 3 : length === 'medium' ? 5 : 7;

  try {
    // Step 1: Generate session title, description, and module structure in a single call
    const responseContent = await openai.complete(
      [
        {
          role: 'system',
          content: `You are an expert curriculum designer. Create a structured learning path with a session title, description, and clear module titles.

Return a JSON object with this exact structure:
{
  "sessionTitle": "A concise, engaging title for the learning session",
  "sessionDescription": "A 2-3 sentence overview of what this learning session covers and what the learner will achieve",
  "modules": [
    {
      "name": "Module Title",
      "order": 0
    }
  ]
}

The session title should:
- Be concise (4-8 words)
- Be engaging and clear
- Accurately reflect the topic

The session description should:
- Summarize the overall learning journey
- Highlight key outcomes and skills
- Be engaging and motivating

Each module name should:
- Be clear and descriptive
- Focus on a specific aspect of the topic
- Build progressively in complexity
- Be appropriate for ${complexity} level learners`,
        },
        {
          role: 'user',
          content: `Create a ${length} learning curriculum for: ${topic}

Generate:
1. A concise, engaging session title
2. A compelling session description (2-3 sentences)
3. ${moduleCount} module titles that progressively build knowledge

Ensure each module has a clear focus and flows logically to the next.`,
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

    if (!parsed.sessionTitle || !parsed.sessionDescription || !Array.isArray(parsed.modules)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const sessionTitle = parsed.sessionTitle;
    const sessionDescription = parsed.sessionDescription;
    const moduleStructure = parsed.modules;

    // Step 2: Generate content for each module iteratively
    const modules: ModuleGeneration[] = [];

    for (let i = 0; i < moduleStructure.length; i++) {
      const moduleName = moduleStructure[i].name;
      const content = await generateModuleContent(moduleName, topic, complexity);

      modules.push({
        name: moduleName,
        overview: content,
        content: content,
        order: i,
      });
    }

    return { sessionTitle, sessionDescription, modules };
  } catch (error) {
    console.error('Error generating modules with AI:', error);

    // Fallback: return basic session title, description, and module structure
    const sessionTitle = `Learn ${topic}`;
    const sessionDescription = `Explore the fundamentals of ${topic} through a structured learning path designed for ${complexity}-level learners. This ${length} curriculum will guide you through key concepts and practical applications, building your knowledge progressively.`;

    const fallbackModules: ModuleGeneration[] = [];

    for (let i = 0; i < moduleCount; i++) {
      const moduleName = `Module ${i + 1}: ${topic}`;
      const fallbackContent = `This module covers fundamental concepts of ${topic}. You will learn key principles and practical applications appropriate for ${complexity}-level learners.\n\nThe content is structured to build your knowledge progressively, ensuring you develop both theoretical understanding and practical skills.`;

      fallbackModules.push({
        name: moduleName,
        overview: fallbackContent,
        content: fallbackContent,
        order: i,
      });
    }

    return { sessionTitle, sessionDescription, modules: fallbackModules };
  }
}
