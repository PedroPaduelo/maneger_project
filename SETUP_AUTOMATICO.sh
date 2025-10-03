#!/bin/bash

# 🚀 SETUP AUTOMÁTICO - Sistema SSH Multi-Tenant
# Execute este script NO SERVIDOR onde está o código

set -e  # Parar se der erro

echo "════════════════════════════════════════"
echo "  🚀 SETUP AUTOMÁTICO - SSH EXECUTOR"
echo "════════════════════════════════════════"
echo ""

# Verificar se está na pasta certa
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na pasta do projeto!"
    echo "Use: cd /home/nommand/code/maneger-porject/maneger-project"
    exit 1
fi

echo "✅ Pasta correta detectada"
echo ""

# PASSO 1: Gerar senha mestra
echo "📝 PASSO 1/7: Gerando senha mestra..."
SENHA=$(openssl rand -base64 32)
echo "SSH_ENCRYPTION_KEY=\"$SENHA\"" >> .env.local
echo "✅ Senha gerada e salva em .env.local"
echo ""

# PASSO 2: Criar chave SSH
echo "🔑 PASSO 2/7: Criando chave SSH..."
ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N "" -q 2>/dev/null || true
echo "✅ Chave SSH criada: ~/.ssh/executor_key"
echo ""

# PASSO 3: Instalar chave no servidor local
echo "🔐 PASSO 3/7: Instalando chave no servidor..."
mkdir -p ~/.ssh
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys 2>/dev/null || true
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
echo "✅ Chave instalada em ~/.ssh/authorized_keys"
echo ""

# PASSO 4: Testar SSH local
echo "🧪 PASSO 4/7: Testando conexão SSH local..."
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $(whoami)@127.0.0.1 "echo SSH_OK" 2>/dev/null | grep -q SSH_OK; then
    echo "✅ SSH funcionando perfeitamente!"
else
    echo "⚠️  SSH não está rodando. Tentando instalar..."
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get install -y openssh-server >/dev/null 2>&1
        sudo systemctl start ssh 2>/dev/null
        sudo systemctl enable ssh 2>/dev/null
        echo "✅ SSH Server instalado e iniciado"
    else
        echo "❌ Não foi possível instalar SSH. Instale manualmente:"
        echo "   sudo apt-get install openssh-server"
        echo "   sudo systemctl start ssh"
    fi
fi
echo ""

# PASSO 5: Limpar cache do Next.js
echo "🧹 PASSO 5/7: Limpando cache..."
rm -rf .next 2>/dev/null || true
echo "✅ Cache limpo"
echo ""

# PASSO 6: Verificar dependências
echo "📦 PASSO 6/7: Verificando dependências..."
if ! npm list ssh2 >/dev/null 2>&1; then
    echo "📥 Instalando ssh2..."
    npm install ssh2 --silent
    echo "✅ ssh2 instalado"
else
    echo "✅ ssh2 já instalado"
fi
echo ""

# PASSO 7: Mostrar informações finais
echo "📋 PASSO 7/7: Coletando informações..."
echo ""
echo "════════════════════════════════════════"
echo "  ✅ SETUP CONCLUÍDO COM SUCESSO!"
echo "════════════════════════════════════════"
echo ""
echo "🔐 SENHA MESTRA GERADA:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$SENHA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  GUARDE ESTA SENHA EM LOCAL SEGURO!"
echo ""
echo "📝 DADOS PARA A INTERFACE WEB:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nome:       Executor Test"
echo "Host:       127.0.0.1"
echo "Porta:      22"
echo "Username:   $(whoami)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 CHAVE PRIVADA (cole na interface):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/executor_key
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Reinicie o Next.js:"
echo "   npm run dev"
echo ""
echo "2️⃣  Abra o navegador:"
echo "   http://localhost:3000/settings"
echo ""
echo "3️⃣  Adicione a chave SSH:"
echo "   - Clique em 'Chaves SSH' → 'Adicionar Chave'"
echo "   - Use os dados acima ☝️"
echo "   - Cole a chave privada completa"
echo "   - Marque 'padrão'"
echo "   - Teste conexão → Salvar"
echo ""
echo "4️⃣  Teste a execução:"
echo "   - Vá para um projeto"
echo "   - Clique em 'Task Executor'"
echo "   - Execute tasks"
echo "   - Veja os logs! ✅"
echo ""
echo "════════════════════════════════════════"
echo ""
echo "💡 DICA: Salve esta saída em um arquivo:"
echo "   ./SETUP_AUTOMATICO.sh | tee setup-info.txt"
echo ""
echo "🆘 AJUDA: Veja os arquivos:"
echo "   - GUIA_SUPER_SIMPLES.md"
echo "   - ONDE_EXECUTAR.md"
echo "   - COMANDOS_RAPIDOS.md"
echo ""
echo "✅ Pronto! Agora execute: npm run dev"
echo ""
