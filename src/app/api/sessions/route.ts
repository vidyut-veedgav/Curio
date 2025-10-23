import { NextRequest, NextResponse } from 'next/server';
import { createLearningSession, getSessions } from '@/lib/services/sessionService';

/**
 * POST /api/sessions
 * Creates a new learning session with AI-generated modules
 *
 * Request body:
 * {
 *   userId: string;
 *   topic: string;
 *   description?: string;
 *   length?: 'short' | 'medium' | 'long';
 *   complexity?: 'beginner' | 'intermediate' | 'advanced';
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, topic, description, length, complexity } = body;

    // Validate required fields
    if (!userId || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and topic are required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session || session.user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const learningSession = await createLearningSession({
      userId,
      topic,
      description,
      length,
      complexity,
    });

    return NextResponse.json(
      {
        success: true,
        data: learningSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating learning session:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to create learning session';

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
 * GET /api/sessions?userId=<userId>
 * Retrieves all learning sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: userId' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session || session.user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const sessions = await getSessions(userId);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
