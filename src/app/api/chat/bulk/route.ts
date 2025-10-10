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

    const body = await request.json().catch(() => ({}));
    const statusFrom = body?.statusFrom as string | undefined;
    const statusTo = body?.statusTo as string | undefined;

    const valid = ['active', 'archived', 'completed'];
    if (!statusFrom || !statusTo || !valid.includes(statusFrom) || !valid.includes(statusTo)) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }
    if (statusFrom === statusTo) {
      return NextResponse.json({ error: 'Status de origem e destino iguais' }, { status: 400 });
    }

    // Seleciona ids do usuário com statusFrom
    const sessionsToUpdate = await prisma.chatSession.findMany({
      where: { userId: session.user.id, status: statusFrom },
      select: { id: true }
    });
    if (sessionsToUpdate.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0, ids: [] });
    }

    const ids = sessionsToUpdate.map(s => s.id);
    await prisma.chatSession.updateMany({
      where: { id: { in: ids }, userId: session.user.id },
      data: { status: statusTo }
    });

    return NextResponse.json({ success: true, updatedCount: ids.length, ids });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro no bulk de chat:', message);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

