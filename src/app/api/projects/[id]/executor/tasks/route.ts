import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { QuickTaskInput } from '@/types/executor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    // Buscar todas as tasks pendentes do projeto
    const tasks = await db.task.findMany({
      where: {
        projectId,
        status: {
          in: ['Pendente', 'Em Andamento'], // Ajuste conforme os status do seu sistema
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body: QuickTaskInput = await request.json();

    // Validação básica
    if (!body.title || !body.guidancePrompt) {
      return NextResponse.json(
        { error: 'Title and guidancePrompt are required' },
        { status: 400 }
      );
    }

    // Criar nova task
    const task = await db.task.create({
      data: {
        title: body.title,
        guidancePrompt: body.guidancePrompt,
        description: body.description,
        additionalInformation: body.additionalInformation,
        projectId,
        status: 'Pendente',
        createdBy: 'system', // TODO: pegar do usuário autenticado
        updatedBy: 'system',
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
