#!/bin/bash

# Script simplificado de deploy para VPS
set -e

echo "=== Iniciando Deploy ==="

# Parar aplicação atual
echo "Parando aplicação atual..."
pm2 stop nextjs-project-manager 2>/dev/null || true
pm2 delete nextjs-project-manager 2>/dev/null || true

# Limpar e instalar dependências
echo "Instalando dependências..."
npm install

# Gerar Prisma client
echo "Gerando Prisma client..."
npm run db:generate

# Build da aplicação
echo "Building aplicação..."
npm run build

# Iniciar aplicação
echo "Iniciando aplicação..."
pm2 start ecosystem.config.js --env production

# Salvar configuração
pm2 save

echo "=== Deploy concluído ==="
echo "Status:"
pm2 status nextjs-project-manager