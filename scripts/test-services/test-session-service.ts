/**
 * Session Service Test Script
 *
 * Tests all session service methods with sample data
 * Run with: npm run test:session
 */

import {
  createLearningSession,
  getSessions,
  getSessionById,
} from '@/lib/services/sessionService';
import { prisma } from '@/lib/db';

// Helper function to print formatted output
function printResult(label: string, data: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔹 ${label}`);
  console.log('='.repeat(60));
  console.log(JSON.stringify(data, null, 2));
}

function printError(label: string, error: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`❌ ${label}`);
  console.log('='.repeat(60));
  console.log(`Error: ${error.message}`);
}

async function testSessionService() {
  console.log('🧪 Testing Session Service Methods\n');

  try {
    // Get a sample user ID from the database
    const sampleUser = await prisma.user.findFirst();

    if (!sampleUser) {
      console.log('⚠️  No users found in database. Please run: npm run seed');
      return;
    }

    const userId = sampleUser.id;
    console.log(`📌 Using sample user ID: ${userId}\n`);

    // Test 1: getSessions() - Get all sessions for user
    console.log('TEST 1: getSessions() - Get All User Sessions');
    console.log('Input:', { userId });
    const sessions = await getSessions(userId);
    printResult(`Output - Found ${sessions.length} Sessions`, sessions);

    // Test 2: getSessionById() - Get specific session
    if (sessions.length > 0) {
      console.log('\nTEST 2: getSessionById() - Get Specific Session');
      const sessionId = sessions[0].id;
      console.log('Input:', { sessionId });
      const session = await getSessionById(sessionId);
      printResult('Output - Session Details with Modules', session);
    }

    // Test 3: createLearningSession() - Short beginner session
    console.log('\nTEST 3: createLearningSession() - Short Beginner Session');
    const shortSessionInput = {
      userId,
      topic: 'Python Basics',
      description: 'Learn fundamental Python programming concepts',
      length: 'short' as const,
      complexity: 'beginner' as const,
    };
    console.log('Input:', shortSessionInput);
    console.log('⏳ Calling OpenAI API to generate modules...');

    const startTime1 = Date.now();
    const shortSession = await createLearningSession(shortSessionInput);
    const endTime1 = Date.now();

    printResult(
      `Output - Session Created with AI-Generated Modules (${endTime1 - startTime1}ms)`,
      shortSession
    );

    // Test 4: createLearningSession() - Medium intermediate session
    console.log('\nTEST 4: createLearningSession() - Medium Intermediate Session');
    const mediumSessionInput = {
      userId,
      topic: 'RESTful API Design',
      description: 'Master the principles of designing RESTful APIs',
      length: 'medium' as const,
      complexity: 'intermediate' as const,
    };
    console.log('Input:', mediumSessionInput);
    console.log('⏳ Calling OpenAI API to generate modules...');

    const startTime2 = Date.now();
    const mediumSession = await createLearningSession(mediumSessionInput);
    const endTime2 = Date.now();

    printResult(
      `Output - Session Created with AI-Generated Modules (${endTime2 - startTime2}ms)`,
      mediumSession
    );

    // Test 5: createLearningSession() - Long advanced session
    console.log('\nTEST 5: createLearningSession() - Long Advanced Session');
    const longSessionInput = {
      userId,
      topic: 'Distributed Systems Architecture',
      description: 'Deep dive into designing scalable distributed systems',
      length: 'long' as const,
      complexity: 'advanced' as const,
    };
    console.log('Input:', longSessionInput);
    console.log('⏳ Calling OpenAI API to generate modules...');

    const startTime3 = Date.now();
    const longSession = await createLearningSession(longSessionInput);
    const endTime3 = Date.now();

    printResult(
      `Output - Session Created with AI-Generated Modules (${endTime3 - startTime3}ms)`,
      longSession
    );

    // Test 6: createLearningSession() - Invalid user (should fail)
    console.log('\nTEST 6: createLearningSession() - Invalid User (Expected to Fail)');
    const invalidUserInput = {
      userId: '00000000-0000-0000-0000-000000000000',
      topic: 'Test Topic',
    };
    console.log('Input:', invalidUserInput);

    try {
      await createLearningSession(invalidUserInput);
      printError('Output - This should have failed!', new Error('Expected user not found error'));
    } catch (error: any) {
      printResult('Output - Error Caught (Expected)', {
        message: error.message,
        status: 'Test passed - error handling working',
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Session Creation Summary:');
    console.log('='.repeat(60));
    console.log(`Short session modules: ${shortSession.modules.length}`);
    console.log(`Medium session modules: ${mediumSession.modules.length}`);
    console.log(`Long session modules: ${longSession.modules.length}`);
    console.log('\n✅ Session Service Tests Completed Successfully!');
    console.log('='.repeat(60));

  } catch (error: any) {
    printError('Unexpected Error in Test Suite', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testSessionService()
  .then(() => {
    console.log('\n✅ All tests finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
