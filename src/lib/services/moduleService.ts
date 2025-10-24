import { prisma } from '@/lib/db';

/**
 * Retrieves all modules for a learning session
 */
export async function getModules(sessionId: string) {
  return prisma.module.findMany({
    where: { learningSessionId: sessionId },
    orderBy: { order: 'asc' },
    include: {
      chatMessages: {
        select: {
          id: true,
        },
      },
    },
  });
}

/**
 * Retrieves a single module by ID
 */
export async function getModuleById(moduleId: string) {
  return prisma.module.findUnique({
    where: { id: moduleId },
    include: {
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
