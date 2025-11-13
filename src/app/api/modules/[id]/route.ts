import { NextRequest, NextResponse } from 'next/server';
import { getModuleById } from '@/lib/services/moduleService';

/**
 * GET /api/modules/[id]
 * Retrieves a specific module by ID with its learning session context
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

    const module = await getModuleById(moduleId);

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: module,
    });
  } catch (error) {
    console.error('Error fetching module:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch module';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
