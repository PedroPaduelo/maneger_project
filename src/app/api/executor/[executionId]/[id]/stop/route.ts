import { NextRequest, NextResponse } from 'next/server';
import { executions } from '@/app/api/projects/[id]/executor/execute/route';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const execution = executions.get(id);

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // Mark as stopped
    execution.status = 'stopped';
    execution.completedAt = new Date();

    executions.set(id, execution);

    return NextResponse.json({ message: 'Execution stopped successfully' });
  } catch (error) {
    console.error('Error stopping execution:', error);
    return NextResponse.json(
      { error: 'Failed to stop execution' },
      { status: 500 }
    );
  }
}
