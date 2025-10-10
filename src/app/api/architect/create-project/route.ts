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
      name,
      description,
      stack,
      requirements = [],
      priority = 'Média',
      tags = ''
    } = body;

    if (!name || !description || !stack) {
      return NextResponse.json({
        error: 'Nome, descrição e stack são obrigatórios'
      }, { status: 400 });
    }

    // Criar projeto
    const project = await prisma.project.create({
      data: {
        name,
        description,
        stack,
        priority,
        tags,
        userId: session.user.id,
        status: 'Ativo',
        progress: 0
      }
    });

    // Se houver requisitos, criá-los (link com tasks será feito quando as tasks forem criadas)
    if (requirements.length > 0) {
      await Promise.all(
        requirements.map(req =>
          prisma.requirement.create({
            data: {
              title: req.title,
              description: req.description,
              type: req.type || 'Funcional',
              category: req.category || 'Geral',
              priority: req.priority || 'Média',
              projectId: project.id
            }
          })
        )
      );
    }

    // Criar entrada no histórico
    await prisma.historySummary.create({
      data: {
        projectId: project.id,
        summary: `Projeto "${name}" criado pelo Arquiteto AI com ${requirements.length} requisitos.`,
        createdBy: 'Arquiteto AI'
      }
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        stack: project.stack,
        priority: project.priority,
        status: project.status,
        progress: project.progress,
        createdAt: project.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
