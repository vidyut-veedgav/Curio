/**
 * Database Seed Script
 *
 * Populates the database with sample data for testing services
 * Run with: npm run seed
 */

import { prisma } from '@/lib/db';
import { ChatMessageAuthor } from '@prisma/client';

async function main() {
  console.log('Starting database seed...\n');

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log('Cleaning existing data...');
  await prisma.chatMessage.deleteMany();
  await prisma.module.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned existing data\n');

  // Create test users
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Software engineer passionate about learning new technologies',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      bio: 'Data scientist exploring AI and machine learning',
    },
  });

  console.log(`Created user: ${user1.name} (ID: ${user1.id})`);
  console.log(`Created user: ${user2.name} (ID: ${user2.id})\n`);

  // Create learning sessions
  console.log('Creating learning sessions...');
  const session1 = await prisma.learningSession.create({
    data: {
      userId: user1.id,
      name: 'Introduction to TypeScript',
      description: 'Learn the fundamentals of TypeScript for modern web development',
      originalPrompt: 'I want to learn TypeScript basics',
      modules: {
        create: [
          {
            name: 'TypeScript Basics',
            overview: 'Introduction to TypeScript syntax, types, and basic concepts. Learn about primitive types, type inference, and type annotations.',
            order: 0,
            isComplete: false,
          },
          {
            name: 'Advanced Types',
            overview: 'Explore union types, intersection types, generics, and utility types. Understand how to create flexible and reusable type definitions.',
            order: 1,
            isComplete: false,
          },
          {
            name: 'TypeScript with React',
            overview: 'Apply TypeScript to React applications. Learn how to type components, props, state, and hooks effectively.',
            order: 2,
            isComplete: false,
          },
        ],
      },
    },
    include: {
      modules: true,
    },
  });

  const session2 = await prisma.learningSession.create({
    data: {
      userId: user1.id,
      name: 'Machine Learning Fundamentals',
      description: 'Understanding core concepts in machine learning and AI',
      originalPrompt: 'Teach me machine learning',
      modules: {
        create: [
          {
            name: 'What is Machine Learning?',
            overview: 'Introduction to ML concepts, types of learning (supervised, unsupervised, reinforcement), and real-world applications.',
            order: 0,
            isComplete: true,
          },
          {
            name: 'Linear Regression',
            overview: 'Learn the fundamentals of linear regression, cost functions, and gradient descent optimization.',
            order: 1,
            isComplete: false,
          },
        ],
      },
    },
    include: {
      modules: true,
    },
  });

  const session3 = await prisma.learningSession.create({
    data: {
      userId: user2.id,
      name: 'Web Development with Next.js',
      description: 'Master modern web development using Next.js and React',
      originalPrompt: 'Next.js tutorial',
      modules: {
        create: [
          {
            name: 'Next.js Fundamentals',
            overview: 'Learn about file-based routing, server components, and the App Router architecture.',
            order: 0,
            isComplete: false,
          },
        ],
      },
    },
    include: {
      modules: true,
    },
  });

  console.log(`Created session: ${session1.name} (ID: ${session1.id})`);
  console.log(`   - Modules: ${session1.modules.length}`);
  console.log(`Created session: ${session2.name} (ID: ${session2.id})`);
  console.log(`   - Modules: ${session2.modules.length}`);
  console.log(`Created session: ${session3.name} (ID: ${session3.id})`);
  console.log(`   - Modules: ${session3.modules.length}\n`);

  // Create chat messages for one of the modules
  console.log('Creating chat messages...');
  const firstModule = session1.modules[0];

  await prisma.chatMessage.createMany({
    data: [
      {
        moduleId: firstModule.id,
        content: 'Hi! Can you explain what TypeScript is?',
        author: ChatMessageAuthor.User,
        order: 0,
      },
      {
        moduleId: firstModule.id,
        content: 'Hello! TypeScript is a superset of JavaScript that adds static typing to the language. It helps catch errors during development and makes your code more maintainable. Think of it as JavaScript with extra features that help you write safer code!',
        author: ChatMessageAuthor.AI,
        order: 1,
      },
      {
        moduleId: firstModule.id,
        content: 'What are the main benefits of using TypeScript?',
        author: ChatMessageAuthor.User,
        order: 2,
      },
      {
        moduleId: firstModule.id,
        content: 'Great question! The main benefits are:\n\n1. **Type Safety**: Catch errors before runtime\n2. **Better IDE Support**: Get autocomplete and inline documentation\n3. **Improved Refactoring**: Confidently rename variables and functions\n4. **Self-Documenting Code**: Types serve as inline documentation\n5. **Enhanced Collaboration**: Teams can understand code interfaces easily',
        author: ChatMessageAuthor.AI,
        order: 3,
      },
    ],
  });

  console.log(`Created 4 chat messages for module: ${firstModule.name}\n`);

  // Summary
  console.log('Seed Summary:');
  console.log('================');
  console.log(`Users created: 2`);
  console.log(`Sessions created: 3`);
  console.log(`Modules created: ${session1.modules.length + session2.modules.length + session3.modules.length}`);
  console.log(`Chat messages created: 4\n`);

  console.log('Test Data IDs (use these in your test scripts):');
  console.log('==================================================');
  console.log(`User 1 ID: ${user1.id}`);
  console.log(`User 2 ID: ${user2.id}`);
  console.log(`Session 1 ID: ${session1.id}`);
  console.log(`Session 2 ID: ${session2.id}`);
  console.log(`Session 3 ID: ${session3.id}`);
  console.log(`Module 1 ID: ${firstModule.id}`);
  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
