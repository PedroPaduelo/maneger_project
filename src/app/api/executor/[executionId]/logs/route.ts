import { NextRequest, NextResponse } from 'next/server';
import { executions } from '../../../projects/[id]/executor/execute/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const execution = executions.get(executionId);

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    let logs = execution.logs;

    // Aplicar limite se fornecido
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        logs = logs.slice(-limitNum); // Pegar os últimos N logs
      }
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
