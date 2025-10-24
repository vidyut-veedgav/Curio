/**
 * Database Clean Script
 *
 * Deletes all records from the database
 * Run with: npm run clean
 *
 * WARNING: This will permanently delete all data!
 * Use this to reset your database to a clean state.
 */

import { prisma } from '@/lib/db';
import * as readline from 'readline';

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will delete ALL data from your database!\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function cleanDatabase() {
  console.log('🗑️  Database Clean Script\n');

  // Ask for confirmation
  const confirmed = await askConfirmation();

  if (!confirmed) {
    console.log('\n❌ Operation cancelled. No data was deleted.\n');
    return;
  }

  console.log('\n🧹 Starting database cleanup...\n');

  try {
    // Get counts before deletion
    const counts = {
      chatMessages: await prisma.chatMessage.count(),
      modules: await prisma.module.count(),
      sessions: await prisma.learningSession.count(),
      users: await prisma.user.count(),
    };

    console.log('📊 Current database state:');
    console.log(`   Chat Messages: ${counts.chatMessages}`);
    console.log(`   Modules: ${counts.modules}`);
    console.log(`   Learning Sessions: ${counts.sessions}`);
    console.log(`   Users: ${counts.users}\n`);

    console.log('🗑️  Deleting records...\n');

    // Delete in order to respect foreign key constraints
    // ChatMessage -> Module -> LearningSession -> User

    console.log('   Deleting chat messages...');
    const deletedMessages = await prisma.chatMessage.deleteMany();
    console.log(`   ✅ Deleted ${deletedMessages.count} chat messages`);

    console.log('   Deleting modules...');
    const deletedModules = await prisma.module.deleteMany();
    console.log(`   ✅ Deleted ${deletedModules.count} modules`);

    console.log('   Deleting learning sessions...');
    const deletedSessions = await prisma.learningSession.deleteMany();
    console.log(`   ✅ Deleted ${deletedSessions.count} learning sessions`);

    console.log('   Deleting users...');
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database cleaned successfully!');
    console.log('='.repeat(60));
    console.log('\n📝 Summary:');
    console.log(`   Total chat messages deleted: ${deletedMessages.count}`);
    console.log(`   Total modules deleted: ${deletedModules.count}`);
    console.log(`   Total sessions deleted: ${deletedSessions.count}`);
    console.log(`   Total users deleted: ${deletedUsers.count}`);
    console.log('\n💡 Tip: Run "npm run seed" to populate with test data\n');

  } catch (error: any) {
    console.error('\n❌ Error cleaning database:', error);
    console.error('Details:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the clean script
cleanDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Clean script failed:', error);
    process.exit(1);
  });
