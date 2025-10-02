import { NextRequest, NextResponse } from 'next/server';
import { executions } from '../../../projects/[id]/executor/execute/route';
import { v4 as uuidv4 } from 'uuid';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const execution = executions.get(executionId);

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    if (execution.status !== 'running' && execution.status !== 'pending') {
      return NextResponse.json(
        { error: 'Execution is not running' },
        { status: 400 }
      );
    }

    // Parar a execução
    execution.status = 'stopped';
    execution.stoppedAt = new Date();
    execution.logs.push({
      id: uuidv4(),
      timestamp: new Date(),
      level: 'warning',
      message: `Execution stopped${reason ? `: ${reason}` : ''}`,
    });

    executions.set(executionId, execution);

    return NextResponse.json({ success: true, execution });
  } catch (error) {
    console.error('Error stopping execution:', error);
    return NextResponse.json(
      { error: 'Failed to stop execution' },
      { status: 500 }
    );
  }
}
