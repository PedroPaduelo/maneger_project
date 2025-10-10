import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      tasks = []
    } = body;

    if (!projectId || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({
        error: 'ProjectId e tasks são obrigatórios'
      }, { status: 400 });
    }

    // Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Criar tasks
    const createdTasks = await Promise.all(
      tasks.map(task =>
        prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            guidancePrompt: task.guidancePrompt || task.title,
            additionalInformation: task.additionalInformation || '',
            status: 'Pendente',
            projectId: projectId,
            createdBy: 'Arquiteto AI',
            updatedBy: 'Arquiteto AI'
          }
        })
      )
    );

    // Criar todos para cada task
    await Promise.all(
      createdTasks.map(async (task, index) => {
        const taskData = tasks[index];
        if (taskData.todos && Array.isArray(taskData.todos)) {
          await Promise.all(
            taskData.todos.map((todo: string, todoIndex: number) =>
              prisma.taskTodo.create({
                data: {
                  taskId: task.id,
                  description: todo,
                  isCompleted: false,
                  sequence: todoIndex
                }
              })
            )
          );
        }
      })
    );

    // Vincular tasks aos requisitos existentes se houver
    if (tasks.some(t => t.requirementId)) {
      await Promise.all(
        tasks.map((task, index) => {
          if (task.requirementId) {
            return prisma.requirementTask.create({
              data: {
                requirementId: task.requirementId,
                taskId: createdTasks[index].id
              }
            });
          }
        })
      );
    }

    // Atualizar progresso do projeto
    const totalTasks = await prisma.task.count({
      where: { projectId }
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        progress: totalTasks > 0 ? 0 : 100 // Se não há tasks, 100%, senão 0%
      }
    });

    // Criar entrada no histórico
    await prisma.historySummary.create({
      data: {
        projectId: projectId,
        summary: `${createdTasks.length} tasks criadas pelo Arquiteto AI.`,
        createdBy: 'Arquiteto AI'
      }
    });

    return NextResponse.json({
      success: true,
      tasks: createdTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt
      }))
    });

  } catch (error) {
    console.error('Erro ao criar tasks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}