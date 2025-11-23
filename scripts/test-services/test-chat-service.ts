/**
 * Chat Service Test Script
 *
 * Tests all chat service methods with sample data
 * Run with: npm run test:chat
 */

import { getMessages, sendMessage, Message } from '@/lib/actions/chatService';
import { prisma } from '@/lib/db';

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

function printConversation(messages: Message[]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Conversation History');
  console.log('='.repeat(60));

  messages.forEach((msg, index) => {
    const prefix = msg.role === 'user' ? '[User]' : '[AI]';
    console.log(`\n${prefix} (Message ${index + 1}):`);
    console.log('-'.repeat(60));
    console.log(msg.content);
  });

  console.log('\n' + '='.repeat(60));
}

async function testChatService() {
  console.log('Testing Chat Service Methods\n');

  try {
    // Get a sample module from the database
    const sampleModule = await prisma.module.findFirst({
      include: {
        learningSession: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!sampleModule) {
      console.log('WARNING: No modules found in database. Please run: npm run seed');
      return;
    }

    const moduleId = sampleModule.id;
    console.log(`Using module ID: ${moduleId}`);
    console.log(`Module: ${sampleModule.name}`);
    console.log(`Session: ${sampleModule.learningSession.name}\n`);

    // Test 1: getMessages() - Get existing messages
    console.log('TEST 1: getMessages() - Retrieve Existing Messages');
    console.log('Input:', { moduleId });
    const existingMessages = await getMessages(moduleId);
    printResult(`Output - Found ${existingMessages.length} Existing Messages`, existingMessages);

    if (existingMessages.length > 0) {
      printConversation(existingMessages);
    }

    // Test 2: sendMessage() - Send user message and get AI response
    console.log('\nTEST 2: sendMessage() - Send User Message (Triggers AI Response)');
    const userMessage1 = {
      moduleId,
      content: 'Can you give me a quick summary of what I need to learn in this module?',
      role: 'user' as const,
    };
    console.log('Input:', userMessage1);
    console.log('Sending message and generating AI response...');

    const startTime1 = Date.now();
    const response1 = await sendMessage(userMessage1);
    const endTime1 = Date.now();

    printResult(`Output - User Message + AI Response (${endTime1 - startTime1}ms)`, {
      userMessage: {
        role: response1.userMessage.role,
        content: response1.userMessage.content,
      },
      aiMessage: response1.aiMessage
        ? {
            role: response1.aiMessage.role,
            content: response1.aiMessage.content,
          }
        : null,
    });

    // Test 3: sendMessage() - Send another user message
    console.log('\nTEST 3: sendMessage() - Follow-up User Message');
    const userMessage2 = {
      moduleId,
      content: 'What would you recommend I focus on first?',
      role: 'user' as const,
    };
    console.log('Input:', userMessage2);
    console.log('Sending message and generating AI response...');

    const startTime2 = Date.now();
    const response2 = await sendMessage(userMessage2);
    const endTime2 = Date.now();

    printResult(`Output - User Message + AI Response (${endTime2 - startTime2}ms)`, {
      userMessage: {
        role: response2.userMessage.role,
        content: response2.userMessage.content,
      },
      aiMessage: response2.aiMessage
        ? {
            role: response2.aiMessage.role,
            content: response2.aiMessage.content,
          }
        : null,
    });

    // Test 4: getMessages() - View updated conversation
    console.log('\nTEST 4: getMessages() - View Full Conversation After New Messages');
    console.log('Input:', { moduleId });
    const updatedMessages = await getMessages(moduleId);
    printResult(`Output - Now ${updatedMessages.length} Total Messages`, {
      totalMessages: updatedMessages.length,
      lastMessage: updatedMessages[updatedMessages.length - 1],
    });

    printConversation(updatedMessages);

    // Test 5: sendMessage() - Send assistant message directly (no auto-response)
    console.log('\nTEST 5: sendMessage() - Send Assistant Message Directly (No Auto-Response)');
    const assistantMessageDirect = {
      moduleId,
      content: 'This is a manually added assistant message for testing purposes.',
      role: 'assistant' as const,
    };
    console.log('Input:', assistantMessageDirect);
    const response3 = await sendMessage(assistantMessageDirect);

    printResult('Output - Assistant Message Added (No Auto-Response)', {
      userMessage: {
        role: response3.userMessage.role,
        content: response3.userMessage.content,
      },
      aiMessage: response3.aiMessage,
      note: 'No AI auto-response because role was assistant, not user',
    });

    // Test 6: Message limit test (create a module with many messages)
    console.log('\nTEST 6: Message Limit Enforcement');
    console.log('Creating a new test session and module...');

    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log('WARNING: No users found for limit test');
    } else {
      const limitTestSession = await prisma.learningSession.create({
        data: {
          userId: testUser.id,
          name: 'Message Limit Test Session',
          description: 'Testing message limits',
          originalPrompt: 'Test',
          modules: {
            create: {
              name: 'Limit Test Module',
              overview: 'Module for testing message limits',
              order: 0,
              messages: [],
            },
          },
        },
        include: {
          modules: true,
        },
      });

      const limitTestModuleId = limitTestSession.modules[0].id;

      // Add 100 messages to reach the limit
      console.log('Adding 100 messages to reach the limit...');
      const messagesToCreate: Message[] = [];
      for (let i = 0; i < 100; i++) {
        messagesToCreate.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Test message ${i + 1}`,
        });
      }

      await prisma.module.update({
        where: { id: limitTestModuleId },
        data: { messages: messagesToCreate },
      });

      console.log('Added 100 messages (limit is 100)');

      // Try to add one more user message (should fail)
      console.log('\nAttempting to add message 101 (should fail)...');
      const currentMessages = await getMessages(limitTestModuleId);
      console.log(`Current message count: ${currentMessages.length}`);

      try {
        await sendMessage({
          moduleId: limitTestModuleId,
          content: 'This should fail',
          role: 'user',
        });
        console.log('ERROR: Expected this to fail at 100 messages, but it succeeded!');
      } catch (error: any) {
        printResult('Output - Message Limit Enforced (Expected)', {
          message: error.message,
          status: 'Test passed - message limit working',
          currentCount: currentMessages.length,
          limit: 100,
        });
      }

      // Clean up test session
      console.log('\nCleaning up test session...');
      await prisma.module.delete({
        where: { id: limitTestModuleId },
      });
      await prisma.learningSession.delete({
        where: { id: limitTestSession.id },
      });
      console.log('Test session cleaned up');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Chat Service Tests Completed Successfully!');
    console.log('='.repeat(60));

  } catch (error: any) {
    printError('Unexpected Error in Test Suite', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testChatService()
  .then(() => {
    console.log('\nAll tests finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest suite failed:', error);
    process.exit(1);
  });
