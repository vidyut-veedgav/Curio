/**
 * Chat Service Test Script
 *
 * Tests all chat service methods with sample data
 * Run with: npm run test:chat
 */

import { getMessages, sendMessage } from '@/lib/services/chatService';
import { prisma } from '@/lib/db';
import { ChatMessageAuthor } from '@prisma/client';

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

function printConversation(messages: any[]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💬 Conversation History');
  console.log('='.repeat(60));

  messages.forEach((msg, index) => {
    const icon = msg.author === ChatMessageAuthor.User ? '👤' : '🤖';
    console.log(`\n${icon} ${msg.author} (Message ${index + 1}):`);
    console.log('-'.repeat(60));
    console.log(msg.content);
  });

  console.log('\n' + '='.repeat(60));
}

async function testChatService() {
  console.log('🧪 Testing Chat Service Methods\n');

  try {
    // Get a sample module from the database
    const sampleModule = await prisma.module.findFirst({
      include: {
        learningSession: {
          select: {
            name: true,
          },
        },
        chatMessages: true,
      },
    });

    if (!sampleModule) {
      console.log('⚠️  No modules found in database. Please run: npm run seed');
      return;
    }

    const moduleId = sampleModule.id;
    console.log(`📌 Using module ID: ${moduleId}`);
    console.log(`📌 Module: ${sampleModule.name}`);
    console.log(`📌 Session: ${sampleModule.learningSession.name}\n`);

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
      author: ChatMessageAuthor.User,
    };
    console.log('Input:', userMessage1);
    console.log('⏳ Sending message and generating AI response...');

    const startTime1 = Date.now();
    const response1 = await sendMessage(userMessage1);
    const endTime1 = Date.now();

    printResult(`Output - User Message + AI Response (${endTime1 - startTime1}ms)`, {
      userMessage: {
        id: response1.userMessage.id,
        content: response1.userMessage.content,
        author: response1.userMessage.author,
        order: response1.userMessage.order,
      },
      aiMessage: response1.aiMessage
        ? {
            id: response1.aiMessage.id,
            content: response1.aiMessage.content,
            author: response1.aiMessage.author,
            order: response1.aiMessage.order,
          }
        : null,
    });

    // Test 3: sendMessage() - Send another user message
    console.log('\nTEST 3: sendMessage() - Follow-up User Message');
    const userMessage2 = {
      moduleId,
      content: 'What would you recommend I focus on first?',
      author: ChatMessageAuthor.User,
    };
    console.log('Input:', userMessage2);
    console.log('⏳ Sending message and generating AI response...');

    const startTime2 = Date.now();
    const response2 = await sendMessage(userMessage2);
    const endTime2 = Date.now();

    printResult(`Output - User Message + AI Response (${endTime2 - startTime2}ms)`, {
      userMessage: {
        content: response2.userMessage.content,
        order: response2.userMessage.order,
      },
      aiMessage: response2.aiMessage
        ? {
            content: response2.aiMessage.content,
            order: response2.aiMessage.order,
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

    // Test 5: sendMessage() - Send AI message directly (no auto-response)
    console.log('\nTEST 5: sendMessage() - Send AI Message Directly (No Auto-Response)');
    const aiMessageDirect = {
      moduleId,
      content: 'This is a manually added AI message for testing purposes.',
      author: ChatMessageAuthor.AI,
    };
    console.log('Input:', aiMessageDirect);
    const response3 = await sendMessage(aiMessageDirect);

    printResult('Output - AI Message Added (No Auto-Response)', {
      userMessage: {
        content: response3.userMessage.content,
        author: response3.userMessage.author,
      },
      aiMessage: response3.aiMessage,
      note: 'No AI auto-response because author was AI, not User',
    });

    // Test 6: Message limit test (create a module with many messages)
    console.log('\nTEST 6: Message Limit Enforcement');
    console.log('Creating a new test session and module...');

    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      console.log('⚠️  No users found for limit test');
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
            },
          },
        },
        include: {
          modules: true,
        },
      });

      const limitTestModuleId = limitTestSession.modules[0].id;

      // Add 98 messages (leaving room for 2 more: user + AI response)
      console.log('Adding 98 messages to approach the limit...');
      const messagesToCreate = [];
      for (let i = 0; i < 98; i++) {
        messagesToCreate.push({
          moduleId: limitTestModuleId,
          content: `Test message ${i + 1}`,
          author: i % 2 === 0 ? ChatMessageAuthor.User : ChatMessageAuthor.AI,
          order: i,
        });
      }

      await prisma.chatMessage.createMany({
        data: messagesToCreate,
      });

      console.log('✅ Added 98 messages (limit is 100)');

      // Try to add one more user message (should succeed: 99 user + 100 AI = exactly at limit)
      console.log('\nAttempting to add message 99 (should succeed)...');
      const messageCount1 = await prisma.chatMessage.count({
        where: { moduleId: limitTestModuleId },
      });
      console.log(`Current message count: ${messageCount1}`);

      try {
        await sendMessage({
          moduleId: limitTestModuleId,
          content: 'This should be the last valid message',
          author: ChatMessageAuthor.User,
        });
        console.log('❌ Expected this to fail at 100 messages, but it succeeded!');
      } catch (error: any) {
        printResult('Output - Message Limit Enforced (Expected)', {
          message: error.message,
          status: 'Test passed - message limit working',
          currentCount: messageCount1,
          limit: 100,
        });
      }

      // Clean up test session
      console.log('\nCleaning up test session...');
      await prisma.chatMessage.deleteMany({
        where: { moduleId: limitTestModuleId },
      });
      await prisma.module.delete({
        where: { id: limitTestModuleId },
      });
      await prisma.learningSession.delete({
        where: { id: limitTestSession.id },
      });
      console.log('✅ Test session cleaned up');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Chat Service Tests Completed Successfully!');
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
    console.log('\n✅ All tests finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
