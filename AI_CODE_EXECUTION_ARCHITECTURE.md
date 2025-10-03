# 🤖 Arquitetura: IA + Geração de Código + Execução ao Vivo

## 🎯 Objetivo

Implementar sistema onde:
1. **Usuário descreve** o que quer construir
2. **IA gera o código** automaticamente
3. **Sistema executa** o código em ambiente isolado
4. **Usuário recebe**:
   - ✅ Link de preview ao vivo
   - ✅ Código gerado (visível e editável)
   - ✅ Tudo dentro da plataforma

**Referências**: bolt.new, Gitpod, StackBlitz

---

## 📊 OPÇÕES DE ARQUITETURA

### 🅰️ OPÇÃO 1: WebContainers (Estilo bolt.new/StackBlitz)

#### Como funciona:
```
User descreve
    ↓
IA (Claude/GPT) gera código
    ↓
WebContainer (no navegador do user)
    ↓
Executa Node.js + React
    ↓
Preview ao vivo (iframe)
```

#### Tecnologias:
- **WebContainers API** (StackBlitz)
- **Claude 3.5 Sonnet** ou **GPT-4** para geração
- **WebAssembly** para execução no browser
- **Service Workers** para isolamento
- **SharedArrayBuffer** para performance

#### Vantagens:
✅ Execução 100% no navegador (sem custo de servidor)
✅ Boot em milissegundos
✅ Isolamento via browser sandbox
✅ Zero setup para usuário
✅ Funciona offline depois do primeiro load

#### Desvantagens:
❌ Requer browser moderno (Chrome/Edge full, Firefox/Safari beta)
❌ Limitado a Node.js/JavaScript
❌ Requer `SharedArrayBuffer` (precisa headers COOP/COEP)
❌ Não roda backends pesados (Python, Java, etc)

#### Implementação Next.js:

**1. Instalar WebContainers:**
```bash
npm install @webcontainer/api
```

**2. Configurar headers (next.config.js):**
```typescript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};
```

**3. Componente de Execução:**
```typescript
// src/components/ai-executor/WebContainerExecutor.tsx
'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

export function WebContainerExecutor({ code }: { code: string }) {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    async function bootContainer() {
      const instance = await WebContainer.boot();
      setContainer(instance);

      // Escrever arquivos
      await instance.mount({
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'ai-project',
              type: 'module',
              dependencies: { vite: 'latest' }
            }),
          },
        },
        'index.js': {
          file: { contents: code },
        },
      });

      // Instalar dependências
      const install = await instance.spawn('npm', ['install']);
      await install.exit;

      // Rodar dev server
      const dev = await instance.spawn('npm', ['run', 'dev']);

      // Pegar URL
      instance.on('server-ready', (port, url) => {
        setUrl(url);
      });
    }

    bootContainer();
  }, [code]);

  return (
    <div>
      {url && (
        <iframe src={url} width="100%" height="600px" />
      )}
    </div>
  );
}
```

**4. Integração com IA:**
```typescript
// src/app/api/ai/generate-code/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Generate a complete React + Vite project based on: ${prompt}

        Return ONLY a JSON with this structure:
        {
          "files": {
            "package.json": "...",
            "index.html": "...",
            "src/App.jsx": "...",
            "src/main.jsx": "..."
          }
        }`
      }
    ],
  });

  return Response.json(message.content);
}
```

#### Custo:
- **WebContainers API**: Grátis para uso pessoal, pago para comercial
- **Claude API**: ~$3 por 1M tokens input, ~$15 por 1M tokens output
- **Servidor**: Apenas Next.js (baixo custo)

---

### 🅱️ OPÇÃO 2: Docker Containers (Estilo Gitpod)

#### Como funciona:
```
User descreve
    ↓
IA gera código
    ↓
API cria container Docker no servidor
    ↓
Executa projeto (Node, Python, Go, etc)
    ↓
Expõe porta pública
    ↓
Retorna URL de preview
```

#### Tecnologias:
- **Docker** para isolamento
- **Docker SDK** (dockerode) para controle via Node.js
- **Nginx Proxy** ou **Traefik** para roteamento
- **Claude/GPT** para geração

#### Vantagens:
✅ Suporta qualquer linguagem/framework
✅ Isolamento completo (segurança)
✅ Controle total sobre ambiente
✅ Pode rodar databases, serviços, etc
✅ Funciona em qualquer navegador

#### Desvantagens:
❌ Requer infraestrutura de servidor
❌ Custo de CPU/RAM por container
❌ Boot mais lento (~5-15 segundos)
❌ Precisa gerenciar lifecycle dos containers

#### Implementação Next.js:

**1. Instalar Docker SDK:**
```bash
npm install dockerode
```

**2. API de Criação de Container:**
```typescript
// src/app/api/ai/create-container/route.ts
import Docker from 'dockerode';
import { nanoid } from 'nanoid';

const docker = new Docker();

export async function POST(req: Request) {
  const { files, userId } = await req.json();

  // ID único para o projeto
  const projectId = nanoid(10);
  const containerName = `project-${projectId}`;

  // Criar container
  const container = await docker.createContainer({
    Image: 'node:20-alpine',
    name: containerName,
    Cmd: ['npm', 'run', 'dev'],
    ExposedPorts: {
      '5173/tcp': {},
    },
    HostConfig: {
      PortBindings: {
        '5173/tcp': [{ HostPort: '0' }], // Porta aleatória
      },
      Memory: 512 * 1024 * 1024, // 512MB
      NanoCpus: 1000000000, // 1 CPU
    },
    Labels: {
      userId,
      projectId,
      createdAt: new Date().toISOString(),
    },
  });

  await container.start();

  // Pegar porta exposta
  const inspect = await container.inspect();
  const port = inspect.NetworkSettings.Ports['5173/tcp'][0].HostPort;

  // URL de preview
  const previewUrl = `https://${process.env.DOMAIN}:${port}`;

  // Escrever arquivos no container
  for (const [path, content] of Object.entries(files)) {
    await container.exec({
      Cmd: ['sh', '-c', `echo '${content}' > /app/${path}`],
    });
  }

  // Instalar dependências
  await container.exec({
    Cmd: ['npm', 'install'],
    WorkingDir: '/app',
  });

  return Response.json({
    success: true,
    containerId: container.id,
    previewUrl,
    projectId,
  });
}
```

**3. Cleanup automático (opcional):**
```typescript
// src/lib/docker-cleanup.ts
import Docker from 'dockerode';

const docker = new Docker();

export async function cleanupInactiveContainers() {
  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: ['projectId'], // Containers nossos
    },
  });

  const now = Date.now();

  for (const containerInfo of containers) {
    const createdAt = new Date(containerInfo.Labels.createdAt).getTime();
    const age = now - createdAt;

    // Remover após 1 hora de inatividade
    if (age > 60 * 60 * 1000) {
      const container = docker.getContainer(containerInfo.Id);
      await container.stop();
      await container.remove();
    }
  }
}

// Rodar a cada 10 minutos
setInterval(cleanupInactiveContainers, 10 * 60 * 1000);
```

**4. Roteamento com Nginx:**
```nginx
# /etc/nginx/sites-available/previews
server {
    listen 80;
    server_name *.preview.seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:$port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Custo:
- **Servidor**: Digital Ocean Droplet 4GB RAM + 2 vCPUs = ~$24/mês
- **Ou**: AWS EC2 t3.medium = ~$30/mês
- **Claude API**: ~$3-15 por 1M tokens
- **Storage**: ~$0.10/GB/mês

---

### 🅾️ OPÇÃO 3: Híbrida (Melhor dos 2 mundos)

#### Como funciona:
```
User descreve
    ↓
IA gera código
    ↓
1️⃣ WebContainer para preview rápido (frontend)
    ↓
2️⃣ Docker para backend/databases
    ↓
User vê preview em <1 segundo
Backend conecta depois
```

#### Quando usar cada um:
- **WebContainer**: Frontend (React, Vue, Svelte)
- **Docker**: Backend (Node API, Python, databases)

#### Implementação:
```typescript
// src/lib/executor-router.ts
export function selectExecutor(project: { stack: string[] }) {
  const hasFrontend = project.stack.some(s =>
    ['react', 'vue', 'svelte'].includes(s.toLowerCase())
  );

  const hasBackend = project.stack.some(s =>
    ['python', 'java', 'go', 'postgres'].includes(s.toLowerCase())
  );

  if (hasFrontend && !hasBackend) {
    return 'webcontainer';
  }

  if (hasBackend) {
    return 'docker';
  }

  return 'webcontainer'; // default
}
```

---

## 🎯 RECOMENDAÇÃO

### Para COMEÇAR (MVP):
**OPÇÃO 1: WebContainers**

**Por quê:**
- ✅ Mais rápido para implementar
- ✅ Sem custos de infraestrutura extra
- ✅ Usuário vê resultado em <1 segundo
- ✅ API simples e bem documentada

**Limitações MVP:**
- Só projetos frontend (React, Vue)
- Navegadores modernos

### Para ESCALAR:
**OPÇÃO 3: Híbrida**

**Por quê:**
- Frontend → WebContainers (rápido, barato)
- Backend → Docker (flexível, completo)

---

## 📝 FLUXO DE IMPLEMENTAÇÃO (MVP)

### FASE 1: Geração de Código (2-3 dias)

**1. Setup Claude API:**
```bash
npm install @anthropic-ai/sdk
```

**2. Criar prompt engineering:**
```typescript
// src/lib/ai/prompts.ts
export const CODE_GENERATION_PROMPT = `
You are an expert full-stack developer.
Generate a complete, working project based on this description:

{USER_PROMPT}

Return a JSON with this EXACT structure:
{
  "stack": ["react", "vite", "tailwind"],
  "files": {
    "package.json": "...",
    "index.html": "...",
    "src/App.jsx": "...",
    "src/main.jsx": "...",
    "src/index.css": "..."
  }
}

Requirements:
- Use Vite for build tool
- Use Tailwind CSS for styling
- Make it fully functional
- Include all dependencies in package.json
- Use modern React patterns (hooks, functional components)
`;
```

**3. API Route:**
```typescript
// src/app/api/ai/generate/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession();
  const { prompt, projectId } = await req.json();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: CODE_GENERATION_PROMPT.replace('{USER_PROMPT}', prompt),
      },
    ],
  });

  const response = JSON.parse(message.content[0].text);

  // Salvar no banco
  await db.aIProject.create({
    data: {
      userId: session.user.id,
      projectId,
      prompt,
      generatedCode: response.files,
      stack: response.stack,
      status: 'generated',
    },
  });

  return Response.json(response);
}
```

### FASE 2: Execução com WebContainers (3-4 dias)

**1. Headers COOP/COEP:**
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};
```

**2. Componente Executor:**
```typescript
// src/components/ai-executor/Executor.tsx
'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeViewer } from './CodeViewer';

export function Executor({ files }: { files: Record<string, string> }) {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    async function boot() {
      setLogs(prev => [...prev, '🚀 Booting container...']);

      const wc = await WebContainer.boot();
      setContainer(wc);

      setLogs(prev => [...prev, '📁 Writing files...']);

      // Mount files
      await wc.mount(
        Object.fromEntries(
          Object.entries(files).map(([path, content]) => [
            path,
            { file: { contents: content } },
          ])
        )
      );

      setLogs(prev => [...prev, '📦 Installing dependencies...']);

      // Install
      const install = await wc.spawn('npm', ['install']);
      install.output.pipeTo(
        new WritableStream({
          write(data) {
            setLogs(prev => [...prev, data]);
          },
        })
      );
      await install.exit;

      setLogs(prev => [...prev, '▶️ Starting dev server...']);

      // Dev server
      const dev = await wc.spawn('npm', ['run', 'dev']);
      dev.output.pipeTo(
        new WritableStream({
          write(data) {
            setLogs(prev => [...prev, data]);
          },
        })
      );

      // Listen for server
      wc.on('server-ready', (port, url) => {
        setUrl(url);
        setLogs(prev => [...prev, `✅ Server ready at ${url}`]);
      });
    }

    boot();
  }, [files]);

  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="preview">
        {url ? (
          <iframe
            src={url}
            className="w-full h-[600px] border rounded"
          />
        ) : (
          <div>Loading preview...</div>
        )}
      </TabsContent>

      <TabsContent value="code">
        <CodeViewer files={files} />
      </TabsContent>

      <TabsContent value="logs">
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-[600px] overflow-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

**3. Code Viewer (Monaco):**
```bash
npm install @monaco-editor/react
```

```typescript
// src/components/ai-executor/CodeViewer.tsx
'use client';

import Editor from '@monaco-editor/react';
import { useState } from 'react';

export function CodeViewer({ files }: { files: Record<string, string> }) {
  const [selectedFile, setSelectedFile] = useState(Object.keys(files)[0]);

  return (
    <div className="flex h-[600px]">
      {/* File tree */}
      <div className="w-64 border-r bg-gray-50 p-4 overflow-auto">
        {Object.keys(files).map(path => (
          <div
            key={path}
            onClick={() => setSelectedFile(path)}
            className={`cursor-pointer p-2 rounded ${
              selectedFile === path ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            {path}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(selectedFile)}
          value={files[selectedFile]}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}

function getLanguage(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.jsx')) return 'typescript';
  if (path.endsWith('.ts') || path.endsWith('.js')) return 'javascript';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.json')) return 'json';
  return 'plaintext';
}
```

### FASE 3: UI/UX (2-3 dias)

**Página Principal:**
```typescript
// src/app/ai-builder/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Executor } from '@/components/ai-executor/Executor';

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setFiles(data.files);
    setLoading(false);
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AI Project Builder</h1>

      {!files ? (
        <div className="max-w-2xl">
          <Textarea
            placeholder="Descreva o que você quer construir..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={6}
            className="mb-4"
          />
          <Button onClick={generate} disabled={loading || !prompt}>
            {loading ? 'Gerando...' : 'Gerar Projeto'}
          </Button>
        </div>
      ) : (
        <Executor files={files} />
      )}
    </div>
  );
}
```

---

## 💰 ESTIMATIVA DE CUSTOS (MVP)

### Opção 1 (WebContainers):
- **Servidor Next.js**: $5-10/mês (Vercel free tier)
- **Claude API**: $20-50/mês (estimativa 1000 gerações)
- **WebContainers**: Grátis (uso pessoal) ou $49/mês (comercial)

**Total**: $25-110/mês

### Opção 2 (Docker):
- **Servidor Next.js**: $5-10/mês
- **Servidor Containers**: $24-50/mês
- **Claude API**: $20-50/mês

**Total**: $49-110/mês

---

## 🚀 PRÓXIMOS PASSOS

Qual opção você prefere?

1. **WebContainers** (rápido, barato, só frontend)
2. **Docker** (completo, mais caro)
3. **Híbrida** (melhor dos dois)

Depois de escolher, posso:
1. Atualizar Prisma schema
2. Criar APIs
3. Implementar componentes
4. Integrar com projeto existente

**Qual caminho seguimos?** 🎯
