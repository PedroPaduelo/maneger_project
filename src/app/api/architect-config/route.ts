import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const configs = await prisma.architectConfig.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Se não houver configurações, criar a padrão
    if (configs.length === 0) {
      const defaultConfig = await prisma.architectConfig.create({
        data: {
          userId: session.user.id,
          name: 'Arquiteto Padrão',
          prompt: process.env.DEFAULT_ARCHITECT_PROMPT || 'Você é um arquiteto de software experiente...',
          isActive: true
        }
      });
      return NextResponse.json([defaultConfig]);
    }

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Erro ao obter configurações do arquiteto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, prompt, isActive } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Nome e prompt são obrigatórios' },
        { status: 400 }
      );
    }

    // Se a nova configuração estiver ativa, desativar as outras
    if (isActive) {
      await prisma.architectConfig.updateMany({
        where: { userId: session.user.id },
        data: { isActive: false }
      });
    }

    const config = await prisma.architectConfig.create({
      data: {
        userId: session.user.id,
        name,
        prompt,
        isActive: isActive || false
      }
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar configuração do arquiteto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}