'use server'

import { prisma } from '@/lib/db';

/**
 * Retrieves all modules for a learning session
 */
export async function getModules(sessionId: string) {
  return prisma.module.findMany({
    where: { learningSessionId: sessionId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      overview: true,
      order: true,
      isComplete: true,
      messages: true,
      currentFollowUps: true,
      learningSessionId: true,
    },
  });
}

/**
 * Retrieves a single module by ID
 */
export async function getModuleById(moduleId: string) {
  return prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      name: true,
      overview: true,
      content: true,
      order: true,
      isComplete: true,
      messages: true,
      currentFollowUps: true,
      learningSessionId: true,
      learningSession: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Marks a module as complete and updates session progress
 *
 * Business logic:
 * - Users can mark modules complete even if chat is left halfway
 * - Module completion triggers session progress update
 */
export async function markModuleComplete(moduleId: string) {
  const module = await prisma.module.update({
    where: { id: moduleId },
    data: { isComplete: true },
    include: {
      learningSession: {
        include: {
          modules: true,
        },
      },
    },
  });

  // Check if all modules in the session are complete
  const allModulesComplete = module.learningSession.modules.every((m) => m.isComplete);

  // TODO: If needed, add a progress field to LearningSession model
  // and update it here with percentage complete

  return {
    module,
    sessionComplete: allModulesComplete,
  };
}

/**
 * Gets the title of a module
 */
export async function getModuleTitle(moduleId: string): Promise<string> {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { name: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  return module.name;
}

/**
 * Gets the current follow-up questions for a module
 */
export async function getCurrentFollowUps(moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { currentFollowUps: true },
  });

  return module?.currentFollowUps;
}

/**
 * Adds follow-up questions to a module's currentFollowUps field
 */
export async function addCurrentFollowUps(moduleId: string, followUps: unknown) {
  return prisma.module.update({
    where: { id: moduleId },
    data: { currentFollowUps: followUps as any },
  });
}
