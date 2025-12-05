import { Prisma } from '@prisma/client';

export const updateParentTimestampExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      module: {
        async create({ args, query }) {
          const result = await query(args);

          if (result.learningSessionId) {
            await client.learningSession.update({
              where: { id: result.learningSessionId },
              data: { lastUpdated: new Date() }
            });
          }

          return result;
        },
        async update({ args, query }) {
          const result = await query(args);

          if (result.learningSessionId) {
            await client.learningSession.update({
              where: { id: result.learningSessionId },
              data: { lastUpdated: new Date() }
            });
          }

          return result;
        },
        async updateMany({ args, query }) {
          const result = await query(args);

          // For updateMany, learningSessionId might be a string or a filter object
          const sessionId = args.where?.learningSessionId;
          if (sessionId && typeof sessionId === 'string') {
            await client.learningSession.update({
              where: { id: sessionId },
              data: { lastUpdated: new Date() }
            });
          }

          return result;
        }
      }
    }
  });
});