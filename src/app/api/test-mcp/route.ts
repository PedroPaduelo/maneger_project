import { NextRequest, NextResponse } from 'next/server';
import { ArchitectAgent } from '@/lib/architect-agent';

export async function GET() {
  try {
    console.log('Testando conexão com Agente Arquiteto MCP...');

    const agent = new ArchitectAgent();

    // Testar conexão
    await agent.initialize();

    const tools = agent.getAvailableTools();

    if (agent.isReady()) {
      // Testar uma análise simples
      const testAnalysis = await agent.analyzeProject(
        "Quero criar um sistema de delivery de comida com interface para clientes e painel administrativo"
      );

      return NextResponse.json({
        success: true,
        connected: true,
        tools: tools.map(t => ({ name: t.name, description: t.description })),
        testAnalysis: {
          projectName: testAnalysis.project.name,
          requirements: testAnalysis.project.requirements.length,
          stack: testAnalysis.project.stack,
          phases: testAnalysis.phases.length
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Agente não está pronto',
        connected: false,
        tools: tools.map(t => ({ name: t.name, description: t.description }))
      });
    }

  } catch (error) {
    console.error('Erro no teste MCP:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      connected: false,
      tools: []
    }, { status: 500 });
  }
}