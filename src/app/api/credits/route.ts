import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTestUserPostgres, createUserWithCreditsPostgres } from '@/lib/seed-postgres';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Garantir que o usuário exista no banco e tenha todos os campos necessários
    try {
      const user = await createTestUserPostgres();

      // Garantir que o usuário tenha créditos
      await createUserWithCreditsPostgres(user.id);
    } catch (error) {
      console.warn('Não foi possível configurar usuário:', error);

      // Se não conseguir criar o usuário, tenta criar com os dados da sessão
      if (session?.user?.id) {
        try {
          await createUserWithCreditsPostgres(session.user.id);
        } catch (creditError) {
          console.error('Não foi possível criar créditos para usuário:', creditError);
        }
      }
    }

    // Obter saldo atual do usuário
    let userCredit = await prisma.userCredit.findUnique({
      where: { userId: session.user.id }
    });

    // Se não houver registro de crédito, criar com saldo inicial
    if (!userCredit) {
      userCredit = await prisma.userCredit.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          userId: session.user.id,
          balance: 10.0 // Saldo inicial de 10 créditos
        }
      });

      // Registrar transação inicial (apenas se o usuário foi realmente criado)
      try {
        await prisma.creditTransaction.create({
          data: {
            userCreditId: userCredit.id,
            amount: 10.0,
            type: 'bonus',
            description: 'Bônus de boas-vindas'
          }
        });
      } catch (transError) {
        console.warn('Não foi possível criar transação inicial:', transError);
        // Continua mesmo se a transação falhar
      }
    }

    // Obter transações recentes
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userCredit: {
          userId: session.user.id
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Obter estatísticas de uso
    const stats = await prisma.creditTransaction.groupBy({
      by: ['type'],
      where: {
        userCredit: {
          userId: session.user.id
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
        }
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      balance: userCredit.balance,
      transactions,
      stats: stats.reduce((acc, stat) => {
        acc[stat.type] = Math.abs(stat._sum.amount || 0);
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Erro ao obter créditos:', error);
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
    const { amount, type, description } = body;

    if (!amount || !type || !description) {
      return NextResponse.json(
        { error: 'Valor, tipo e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['credit', 'debit', 'bonus', 'refund'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de transação inválido' },
        { status: 400 }
      );
    }

    // Atualizar saldo do usuário
    const userCredit = await prisma.userCredit.upsert({
      where: { userId: session.user.id },
      update: {
        balance: {
          increment: type === 'debit' ? -Math.abs(amount) : Math.abs(amount)
        }
      },
      create: {
        userId: session.user.id,
        balance: type === 'debit' ? Math.max(0, 10 - Math.abs(amount)) : 10 + Math.abs(amount)
      }
    });

    // Registrar transação
    const transaction = await prisma.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
        type,
        description
      }
    });

    return NextResponse.json({
      balance: userCredit.balance,
      transaction
    });
  } catch (error) {
    console.error('Erro ao processar transação de créditos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}