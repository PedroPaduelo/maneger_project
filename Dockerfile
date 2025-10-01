# Use a imagem oficial do Node.js como base
FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY next.config.ts ./

# Instalar dependências
RUN npm ci

# Gerar Prisma client
RUN npx prisma generate

# Copiar o resto do código
COPY . .

# Build da aplicação Next.js com saída standalone
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

# Instalar dependências necessárias para produção
RUN apk add --no-cache libc6-compat

# Criar diretório de trabalho
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar todos os arquivos necessários
COPY --from=base --chown=nextjs:nodejs /app ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Gerar Prisma client
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
CMD ["npm", "start"]