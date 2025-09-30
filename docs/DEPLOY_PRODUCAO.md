# Documentação - Deploy em Produção

## Visão Geral

Este documento descreve o processo de deploy da aplicação Next.js em diferentes plataformas de produção. A aplicação utiliza:

- Next.js 15 com App Router
- Prisma ORM com PostgreSQL
- NextAuth.js para autenticação
- shadcn/ui para componentes UI
- Socket.IO para comunicação em tempo real

## Pré-requisitos para Deploy

1. **Conta no provedor de hospedagem**
2. **Domínio configurado** (opcional)
3. **Variáveis de ambiente de produção**
4. **Banco de dados de produção** (se não usar SQLite)

## Plataformas de Deploy Suportadas

### 1. Vercel (Recomendado)

#### 1.1. Configuração

**Arquivo `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXTAUTH_URL": "https://seu-dominio.com",
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

#### 1.2. Variáveis de Ambiente

No painel do Vercel, configure as seguintes variáveis:

```env
# Production
NODE_ENV="production"
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="sua-chave-secreta-muito-segura-aqui"

# Database (PostgreSQL remoto)
DATABASE_URL="postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable"
```

#### 1.3. Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod

# Ou conectar com repositório Git
vercel
```

#### 1.4. Build Command

No Vercel, configure:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2. Netlify

#### 2.1. Configuração

**Arquivo `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 2.2. Variáveis de Ambiente

Configure no painel do Netlify:
```env
NODE_ENV="production"
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="sua-chave-secreta"
DATABASE_URL="postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable"
```

#### 2.3. Deploy

```bash
# Instalar Netlify CLI
npm install netlify-cli -g

# Fazer login
netlify login

# Deploy
netlify deploy --prod
```

### 3. DigitalOcean App Platform

#### 3.1. Configuração

**Arquivo `.do/app.yaml`:**
```yaml
name: seu-projeto
services:
- name: web
  source_dir: /
  github:
    repo: seu-usuario/seu-repositorio
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXTAUTH_URL
    value: ${APP_URL}
  - key: NEXTAUTH_SECRET
    value: ${NEXTAUTH_SECRET}
  - key: DATABASE_URL
    value: ${DATABASE_URL}
databases:
- engine: PG
  name: banco-de-dados
  size: db-s-dev-database
  version: "13"
```

#### 3.2. Variáveis de Ambiente

```env
NODE_ENV="production"
NEXTAUTH_URL="https://seu-app.ondigitalocean.app"
NEXTAUTH_SECRET="sua-chave-secreta"
DATABASE_URL="${db.DATABASE_URL}"
```

### 4. AWS (EC2 + RDS)

#### 4.1. Configuração do Servidor

**Instalar dependências:**
```bash
# Atualizar servidor
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

#### 4.2. Configuração do Projeto

**Arquivo `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'seu-projeto',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      NEXTAUTH_URL: 'https://seu-dominio.com',
      NEXTAUTH_SECRET: 'sua-chave-secreta',
      DATABASE_URL: 'postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable'
    }
  }]
}
```

#### 4.3. Deploy Script

```bash
#!/bin/bash
# deploy.sh

echo "Iniciando deploy..."

# Parar aplicação atual
pm2 stop seu-projeto

# Fazer pull do código
git pull origin main

# Instalar dependências
npm install --production

# Buildar aplicação
npm run build

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar estado PM2
pm2 save

echo "Deploy concluído!"
```

### 5. Docker (para qualquer plataforma)

#### 5.1. Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 5.2. docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=https://seu-dominio.com
      - NEXTAUTH_SECRET=sua-chave-secreta
      - DATABASE_URL=postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: database
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### 5.3. Deploy com Docker

```bash
# Build e iniciar containers
docker-compose up -d --build

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

## Configuração de Banco de Dados em Produção

### Banco de Dados Remoto PostgreSQL

O projeto já está configurado para usar um banco de dados PostgreSQL remoto:

```env
DATABASE_URL="postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable"
```

#### 1. Schema do Banco de Dados

O schema do Prisma já está configurado para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. Rodar Migrations

```bash
# Gerar migrations (se necessário)
npx prisma migrate dev --name init

# Rodar migrations em produção
npx prisma migrate deploy

# Gerar Prisma client
npx prisma generate
```

#### 3. Dados de Produção

```bash
# Criar usuário admin em produção
NODE_ENV=production npx tsx seed-user.ts

# Popular com dados iniciais (opcional)
NODE_ENV=production npx tsx seed.ts
```

## Configuração de Domínio e SSL

### 1. Configurar Domínio

#### Vercel
1. No painel do Vercel, vá para "Settings" → "Domains"
2. Adicione seu domínio
3. Configure o DNS conforme instruções do Vercel

#### Netlify
1. No painel do Netlify, vá para "Site settings" → "Domain management"
2. Adicione seu domínio personalizado
3. Configure o DNS

#### DigitalOcean
1. Configure seu domínio no painel do DigitalOcean
2. Adicione registros DNS
3. Configure o Load Balancer

### 2. Configurar SSL

#### Vercel/Netlify
SSL é automático e gerenciado pela plataforma

#### DigitalOcean/AWS
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovar automaticamente
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoramento e Logs

### 1. Monitoramento

#### Vercel
- Painel de métricas integrado
- Logs em tempo real
- Analytics básico

#### Netlify
- Analytics integrado
- Logs de deploy
- Monitoramento de funções

#### DigitalOcean
- DigitalOcean Monitoring
- Configurar alertas
- Métricas detalhadas

#### AWS
- CloudWatch Logs
- CloudWatch Metrics
- Configurar alarmes

### 2. Configuração de Logs

**Adicionar logging à aplicação:**

```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

## Segurança em Produção

### 1. Variáveis de Ambiente

Nunca commitar variáveis sensíveis. Use `.env.production`:

```env
# .env.production
NODE_ENV="production"
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="sua-chave-secreta-muito-longa-e-aleatoria"
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
```

### 2. Headers de Segurança

**Adicionar ao `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3. Rate Limiting

```javascript
// middleware.js
import { NextResponse } from 'next/server';
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export function middleware(request) {
  // Apply rate limiting
  limiter(request, new NextResponse(), () => {});
  
  return NextResponse.next();
}
```

## Backup e Recuperação

### 1. Backup do Banco de Dados

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="seu_produto"
DB_USER="seu_usuario"
DB_HOST="localhost"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Manter apenas os últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

### 2. Backup Automático (Cron)

```bash
# Adicionar ao crontab
0 2 * * * /caminho/para/backup.sh
```

## Testes em Produção

### 1. Checklist de Deploy

- [ ] Build bem-sucedido
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] SSL configurado
- [ ] Domínio apontando corretamente
- [ ] Monitoramento ativo
- [ ] Logs funcionando
- [ ] Backup configurado
- [ ] Testes manuais passando

### 2. Testes Pós-Deploy

```bash
# Testar saúde da aplicação
curl https://seu-dominio.com/api/health

# Testar endpoints principais
curl https://seu-dominio.com/api/projects
curl https://seu-dominio.com/api/tasks
curl https://seu-dominio.com/api/requirements

# Testar performance
curl -w "@curl-format.txt" -o /dev/null -s https://seu-dominio.com
```

## Rollback

### 1. Vercel/Netlify
- Use o painel para reverter para um deploy anterior
- Ou use a CLI: `vercel rollback [prod-url]`

### 2. Docker
```bash
# Reverter para imagem anterior
docker-compose down
docker-compose pull app:tag-anterior
docker-compose up -d
```

### 3. Manual
```bash
# Reverter branch
git checkout main
git reset --hard HEAD~1
git push --force
```

## Suporte e Monitoramento

### 1. Monitoramento de Saúde

**Endpoint de saúde (`/api/health`):**
```javascript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Testar conexão com banco
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
```

### 2. Alertas

Configure alertas para:
- CPU > 80%
- Memória > 80%
- Disco > 80%
- Erros 5xx
- Tempo de resposta > 5s

Esta documentação cobre o processo completo de deploy em produção. Escolha a plataforma que melhor se adapta às suas necessidades e siga os passos correspondentes.