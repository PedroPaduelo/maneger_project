#!/bin/bash

# Script de Deploy para VPS
# Uso: ./deploy.sh [ambiente]
# Exemplo: ./deploy.sh production

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar ambiente
ENVIRONMENT=${1:-development}
log "Iniciando deploy para ambiente: $ENVIRONMENT"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 não está instalado. Por favor, instale com: npm install -g pm2"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado."
    exit 1
fi

# Mostrar versões
log "Versões instaladas:"
log "Node.js: $(node --version)"
log "npm: $(npm --version)"
log "PM2: $(pm2 --version)"

# Parar aplicação atual se estiver rodando
log "Parando aplicação atual..."
if pm2 describe nextjs-project-manager > /dev/null 2>&1; then
    pm2 stop nextjs-project-manager || log_warning "Falha ao parar aplicação, continuando..."
    pm2 delete nextjs-project-manager || log_warning "Falha ao deletar aplicação, continuando..."
fi

# Limpar build anterior
log "Limpando build anterior..."
npm run clean || log_warning "Falha ao limpar build anterior, continuando..."

# Instalar dependências
log "Instalando dependências..."
npm install --production=false

# Gerar Prisma client
log "Gerando Prisma client..."
npm run db:generate

# Build da aplicação
log "Building aplicação..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:prod
else
    npm run build
fi

# Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
if [ "$ENVIRONMENT" = "production" ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env development
fi

# Salvar configuração do PM2
log "Salvando configuração do PM2..."
pm2 save

# Mostrar status
log "Status da aplicação:"
pm2 status nextjs-project-manager

# Mostrar logs recentes
log "Logs recentes:"
pm2 logs nextjs-project-manager --lines 20

log_success "Deploy concluído com sucesso!"
log "A aplicação está rodando em: http://localhost:3000"
log "Use 'pm2 monit' para monitorar a aplicação"
log "Use 'pm2 logs' para ver os logs"
log "Use 'pm2 restart nextjs-project-manager' para reiniciar a aplicação"