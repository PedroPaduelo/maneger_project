import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompt';
import { ProjectContextBuilder } from './context-builder';
import { extractPlanFromResponse, normalizePlan, formatPlanComment } from './plan-parser';

export interface AgentChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentChatContext {
  sessionId?: number;
  userId: string;
  messages: AgentChatMessage[];
  systemPrompt?: string;
}

interface ProjectAssistantOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ProjectAssistant {
  private contextBuilder = new ProjectContextBuilder();

  constructor(
    private anthropic: Anthropic,
    private options: ProjectAssistantOptions = {}
  ) {}

  async respond(context: AgentChatContext, interactive: boolean): Promise<{
    content: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
    };
  }> {
    const userContext = await this.contextBuilder.build({
      userId: context.userId
    });

    const systemPrompt = buildSystemPrompt({
      basePrompt: context.systemPrompt || process.env.DEFAULT_ARCHITECT_PROMPT,
      userProjectContext: userContext,
      interactive
    });

    const response = await this.anthropic.messages.create({
      model: this.options.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: this.options.maxTokens || 4000,
      temperature: this.options.temperature ?? 0.5,
      system: systemPrompt,
      messages: context.messages
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Resposta inválida da API Anthropics');
    }

    const rawText = textBlock.text;
    const { cleanedText, plan } = extractPlanFromResponse(rawText);
    const normalizedPlan = normalizePlan(plan);

    let finalContent = cleanedText || rawText;
    if (normalizedPlan) {
      finalContent = `${finalContent}\n\n${formatPlanComment(normalizedPlan)}`.trim();
    }

    return {
      content: finalContent,
      usage: response.usage
        ? {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens
          }
        : undefined
    };
  }
}
