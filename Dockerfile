# Use a imagem oficial do Node.js como base
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar Prisma client
RUN npx prisma generate

# Copiar o resto do código
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dependências necessárias para produção
RUN apk add --no-cache libc6-compat

# Criar diretório de trabalho
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos de build
COPY --from=base /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar arquivos necessários
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=base --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copiar package.json e package-lock.json
COPY --from=base package.json package-lock.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Gerar Prisma client novamente
RUN npx prisma generate

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "server.js"]