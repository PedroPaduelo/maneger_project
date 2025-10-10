import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const configId = parseInt(resolvedParams.id);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, prompt, isActive } = body;

    // Verificar se a configuração pertence ao usuário
    const existingConfig = await prisma.architectConfig.findFirst({
      where: {
        id: configId,
        userId: session.user.id
      }
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }

    // Se estiver ativando esta configuração, desativar as outras
    if (isActive) {
      await prisma.architectConfig.updateMany({
        where: {
          userId: session.user.id,
          id: { not: configId }
        },
        data: { isActive: false }
      });
    }

    const updatedConfig = await prisma.architectConfig.update({
      where: { id: configId },
      data: {
        ...(name && { name }),
        ...(prompt && { prompt }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Erro ao atualizar configuração do arquiteto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const configId = parseInt(resolvedParams.id);
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar se a configuração pertence ao usuário
    const existingConfig = await prisma.architectConfig.findFirst({
      where: {
        id: configId,
        userId: session.user.id
      }
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }

    // Verificar se é a única configuração
    const totalConfigs = await prisma.architectConfig.count({
      where: { userId: session.user.id }
    });

    if (totalConfigs === 1) {
      return NextResponse.json(
        { error: 'Não é possível excluir a única configuração disponível' },
        { status: 400 }
      );
    }

    // Se estiver excluindo a configuração ativa, ativar outra
    if (existingConfig.isActive) {
      const anotherConfig = await prisma.architectConfig.findFirst({
        where: {
          userId: session.user.id,
          id: { not: configId }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (anotherConfig) {
        await prisma.architectConfig.update({
          where: { id: anotherConfig.id },
          data: { isActive: true }
        });
      }
    }

    await prisma.architectConfig.delete({
      where: { id: configId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir configuração do arquiteto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}