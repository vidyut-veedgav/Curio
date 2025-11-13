import { NextRequest, NextResponse } from 'next/server';
import { getMessages, sendMessage } from '@/lib/services/chatService';
import { ChatMessageAuthor } from '@prisma/client';

/**
 * GET /api/modules/[id]/messages
 * Retrieves all chat messages for a module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const messages = await getMessages(moduleId);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/modules/[id]/messages
 * Sends a message and gets AI response
 *
 * Request body:
 * {
 *   content: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Send user message and get AI response
    const result = await sendMessage({
      moduleId,
      content: content.trim(),
      author: ChatMessageAuthor.User,
    });

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
