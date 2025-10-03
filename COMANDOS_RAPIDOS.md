# ⚡ COMANDOS RÁPIDOS - Copie e Cole

## 🚀 Setup Completo em 1 Minuto

### 1. Gerar senha e adicionar ao .env.local

```bash
# Gerar senha
SENHA=$(openssl rand -base64 32)

# Adicionar ao .env.local
echo "SSH_ENCRYPTION_KEY=\"$SENHA\"" >> .env.local

# Mostrar senha (guarde!)
echo "Sua senha: $SENHA"
```

### 2. Criar chave SSH para teste local

```bash
# Criar chave
ssh-keygen -t ed25519 -f ~/.ssh/executor_test -N ""

# Instalar no servidor local
cat ~/.ssh/executor_test.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Ver chave privada (copie para a interface)
cat ~/.ssh/executor_test
```

### 3. Reiniciar Next.js

```bash
# Se estiver rodando, pare com Ctrl+C, depois:
rm -rf .next && npm run dev
```

---

## 🔑 Informações para a Interface Web

### Copie estes valores:

**Host:**
```
127.0.0.1
```

**Porta:**
```
22
```

**Username:** (execute o comando)
```bash
whoami
```

**Chave Privada:** (execute o comando)
```bash
cat ~/.ssh/executor_test
```

---

## ✅ Verificação Rápida

### Tudo funcionando?

```bash
# 1. Senha configurada?
cat .env.local | grep SSH_ENCRYPTION_KEY

# 2. Chave SSH criada?
ls -la ~/.ssh/executor_test*

# 3. SSH local funcionando?
ssh $(whoami)@127.0.0.1 "echo 'SSH OK'"

# 4. Next.js rodando?
curl -s http://localhost:3000 | grep -q "html" && echo "Next.js OK"
```

---

## 🔧 Solução de Problemas

### Erro "sSHKey is undefined"

```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

### Erro "SSH connection failed"

```bash
# Instalar SSH server (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y openssh-server
sudo systemctl start ssh
sudo systemctl enable ssh

# Testar
ssh $(whoami)@127.0.0.1 "echo OK"
```

### Erro "Permission denied"

```bash
# Adicionar chave novamente
cat ~/.ssh/executor_test.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Limpar tudo e recomeçar

```bash
# Remove senha do .env.local
sed -i '/SSH_ENCRYPTION_KEY/d' .env.local

# Remove chaves de teste
rm -f ~/.ssh/executor_test*

# Limpa cache
rm -rf .next

# Agora execute os comandos do início novamente
```

---

## 📍 URLs Importantes

```bash
# Interface principal
http://localhost:3000

# Login
http://localhost:3000/auth/signin

# Configurações
http://localhost:3000/settings

# Executor (substitua 1 pelo ID do projeto)
http://localhost:3000/project/1/executor

# Prisma Studio (ver banco de dados)
npx prisma studio
```

---

## 🎯 Comando Completo (Tudo de Uma Vez)

```bash
#!/bin/bash

echo "🚀 Configurando sistema SSH..."

# 1. Gerar e configurar senha
SENHA=$(openssl rand -base64 32)
echo "SSH_ENCRYPTION_KEY=\"$SENHA\"" >> .env.local
echo "✅ Senha configurada: $SENHA"

# 2. Criar chave SSH
ssh-keygen -t ed25519 -f ~/.ssh/executor_test -N "" -q
cat ~/.ssh/executor_test.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
echo "✅ Chave SSH criada"

# 3. Testar SSH local
if ssh -o StrictHostKeyChecking=no $(whoami)@127.0.0.1 "echo OK" 2>/dev/null | grep -q OK; then
    echo "✅ SSH funcionando"
else
    echo "⚠️  Instalando SSH server..."
    sudo apt-get install -y openssh-server >/dev/null 2>&1
    sudo systemctl start ssh
fi

# 4. Limpar cache e preparar
rm -rf .next
echo "✅ Cache limpo"

echo ""
echo "📋 INFORMAÇÕES PARA A INTERFACE WEB:"
echo "=================================="
echo "Nome: Executor Test"
echo "Host: 127.0.0.1"
echo "Porta: 22"
echo "Username: $(whoami)"
echo ""
echo "Chave Privada (copie abaixo):"
echo "----------------------------"
cat ~/.ssh/executor_test
echo "----------------------------"
echo ""
echo "🎯 Próximos passos:"
echo "1. Reinicie Next.js: npm run dev"
echo "2. Acesse: http://localhost:3000/settings"
echo "3. Adicione a chave SSH com os dados acima"
echo "4. Teste a execução!"
echo ""
echo "✅ Setup completo!"
```

**Para executar:**

```bash
# Copie todo o script acima
# Salve em um arquivo:
nano setup-ssh.sh

# Dê permissão:
chmod +x setup-ssh.sh

# Execute:
./setup-ssh.sh
```

---

## 🔄 Reset Completo

### Se quiser começar do zero:

```bash
# Parar Next.js
pkill -f "next dev"

# Remover configurações
sed -i '/SSH_ENCRYPTION_KEY/d' .env.local
rm -f ~/.ssh/executor_test*

# Limpar banco (CUIDADO: apaga dados SSH)
npx prisma db push --force-reset --accept-data-loss

# Limpar cache
rm -rf .next

# Recomeçar
npm run dev
```

---

**Dica:** Salve este arquivo! Você pode precisar destes comandos novamente.
