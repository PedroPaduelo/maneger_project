export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

// Helper to lazily load EventSource in Node.js environments
async function loadEventSource(): Promise<any> {
  // Browser already has EventSource
  if (typeof (globalThis as any).EventSource !== 'undefined') {
    return (globalThis as any).EventSource;
  }

  // Try to dynamically import Node polyfill
  try {
    const mod: any = await import('eventsource');
    const ES = mod?.default || mod;
    (globalThis as any).EventSource = ES;
    return ES;
  } catch (err) {
    console.error('Falha ao carregar polyfill de EventSource para Node:', err);
    throw err;
  }
}

export class MCPClient {
  private sessionId: string = '';
  private eventSource: EventSource | null = null;
  private tools: MCPTool[] = [];
  private isConnected: boolean = false;
  private pendingRequests: Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor(private baseUrl: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Timeout de 10 segundos para a conexão
      const timeout = setTimeout(() => {
        reject(new Error('Timeout na conexão MCP (10s)'));
      }, 10000);

      try {
        // Primeiro, obter o endpoint com sessionId
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);
        fetch(this.baseUrl, {
          signal: controller.signal
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
          })
          .then(text => {
            clearTimeout(timeout);
            clearTimeout(fetchTimeout);
            const sessionIdMatch = text.match(/sessionId=([a-f0-9-]+)/);
            if (sessionIdMatch) {
              this.sessionId = sessionIdMatch[1];
              this.initializeEventSource(resolve, reject);
            } else {
              reject(new Error('Não foi possível extrair sessionId da resposta'));
            }
          })
          .catch(error => {
            clearTimeout(timeout);
            clearTimeout(fetchTimeout);
            console.error('Erro na conexão MCP:', error);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async initializeEventSource(resolve: Function, reject: Function) {
    const endpoint = `${this.baseUrl}?sessionId=${this.sessionId}`;
    console.log('Conectando ao MCP endpoint:', endpoint);

    // Timeout para o EventSource
    const eventSourceTimeout = setTimeout(() => {
      console.error('Timeout na conexão EventSource (15s)');
      this.isConnected = false;
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      reject(new Error('Timeout na conexão EventSource (15s)'));
    }, 15000);

    try {
      const ES: any = await loadEventSource();
      this.eventSource = new ES(endpoint);

      this.eventSource.onopen = () => {
        clearTimeout(eventSourceTimeout);
        console.log('MCP Conectado');
        this.isConnected = true;
        // Inicializar o handshake
        this.sendMessage({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: 'ClaudeCode',
              version: '1.0.0'
            }
          }
        }).catch(error => {
          console.error('Erro no handshake MCP:', error);
          // Não rejeitar aqui, deixar continuar mesmo se o handshake falhar
        });
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: MCPMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Erro ao parsear mensagem MCP:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        clearTimeout(eventSourceTimeout);
        console.error('Erro SSE:', error);
        this.isConnected = false;
        if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
          reject(new Error('Falha na conexão MCP - EventSource fechado'));
        }
      };
    } catch (error) {
      clearTimeout(eventSourceTimeout);
      console.error('Erro ao criar EventSource:', error);
      reject(error);
    }
  }

  private handleMessage(message: MCPMessage) {
    console.log('MCP Message recebida:', message);

    // Handle responses to pending requests
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message || 'Erro MCP'));
        } else {
          pending.resolve(message.result);
        }
      }
    }

    // Handle notifications
    if (!message.id && message.method) {
      switch (message.method) {
        case 'tools/list':
          if (message.params && message.params.tools) {
            this.tools = message.params.tools;
            console.log('Tools disponíveis:', this.tools);
          }
          break;
        default:
          console.log('Notificação MCP:', message.method, message.params);
      }
    }
  }

  private sendMessage(message: MCPMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.eventSource) {
        reject(new Error('MCP não está conectado'));
        return;
      }

      // Adicionar ID se não existir
      if (message.id === undefined) {
        message.id = Date.now();
      }

      // Configurar timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(message.id!);
        reject(new Error('Timeout MCP'));
      }, 30000);

      this.pendingRequests.set(message.id!, { resolve, reject, timeout });

      // Enviar mensagem via POST para o endpoint
      const endpoint = `${this.baseUrl}?sessionId=${this.sessionId}`;
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }).catch(reject);
    });
  }

  async initialize(): Promise<void> {
    await this.sendMessage({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {}
    });
  }

  async callTool(toolName: string, args: any): Promise<any> {
    console.log('Chamando tool:', toolName, args);

    const result = await this.sendMessage({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    return result;
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.pendingRequests.forEach(pending => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Cliente MCP desconectado'));
    });
    this.pendingRequests.clear();
  }
}
