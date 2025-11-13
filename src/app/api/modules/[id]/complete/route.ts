import { NextRequest, NextResponse } from 'next/server';
import { markModuleComplete } from '@/lib/services/moduleService';

/**
 * PATCH /api/modules/[id]/complete
 * Marks a module as complete and auto-detects session completion
 */
export async function PATCH(
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

    const updatedModule = await markModuleComplete(moduleId);

    return NextResponse.json({
      success: true,
      data: updatedModule,
      message: 'Module marked as complete',
    });
  } catch (error) {
    console.error('Error marking module complete:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to mark module complete';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
