# 🔐 Guia de Acesso SSH para Task Executor

## 📋 Visão Geral

O sistema de acesso SSH permite que o Task Executor se conecte remotamente a servidores para executar tasks automaticamente, sem necessidade de intervenção manual.

## 🎯 Como Funciona

### Arquitetura do Sistema

```
┌─────────────────┐      HTTPS/WSS      ┌──────────────────┐
│   Next.js Web   │ ◄─────────────────► │  Backend API     │
│  Task Executor  │                      │  (Node.js)       │
└─────────────────┘                      └──────────────────┘
                                                   │
                                                   │ SSH
                                                   ▼
                                         ┌──────────────────┐
                                         │  Remote Server   │
                                         │  (Execution Env) │
                                         └──────────────────┘
```

### Fluxo de Execução

1. **Usuário** inicia execução via web interface
2. **Backend API** recebe requisição
3. **SSH Client** conecta ao servidor remoto
4. **Commands** são executados no servidor
5. **Logs** são enviados em tempo real via WebSocket
6. **Resultado** é salvo no banco de dados

## 🔑 Configuração de SSH Keys

### 1. Gerar Par de Chaves SSH

```bash
# No servidor onde o backend roda
ssh-keygen -t ed25519 -C "task-executor@yourapp.com" -f ~/.ssh/task_executor_key

# Isso gera:
# - ~/.ssh/task_executor_key (chave privada)
# - ~/.ssh/task_executor_key.pub (chave pública)
```

### 2. Instalar Chave Pública no Servidor Remoto

```bash
# Copiar chave pública para o servidor remoto
ssh-copy-id -i ~/.ssh/task_executor_key.pub user@remote-server.com

# Ou manualmente
cat ~/.ssh/task_executor_key.pub | ssh user@remote-server.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Armazenar Chave Privada Seguramente

**Opção A: Variáveis de Ambiente**
```bash
# .env.local
SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
...conteúdo da chave...
-----END OPENSSH PRIVATE KEY-----"

SSH_USERNAME=deploy
SSH_HOST=remote-server.com
SSH_PORT=22
```

**Opção B: Secrets Manager (Produção)**
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

## 🛠️ Implementação Backend

### Instalação de Dependências

```bash
npm install ssh2 ssh2-promise
```

### Estrutura de Arquivos

```
src/
├── lib/
│   ├── ssh-client.ts          # Cliente SSH
│   ├── ssh-executor.ts        # Executor de comandos
│   └── ssh-config.ts          # Configuração
├── app/api/
│   └── executor/
│       └── ssh/
│           ├── connect/route.ts      # Testar conexão
│           ├── execute/route.ts      # Executar comando
│           └── disconnect/route.ts   # Desconectar
```

### Cliente SSH (ssh-client.ts)

```typescript
import { Client } from 'ssh2';
import { promisify } from 'util';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  privateKey: string;
  passphrase?: string;
}

export class SSHClient {
  private client: Client;
  private config: SSHConfig;
  private connected: boolean = false;

  constructor(config: SSHConfig) {
    this.client = new Client();
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client
        .on('ready', () => {
          this.connected = true;
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .connect({
          host: this.config.host,
          port: this.config.port,
          username: this.config.username,
          privateKey: this.config.privateKey,
          passphrase: this.config.passphrase,
          readyTimeout: 30000,
        });
    });
  }

  async executeCommand(command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    if (!this.connected) {
      throw new Error('SSH not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream
          .on('close', (code: number) => {
            resolve({
              stdout,
              stderr,
              exitCode: code,
            });
          })
          .on('data', (data: Buffer) => {
            stdout += data.toString();
          })
          .stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
          });
      });
    });
  }

  async disconnect(): Promise<void> {
    this.client.end();
    this.connected = false;
  }
}
```

### Executor de Tasks (ssh-executor.ts)

```typescript
import { SSHClient } from './ssh-client';
import { Task } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionResult {
  taskId: number;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export class SSHTaskExecutor {
  private sshClient: SSHClient;
  private onLog?: (log: string) => void;

  constructor(sshClient: SSHClient, onLog?: (log: string) => void) {
    this.sshClient = sshClient;
    this.onLog = onLog;
  }

  async executeTask(task: Task): Promise<ExecutionResult> {
    const startTime = Date.now();

    this.log(`[Task #${task.id}] Starting: ${task.title}`);

    try {
      // Preparar ambiente
      await this.prepareEnvironment(task);

      // Executar comando principal
      const command = this.buildCommand(task);
      this.log(`[Task #${task.id}] Executing: ${command}`);

      const result = await this.sshClient.executeCommand(command);

      if (result.exitCode === 0) {
        this.log(`[Task #${task.id}] ✅ Success`);
        return {
          taskId: task.id,
          success: true,
          output: result.stdout,
          duration: Date.now() - startTime,
        };
      } else {
        this.log(`[Task #${task.id}] ❌ Failed: ${result.stderr}`);
        return {
          taskId: task.id,
          success: false,
          output: result.stdout,
          error: result.stderr,
          duration: Date.now() - startTime,
        };
      }
    } catch (error: any) {
      this.log(`[Task #${task.id}] ❌ Error: ${error.message}`);
      return {
        taskId: task.id,
        success: false,
        output: '',
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  private async prepareEnvironment(task: Task): Promise<void> {
    // Criar diretório de trabalho
    const workDir = `/tmp/task-executor/${task.id}`;
    await this.sshClient.executeCommand(`mkdir -p ${workDir}`);

    // Definir variáveis de ambiente
    const envVars = this.extractEnvVars(task);
    if (envVars) {
      await this.sshClient.executeCommand(`export ${envVars}`);
    }
  }

  private buildCommand(task: Task): string {
    // Construir comando baseado no guidancePrompt
    const guidance = task.guidancePrompt;
    const workDir = `/tmp/task-executor/${task.id}`;

    // Exemplo: interpretar guidance como script
    return `cd ${workDir} && ${guidance}`;
  }

  private extractEnvVars(task: Task): string | null {
    // Extrair variáveis de ambiente do additionalInformation
    if (!task.additionalInformation) return null;

    const envLines = task.additionalInformation
      .split('\n')
      .filter(line => line.startsWith('ENV:'))
      .map(line => line.replace('ENV:', '').trim());

    return envLines.length > 0 ? envLines.join(' ') : null;
  }

  private log(message: string): void {
    if (this.onLog) {
      this.onLog(message);
    }
    console.log(message);
  }
}
```

## 🔒 Segurança

### 1. Proteção de Chaves

**❌ NUNCA:**
- Commitar chaves privadas no Git
- Expor chaves via API pública
- Armazenar em texto plano

**✅ SEMPRE:**
- Usar variáveis de ambiente
- Criptografar chaves no banco
- Usar secrets managers em produção
- Rotacionar chaves periodicamente

### 2. Controle de Acesso

```typescript
// Middleware de autenticação
export async function validateSSHAccess(userId: string, projectId: number) {
  // Verificar permissões do usuário
  const hasAccess = await checkUserProjectAccess(userId, projectId);
  if (!hasAccess) {
    throw new Error('Unauthorized SSH access');
  }

  // Verificar rate limiting
  const rateLimitOk = await checkRateLimit(userId);
  if (!rateLimitOk) {
    throw new Error('Rate limit exceeded');
  }

  return true;
}
```

### 3. Auditoria

```typescript
// Log de todas as execuções SSH
interface SSHAuditLog {
  id: string;
  userId: string;
  projectId: number;
  taskId: number;
  command: string;
  result: 'success' | 'failure';
  duration: number;
  timestamp: Date;
  ipAddress: string;
}

async function logSSHExecution(log: SSHAuditLog) {
  await db.sshAuditLog.create({ data: log });
}
```

## 🚀 Uso na Interface Web

### Configurar SSH no Projeto

```typescript
// Na interface web
const [sshConfig, setSSHConfig] = useState({
  enabled: false,
  host: '',
  port: 22,
  username: '',
  keyId: null, // Referência à chave armazenada
});

// Salvar configuração
const saveSSHConfig = async () => {
  await fetch(`/api/projects/${projectId}/ssh-config`, {
    method: 'PUT',
    body: JSON.stringify(sshConfig),
  });
};
```

### Executar via SSH

```typescript
// Iniciar execução com SSH
const startSSHExecution = async () => {
  const response = await fetch(`/api/projects/${projectId}/executor/execute`, {
    method: 'POST',
    body: JSON.stringify({
      taskIds: selectedTasks,
      executionMode: 'ssh', // ou 'local' ou 'api'
      sshConfig: {
        useProjectConfig: true,
      },
    }),
  });
};
```

## 📊 Monitoramento

### Logs em Tempo Real

```typescript
// WebSocket para logs SSH em tempo real
const ws = new WebSocket(`wss://yourapp.com/ws/executor/${executionId}`);

ws.onmessage = (event) => {
  const log = JSON.parse(event.data);

  if (log.type === 'ssh-output') {
    console.log(`SSH: ${log.message}`);
  }
};
```

### Métricas

```typescript
interface SSHMetrics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  failureReasons: Record<string, number>;
  lastExecution: Date;
}
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Connection Timeout**
   - Verificar firewall
   - Verificar porta SSH (padrão 22)
   - Testar com `ssh -vvv user@host`

2. **Authentication Failed**
   - Verificar chave pública no `~/.ssh/authorized_keys`
   - Verificar permissões (600 para chave privada)
   - Verificar username correto

3. **Command Failed**
   - Verificar PATH no servidor remoto
   - Verificar permissões de execução
   - Testar comando manualmente via SSH

### Debug Mode

```typescript
// Habilitar debug SSH
const sshClient = new SSHClient({
  ...config,
  debug: (msg) => console.log('SSH DEBUG:', msg),
});
```

## 🔄 Alternativas ao SSH

### 1. API REST
- Servidor remoto expõe API
- Task Executor faz chamadas HTTP
- Mais simples, mas menos flexível

### 2. Docker Remote API
- Executar em containers remotos
- Isolamento total
- Requer Docker no servidor

### 3. Kubernetes Jobs
- Criar Jobs no cluster K8s
- Escalável e gerenciado
- Mais complexo

### 4. AWS Lambda / Cloud Functions
- Execução serverless
- Pay-per-use
- Ideal para tasks curtas

## 📝 Exemplo Completo

### 1. Configuração no Banco de Dados

```sql
-- Adicionar ao schema Prisma
model SSHConfiguration {
  id          Int      @id @default(autoincrement())
  projectId   Int      @unique
  host        String
  port        Int      @default(22)
  username    String
  keyId       String   // Referência ao secret manager
  enabled     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id])
}
```

### 2. API Route

```typescript
// /api/projects/[id]/executor/execute/route.ts
export async function POST(req: NextRequest) {
  const { taskIds, executionMode, sshConfig } = await req.json();

  if (executionMode === 'ssh') {
    // Buscar configuração SSH
    const config = await db.sshConfiguration.findUnique({
      where: { projectId },
    });

    // Buscar chave privada do secret manager
    const privateKey = await getSecretFromVault(config.keyId);

    // Conectar via SSH
    const sshClient = new SSHClient({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey,
    });

    await sshClient.connect();

    // Executar tasks
    const executor = new SSHTaskExecutor(sshClient, (log) => {
      // Enviar log via WebSocket
      broadcastLog(executionId, log);
    });

    for (const task of tasks) {
      await executor.executeTask(task);
    }

    await sshClient.disconnect();
  }
}
```

## 🎯 Próximos Passos

1. **Phase 1** ✅ - Executor básico implementado
2. **Phase 2** - Adicionar suporte SSH
3. **Phase 3** - WebSocket para logs em tempo real
4. **Phase 4** - Multi-servidor e load balancing
5. **Phase 5** - Kubernetes integration

---

**Última Atualização**: 2025-10-02
**Status**: Documentação Completa
