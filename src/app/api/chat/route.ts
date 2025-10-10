import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import ClaudeService, { ChatContext, ClaudeMessage, calculateCreditsFromTokens } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/chat - Iniciando requisição');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Usuário autenticado:', session.user.email);

    const body = await request.json();
    const { message, sessionId, systemPrompt } = body;

    console.log('📝 Dados recebidos:', { message: message?.substring(0, 100), sessionId, systemPrompt: systemPrompt?.substring(0, 100) });

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
    }

    // Validar API key da Claude
    if (!ClaudeService.validateApiKey()) {
      return NextResponse.json({
        error: 'Serviço de IA não configurado corretamente'
      }, { status: 503 });
    }

    // Verificar créditos do usuário
    const userCredit = await prisma.userCredit.findUnique({
      where: { userId: session.user.id }
    });

    const initialCredits = 10.0; // Créditos iniciais para novos usuários
    const currentBalance = userCredit?.balance || initialCredits;

    if (currentBalance <= 0) {
      return NextResponse.json({
        error: 'Créditos insuficientes',
        code: 'INSUFFICIENT_CREDITS'
      }, { status: 402 });
    }

    // Criar ou obter sessão de chat
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.user.id,
          status: 'active'
        }
      });

      if (!chatSession) {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }
    } else {
      // Criar nova sessão
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.length > 50 ? message.substring(0, 47) + '...' : message,
          status: 'active'
        }
      });
    }

    // Obter histórico de mensagens da sessão
    const existingMessages = await prisma.chatMessage.findMany({
      where: { sessionId: chatSession.id },
      orderBy: { createdAt: 'asc' }
    });

    // Construir contexto para a API Claude
    const messages: ClaudeMessage[] = existingMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    messages.push({ role: 'user', content: message });

    const context: ChatContext = {
      sessionId: chatSession.id,
      userId: session.user.id,
      messages,
      systemPrompt
    };

    // Enviar mensagem para Claude
    const claudeResponse = await ClaudeService.sendMessage(context);

    // Calcular créditos baseados em tokens (200k tokens = 10 créditos)
    let creditsUsed = 0;
    if (claudeResponse.usage) {
      const totalTokens = claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens;
      creditsUsed = calculateCreditsFromTokens(totalTokens);
      console.log('📊 Tokens usados:', claudeResponse.usage);
      console.log('💰 Créditos calculados:', creditsUsed);
    }

    // Verificar se usuário tem créditos suficientes
    console.log('💰 Saldo atual:', currentBalance, 'Créditos necessários:', creditsUsed);
    if (currentBalance < creditsUsed) {
      console.log('❌ Créditos insuficientes');
      return NextResponse.json({
        error: 'Créditos insuficientes para esta operação',
        code: 'INSUFFICIENT_CREDITS'
      }, { status: 402 });
    }

    // Salvar mensagem do usuário
    console.log('💾 Salvando mensagem do usuário...');
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message,
        tokensUsed: claudeResponse.usage?.input_tokens,
        cost: claudeResponse.usage ? Math.ceil(creditsUsed * 0.5) : 0 // 50% dos créditos para input
      }
    });
    console.log('✅ Mensagem do usuário salva');

    // Salvar resposta do assistente
    console.log('💾 Salvando resposta do assistente...');
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: claudeResponse.content,
        tokensUsed: claudeResponse.usage?.output_tokens,
        cost: claudeResponse.usage ? Math.ceil(creditsUsed * 0.5) : 0 // 50% dos créditos para output
      }
    });
    console.log('✅ Resposta do assistente salva');

    // Atualizar créditos do usuário
    if (!userCredit) {
      await prisma.userCredit.create({
        data: {
          userId: session.user.id,
          balance: initialCredits - creditsUsed
        }
      });
    } else {
      await prisma.userCredit.update({
        where: { userId: session.user.id },
        data: { balance: currentBalance - creditsUsed }
      });
    }

    // Registrar transação de créditos
    const updatedUserCredit = userCredit || await prisma.userCredit.findUnique({
      where: { userId: session.user.id }
    });

    if (updatedUserCredit) {
      await prisma.creditTransaction.create({
        data: {
          userCreditId: updatedUserCredit.id,
          amount: -creditsUsed,
          type: 'debit',
          description: `Chat com arquiteto - ${chatSession.id} (${creditsUsed} créditos)`,
          metadata: {
            sessionId: chatSession.id,
            tokensUsed: claudeResponse.usage,
            creditsUsed: creditsUsed,
            totalTokens: claudeResponse.usage?.input_tokens && claudeResponse.usage.output_tokens
              ? claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens
              : 0
          }
        }
      });
    }

    // Atualizar título da sessão se for a primeira mensagem
    if (existingMessages.length === 0) {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { title: message.length > 50 ? message.substring(0, 47) + '...' : message }
      });
    }

      console.log('🎉 Operação concluída com sucesso!');

    const responseData = {
      sessionId: chatSession.id,
      response: claudeResponse.content,
      cost: creditsUsed,
      remainingCredits: currentBalance - creditsUsed,
      usage: claudeResponse.usage,
      tokensInfo: claudeResponse.usage ? {
        inputTokens: claudeResponse.usage.input_tokens,
        outputTokens: claudeResponse.usage.output_tokens,
        totalTokens: claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens,
        creditsUsed: creditsUsed
      } : null
    };

    console.log('📤 Enviando resposta:', {
      sessionId: responseData.sessionId,
      cost: responseData.cost,
      remainingCredits: responseData.remainingCredits
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Erro no endpoint de chat:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Obter mensagens de uma sessão específica
      const chatSession = await prisma.chatSession.findFirst({
        where: {
          id: parseInt(sessionId),
          userId: session.user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!chatSession) {
        return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
      }

      return NextResponse.json(chatSession);
    } else {
      // Listar todas as sessões do usuário
      const sessions = await prisma.chatSession.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error('Erro ao obter sessões de chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}