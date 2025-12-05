/**
 * User Service Test Script
 *
 * Tests all user service methods with sample data
 * Run with: npm run test:user
 */

import { getUserData, setUserData, createUser } from '@/lib/actions/userActions';
import { prisma } from '@/lib/prisma/db';

// Helper function to print formatted output
function printResult(label: string, data: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}`);
  console.log('='.repeat(60));
  console.log(JSON.stringify(data, null, 2));
}

function printError(label: string, error: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}`);
  console.log('='.repeat(60));
  console.log(`Error: ${error.message}`);
}

async function testUserService() {
  console.log('Testing User Service Methods\n');

  try {
    // Get a sample user ID from the database
    const sampleUser = await prisma.user.findFirst();

    if (!sampleUser) {
      console.log('WARNING: No users found in database. Please run: npm run seed');
      return;
    }

    const userId = sampleUser.id;
    console.log(`Using sample user ID: ${userId}\n`);

    // Test 1: getUserData()
    console.log('TEST 1: getUserData()');
    console.log('Input:', { userId });
    const userData = await getUserData(userId);
    printResult('Output - User Data Retrieved', userData);

    // Test 2: setUserData() - Update bio
    console.log('\nTEST 2: setUserData() - Update Bio');
    const updateInput = {
      bio: 'Updated bio: Passionate about TypeScript and modern web development!',
    };
    console.log('Input:', { userId, data: updateInput });
    const updatedUser = await setUserData(userId, updateInput);
    printResult('Output - User Data Updated', updatedUser);

    // Test 3: setUserData() - Update first and last name
    console.log('\nTEST 3: setUserData() - Update Name');
    const nameUpdateInput = {
      firstName: 'Alexandra',
      lastName: 'Johnson-Smith',
    };
    console.log('Input:', { userId, data: nameUpdateInput });
    const updatedUserName = await setUserData(userId, nameUpdateInput);
    printResult('Output - User Name Updated', updatedUserName);

    // Test 4: createUser() - Create new user
    console.log('\nTEST 4: createUser() - Create New User');
    const newUserData = {
      email: `testuser_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      bio: 'This is a test user created by the test script',
    };
    console.log('Input:', newUserData);
    const newUser = await createUser(newUserData);
    printResult('Output - New User Created', newUser);

    // Test 5: createUser() - Try to create duplicate email (should fail)
    console.log('\nTEST 5: createUser() - Duplicate Email (Expected to Fail)');
    const duplicateUserData = {
      email: sampleUser.email, // Use existing email
      firstName: 'Duplicate',
      lastName: 'User',
    };
    console.log('Input:', duplicateUserData);
    try {
      await createUser(duplicateUserData);
      printError('Output - This should have failed!', new Error('Expected duplicate email error'));
    } catch (error: any) {
      printResult('Output - Error Caught (Expected)', {
        message: error.message,
        status: 'Test passed - duplicate prevention working',
      });
    }

    // Test 6: getUserData() - Non-existent user (should fail)
    console.log('\nTEST 6: getUserData() - Non-existent User (Expected to Fail)');
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    console.log('Input:', { userId: fakeUserId });
    try {
      await getUserData(fakeUserId);
      printError('Output - This should have failed!', new Error('Expected user not found error'));
    } catch (error: any) {
      printResult('Output - Error Caught (Expected)', {
        message: error.message,
        status: 'Test passed - error handling working',
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('User Service Tests Completed Successfully!');
    console.log('='.repeat(60));

  } catch (error: any) {
    printError('Unexpected Error in Test Suite', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testUserService()
  .then(() => {
    console.log('\nAll tests finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest suite failed:', error);
    process.exit(1);
  });
