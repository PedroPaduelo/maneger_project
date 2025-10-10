import Anthropic from '@anthropic-ai/sdk';
import { ProjectAssistant, type AgentChatContext, type AgentChatMessage } from './agent/project-assistant';

const DEFAULT_ANTHROPIC_API_KEY = 'a1b0ec2671f246ad8cccc3440e2cbf89.axlWCIyrWxp5fIPW';
const DEFAULT_ANTHROPIC_BASE_URL = 'https://api.z.ai/api/anthropic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || DEFAULT_ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_BASE_URL
});

let assistantInstance: ProjectAssistant | null = null;

export type ClaudeMessage = AgentChatMessage;

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export type ChatContext = AgentChatContext;

// Função para calcular créditos baseados em tokens (200k tokens = 10 créditos)
export function calculateCreditsFromTokens(totalTokens: number): number {
  const TOKENS_PER_CREDIT = 20000; // 200k tokens / 10 créditos = 20k tokens por crédito
  return Math.ceil(totalTokens / TOKENS_PER_CREDIT);
}

function getAssistant(): ProjectAssistant {
  if (!assistantInstance) {
    assistantInstance = new ProjectAssistant(anthropic, {
      model: process.env.ANTHROPIC_MODEL,
      maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS) || 4000,
      temperature: process.env.ANTHROPIC_TEMPERATURE
        ? Number(process.env.ANTHROPIC_TEMPERATURE)
        : 0.6
    });
  }
  return assistantInstance;
}

export class ClaudeService {
  static async sendMessage(context: ChatContext): Promise<ClaudeResponse> {
    try {
      const interactive = (process.env.ARCHITECT_AGENT_INTERACTIVE || 'true') !== 'false';
      const assistant = getAssistant();
      return await assistant.respond(context, interactive);
    } catch (error) {
      console.error('Erro ao comunicar com API Anthropics:', error);
      throw new Error('Falha ao processar mensagem com o assistente');
    }
  }

  static validateApiKey(): boolean {
    const envKey = process.env.ANTHROPIC_API_KEY;
    return Boolean((envKey && envKey.length > 10) || DEFAULT_ANTHROPIC_API_KEY.length > 0);
  }
}

export default ClaudeService;
