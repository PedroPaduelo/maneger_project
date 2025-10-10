import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const idParam = params?.id;
    const sessionId = Number(idParam);
    if (!idParam || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verifica se a sessão pertence ao usuário
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // Exclui mensagens e sessão em transação
    await prisma.$transaction(async (tx) => {
      await tx.chatMessage.deleteMany({ where: { sessionId } });
      await tx.chatSession.delete({ where: { id: sessionId } });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao excluir sessão de chat:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const idParam = params?.id;
    const sessionId = Number(idParam);
    if (!idParam || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = body?.status as string | undefined;
    if (!status || !['active', 'archived', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Verifica se a sessão pertence ao usuário
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status }
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao atualizar status da sessão de chat:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
