# 🔄 Arquitetura HÍBRIDA - Explicação Detalhada

## 🎯 Conceito Principal

**A IA decide automaticamente onde executar baseado no que o usuário pediu:**

```
User: "Criar landing page com React"
   ↓
IA analisa: "Só frontend"
   ↓
✅ Usa WebContainer (navegador)
   ↓
Preview em <1 segundo
```

```
User: "API REST com Python + PostgreSQL"
   ↓
IA analisa: "Backend + Database"
   ↓
✅ Usa Docker Container (servidor)
   ↓
Preview em ~10 segundos
```

```
User: "App completo: React frontend + Node API + MongoDB"
   ↓
IA analisa: "Frontend + Backend + DB"
   ↓
✅ Frontend: WebContainer (rápido)
✅ Backend: Docker (completo)
   ↓
Preview híbrido em ~5 segundos
```

---

## 📊 FLUXO DE DECISÃO AUTOMÁTICO

### Passo 1: IA Analisa o Pedido

```typescript
// src/lib/ai/analyzer.ts

export async function analyzeProject(userPrompt: string) {
  const anthropic = new Anthropic();

  const analysis = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyze this project request and determine the stack:

"${userPrompt}"

Return JSON:
{
  "hasFrontend": boolean,
  "hasBackend": boolean,
  "hasDatabase": boolean,
  "languages": ["react", "node", "python", etc],
  "executionStrategy": "webcontainer" | "docker" | "hybrid"
}`
    }]
  });

  return JSON.parse(analysis.content[0].text);
}
```

### Passo 2: Sistema Decide

```typescript
// src/lib/executor/router.ts

export function selectExecutor(analysis: ProjectAnalysis) {
  const { hasFrontend, hasBackend, hasDatabase, languages } = analysis;

  // CASO 1: Só frontend JavaScript/TypeScript
  if (hasFrontend && !hasBackend && !hasDatabase) {
    const isSupportedByWebContainer = languages.every(lang =>
      ['react', 'vue', 'svelte', 'vanilla-js', 'typescript'].includes(lang)
    );

    if (isSupportedByWebContainer) {
      return {
        strategy: 'webcontainer',
        reason: 'Frontend-only project with supported stack',
      };
    }
  }

  // CASO 2: Backend ou Database
  if (hasBackend || hasDatabase) {
    return {
      strategy: 'docker',
      reason: 'Requires backend or database support',
    };
  }

  // CASO 3: Full-stack com frontend JS
  if (hasFrontend && hasBackend) {
    const frontendIsJS = analysis.frontendLanguages?.every(lang =>
      ['react', 'vue', 'svelte'].includes(lang)
    );

    if (frontendIsJS) {
      return {
        strategy: 'hybrid',
        reason: 'Frontend can run in browser, backend needs server',
      };
    }
  }

  // DEFAULT: Docker (mais flexível)
  return {
    strategy: 'docker',
    reason: 'Fallback to most flexible option',
  };
}
```

---

## 🎬 EXEMPLOS PRÁTICOS

### Exemplo 1: Landing Page
**User diz:** "Crie uma landing page moderna com animações"

**Sistema:**
```
1. IA gera código → React + Vite + Tailwind + Framer Motion
2. Análise: hasFrontend=true, hasBackend=false
3. Decisão: WebContainer ✅
4. Execução: Navegador do usuário
5. Preview: http://webcontainer.local/<id>
6. Tempo: ~1 segundo
```

**Custo:** $0 em servidor (roda no browser do user)

---

### Exemplo 2: API REST
**User diz:** "API REST para gerenciar usuários com Python FastAPI + PostgreSQL"

**Sistema:**
```
1. IA gera código → FastAPI + SQLAlchemy + Postgres
2. Análise: hasBackend=true, hasDatabase=true
3. Decisão: Docker ✅
4. Execução:
   - Container 1: PostgreSQL
   - Container 2: Python API
5. Preview: https://preview-abc123.seu-dominio.com
6. Tempo: ~8-12 segundos
```

**Custo:** ~$0.02 por hora de container ativo

---

### Exemplo 3: App Full-Stack (HÍBRIDO)
**User diz:** "App de chat em tempo real: frontend React + backend Node.js + WebSocket + Redis"

**Sistema:**
```
1. IA gera código:
   Frontend → React + Vite + Socket.io-client
   Backend → Node.js + Express + Socket.io + Redis

2. Análise:
   hasFrontend=true (React)
   hasBackend=true (Node API)
   hasDatabase=true (Redis)

3. Decisão: HYBRID ✅

4. Execução:

   FRONTEND (WebContainer no navegador):
   ├── Roda React app
   ├── Preview: http://webcontainer.local/<id>
   └── Conecta em: https://api-abc123.seu-dominio.com

   BACKEND (Docker no servidor):
   ├── Container 1: Node.js API (porta 3001)
   ├── Container 2: Redis
   ├── Nginx proxy: https://api-abc123.seu-dominio.com
   └── CORS habilitado para webcontainer.local

5. Preview URLs:
   - Frontend: http://webcontainer.local/abc123 (instantâneo)
   - API: https://api-abc123.seu-dominio.com (10s)

6. Tempo total: ~5 segundos (frontend rápido, backend em paralelo)
```

**Vantagens deste exemplo:**
- ✅ Frontend carrega INSTANTÂNEO
- ✅ Usuário já vê interface enquanto backend sobe
- ✅ Backend isolado e seguro
- ✅ WebSocket funciona perfeitamente

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA (Híbrido)

### Estrutura de Arquivos Gerados pela IA

```
project-abc123/
├── frontend/           ← WebContainer
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── api/
│   │       └── client.js  ← Aponta para Docker backend
│   └── vite.config.js
│
└── backend/           ← Docker
    ├── Dockerfile
    ├── package.json
    ├── docker-compose.yml
    ├── src/
    │   ├── server.js
    │   └── routes/
    └── redis.conf
```

### Frontend API Client (gerado pela IA)

```javascript
// frontend/src/api/client.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async getUsers() {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },

  async createUser(data) {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

### Backend com CORS (gerado pela IA)

```javascript
// backend/src/server.js
import express from 'express';
import cors from 'cors';

const app = express();

// CORS configurado para aceitar WebContainer
app.use(cors({
  origin: [
    /webcontainer\.io$/,
    /localhost/,
  ],
  credentials: true,
}));

app.get('/users', async (req, res) => {
  // ... código
});

app.listen(3001);
```

### Executor Híbrido

```typescript
// src/lib/executor/hybrid-executor.ts

export class HybridExecutor {
  async execute(project: {
    frontend: Record<string, string>;
    backend: Record<string, string>;
  }) {
    // 1. Subir backend PRIMEIRO (em paralelo)
    const backendPromise = this.startDockerBackend(project.backend);

    // 2. Subir frontend (instantâneo)
    const frontendUrl = await this.startWebContainerFrontend(project.frontend);

    // 3. Aguardar backend ficar pronto
    const backendUrl = await backendPromise;

    // 4. Injetar URL do backend no frontend
    await this.injectBackendUrl(frontendUrl, backendUrl);

    return {
      frontendUrl,
      backendUrl,
      status: 'running',
    };
  }

  private async startDockerBackend(files: Record<string, string>) {
    const docker = new Docker();
    const projectId = nanoid();

    // Criar rede isolada
    const network = await docker.createNetwork({
      Name: `project-${projectId}`,
    });

    // Container Redis
    const redis = await docker.createContainer({
      Image: 'redis:alpine',
      name: `${projectId}-redis`,
      NetworkingConfig: {
        EndpointsConfig: {
          [network.id]: {},
        },
      },
    });
    await redis.start();

    // Container API
    const api = await docker.createContainer({
      Image: 'node:20-alpine',
      name: `${projectId}-api`,
      Cmd: ['npm', 'start'],
      Env: [
        'REDIS_HOST=redis',
        'PORT=3001',
      ],
      ExposedPorts: {
        '3001/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3001/tcp': [{ HostPort: '0' }],
        },
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [network.id]: {},
        },
      },
    });

    // Escrever arquivos
    for (const [path, content] of Object.entries(files)) {
      await this.writeToContainer(api, path, content);
    }

    await api.start();

    // Esperar ficar healthy
    await this.waitForHealthy(api);

    // Pegar porta
    const inspect = await api.inspect();
    const port = inspect.NetworkSettings.Ports['3001/tcp'][0].HostPort;

    return `https://api-${projectId}.seu-dominio.com`;
  }

  private async startWebContainerFrontend(files: Record<string, string>) {
    // Retorna URL para componente React que vai rodar WebContainer
    const projectId = nanoid();

    // Salvar arquivos no banco para o componente ler
    await db.webContainerProject.create({
      data: {
        id: projectId,
        files,
        status: 'pending',
      },
    });

    return `http://localhost:3000/preview/${projectId}`;
  }

  private async injectBackendUrl(frontendUrl: string, backendUrl: string) {
    // Atualizar env no WebContainer
    await db.webContainerProject.update({
      where: { id: extractId(frontendUrl) },
      data: {
        env: {
          VITE_API_URL: backendUrl,
        },
      },
    });
  }
}
```

### Componente de Preview Híbrido

```typescript
// src/app/preview/[id]/page.tsx
'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

export default function HybridPreview({ params }: { params: { id: string } }) {
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    async function init() {
      // Buscar projeto
      const res = await fetch(`/api/preview/${params.id}`);
      const { files, env, backendUrl } = await res.json();

      // Boot WebContainer
      const wc = await WebContainer.boot();

      // Mount files
      await wc.mount(files);

      // Criar .env com backend URL
      await wc.fs.writeFile('.env', `VITE_API_URL=${env.VITE_API_URL}`);

      // Install & dev
      const install = await wc.spawn('npm', ['install']);
      await install.exit;

      const dev = await wc.spawn('npm', ['run', 'dev']);

      wc.on('server-ready', (port, url) => {
        setFrontendUrl(url);
      });

      // Checar se backend está pronto
      const checkBackend = setInterval(async () => {
        try {
          await fetch(`${env.VITE_API_URL}/health`);
          setBackendStatus('ready');
          clearInterval(checkBackend);
        } catch {
          // Ainda carregando
        }
      }, 1000);
    }

    init();
  }, [params.id]);

  return (
    <div className="h-screen flex flex-col">
      {/* Status bar */}
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${frontendUrl ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-sm">Frontend: {frontendUrl ? 'Ready' : 'Loading...'}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${backendStatus === 'ready' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-sm">Backend: {backendStatus === 'ready' ? 'Ready' : 'Starting...'}</span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1">
        {frontendUrl ? (
          <iframe src={frontendUrl} className="w-full h-full border-0" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p>Initializing preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 💰 CUSTOS COMPARADOS

### Projeto Frontend-Only (1000 usuários/mês)

| Estratégia | Custo |
|------------|-------|
| **WebContainer** | $0 servidor + $30 Claude = **$30/mês** |
| **Docker** | $24 servidor + $30 Claude = **$54/mês** |
| **Híbrida** | $0 servidor (usa WebContainer) = **$30/mês** |

**Vencedor:** WebContainer ou Híbrida (mesma coisa neste caso)

---

### Projeto Full-Stack (1000 usuários/mês)

| Estratégia | Custo |
|------------|-------|
| **WebContainer** | ❌ Não suporta backend |
| **Docker** | $50 servidor + $30 Claude = **$80/mês** |
| **Híbrida** | $24 servidor (só backend) + $30 Claude = **$54/mês** |

**Vencedor:** Híbrida (26% mais barato + preview mais rápido)

---

### Projeto Backend-Only (APIs)

| Estratégia | Custo |
|------------|-------|
| **WebContainer** | ❌ Não suporta |
| **Docker** | $24 servidor + $30 Claude = **$54/mês** |
| **Híbrida** | $24 servidor (usa Docker) = **$54/mês** |

**Vencedor:** Empate (Híbrida usa Docker automaticamente)

---

## 🎯 VANTAGENS DA HÍBRIDA

### 1. **Velocidade Otimizada**
```
Frontend-only:     WebContainer → <1s
Backend-only:      Docker → ~10s
Full-stack:        Híbrido → ~5s (frontend rápido, backend paralelo)
```

### 2. **Custo Otimizado**
- Frontend roda no navegador do usuário = $0
- Backend roda no servidor só quando necessário

### 3. **Compatibilidade Total**
- Suporta QUALQUER tipo de projeto
- Sistema decide automaticamente

### 4. **Melhor Experiência**
```
User pede full-stack
   ↓
Frontend aparece INSTANTÂNEO (WebContainer)
   ↓
User já navega na interface
   ↓
5 segundos depois → Backend conecta
   ↓
App completo funciona
```

Sem híbrido, usuário espera 10-15s olhando "Loading..."

---

## 🚦 QUANDO USA O QUÊ?

### Automaticamente detecta:

```typescript
const rules = {
  // Regra 1: Só HTML/CSS/JS → WebContainer
  'landing-page': 'webcontainer',
  'portfolio': 'webcontainer',
  'dashboard-static': 'webcontainer',

  // Regra 2: Backend/DB → Docker
  'api-rest': 'docker',
  'python-script': 'docker',
  'database': 'docker',

  // Regra 3: Frontend JS + Backend → Híbrido
  'react + node api': 'hybrid',
  'vue + python api': 'hybrid',
  'next.js full-stack': 'hybrid',

  // Regra 4: Frontend não-JS → Docker
  'django app': 'docker',  // template rendering no servidor
  'php website': 'docker',
};
```

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────┐
│  USER: "Criar todo list React"          │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │  IA Analisa    │
       │  Stack Detect  │
       └───────┬────────┘
               │
       ┌───────▼────────────────────────┐
       │  Decisão: WebContainer         │
       │  Motivo: Só frontend React     │
       └───────┬────────────────────────┘
               │
       ┌───────▼────────┐
       │  Gera código   │
       └───────┬────────┘
               │
       ┌───────▼──────────────────┐
       │  Executa no NAVEGADOR    │
       │  Tempo: <1 segundo       │
       │  Custo: $0 servidor      │
       └──────────────────────────┘
```

```
┌─────────────────────────────────────────┐
│  USER: "Chat app: React + Node + Redis" │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │  IA Analisa    │
       │  Stack Detect  │
       └───────┬────────┘
               │
       ┌───────▼────────────────────────┐
       │  Decisão: HÍBRIDA              │
       │  Frontend: React → WebContainer│
       │  Backend: Node+Redis → Docker  │
       └───────┬────────────────────────┘
               │
       ┌───────▼────────┐
       │  Gera código   │
       │  Separa em 2   │
       └───────┬────────┘
               │
       ┌───────▼──────────────────────────┐
       │  🚀 Frontend (WebContainer)      │
       │  ⚡ Backend (Docker) - paralelo  │
       └───────┬──────────────────────────┘
               │
       ┌───────▼──────────────────┐
       │  Preview em ~5 segundos  │
       │  Custo: $24/mês servidor │
       └──────────────────────────┘
```

---

## ✅ DECISÃO FINAL

### Use HÍBRIDA se você quer:

✅ **Sistema universal** (suporta tudo)
✅ **Velocidade máxima** para frontends
✅ **Custo otimizado** (frontend grátis)
✅ **Melhor UX** (preview rápido + backend robusto)
✅ **Preparado para crescer** (aceita qualquer projeto futuro)

### Use só WebContainer se você quer:
- Sistema mais simples
- Só vai ter projetos frontend
- Implementação mais rápida (1 semana)

### Use só Docker se você quer:
- Só projetos backend/API
- Controle total sobre ambiente

---

## 🎬 IMPLEMENTAÇÃO

Quer que eu implemente a **Híbrida**?

Vou criar:
1. ✅ Analisador de stack (IA detecta)
2. ✅ Roteador de execução (decide automaticamente)
3. ✅ WebContainer executor (frontend)
4. ✅ Docker executor (backend)
5. ✅ Componente de preview híbrido
6. ✅ Interface unificada

**Tempo estimado:** 2-3 semanas

**Ou prefere começar simples (só WebContainer) e depois adicionar Docker?**
