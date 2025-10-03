# 🚀 Setup Rápido - Sistema SSH Multi-Tenant

## ⚡ Quick Start (5 minutos)

### 1️⃣ Configurar Variável de Ambiente

```bash
# Gerar senha mestra segura (32+ caracteres)
openssl rand -base64 32

# Adicionar ao .env.local
echo 'SSH_ENCRYPTION_KEY="SuaSenhaGeradaAqui32Caracteres"' >> .env.local
```

### 2️⃣ Aplicar Migração do Banco

```bash
# Criar migration
npx prisma migrate dev --name add_ssh_keys

# Gerar Prisma Client
npx prisma generate
```

### 3️⃣ Instalar Dependência SSH

```bash
npm install ssh2
```

### 4️⃣ Iniciar Aplicação

```bash
npm run dev
```

## ✅ Pronto! Sistema Funcionando

### Acessar Interface

1. **Login**: `http://localhost:3000/auth/signin`
2. **Configurações**: Avatar (topo direito) → Configurações
3. **SSH Keys**: Tab "Chaves SSH"

### Adicionar Sua Primeira Chave

1. Clicar em **"Adicionar Chave"**
2. Preencher:
   - **Nome**: Ex: "Servidor Produção"
   - **Host**: `seu-servidor.com` ou IP
   - **Porta**: `22`
   - **Username**: `deploy` ou seu user SSH
   - **Chave Privada**: Colar conteúdo de `~/.ssh/id_ed25519`
3. **Testar Conexão** → Aguardar ✅
4. **Marcar como padrão**: ☑️
5. **Salvar Chave**

### Executar Tasks com SSH

1. Ir para qualquer projeto → `/project/[ID]`
2. Clicar em **"Task Executor"**
3. Selecionar tasks
4. Clicar **"Executar"**
5. Sistema usa automaticamente sua chave SSH padrão
6. Ver logs em tempo real

## 📋 Checklist de Verificação

- [ ] ✅ Variável `SSH_ENCRYPTION_KEY` configurada
- [ ] ✅ Migration aplicada (`npx prisma migrate dev`)
- [ ] ✅ Prisma Client gerado (`npx prisma generate`)
- [ ] ✅ Dependência `ssh2` instalada
- [ ] ✅ Aplicação rodando (`npm run dev`)
- [ ] ✅ Login realizado
- [ ] ✅ Página `/settings` acessível
- [ ] ✅ Chave SSH adicionada
- [ ] ✅ Teste de conexão bem-sucedido
- [ ] ✅ Chave marcada como padrão

## 🔑 Como Obter Sua Chave SSH

### Se você já tem chave SSH:

```bash
# Ver chave privada (para colar no formulário)
cat ~/.ssh/id_ed25519

# Ver chave pública (opcional, para fingerprint)
cat ~/.ssh/id_ed25519.pub
```

### Se você NÃO tem chave SSH:

```bash
# 1. Gerar nova chave
ssh-keygen -t ed25519 -C "seu@email.com" -f ~/.ssh/executor_key

# 2. Copiar chave para servidor
ssh-copy-id -i ~/.ssh/executor_key.pub user@seu-servidor.com

# 3. Testar conexão
ssh -i ~/.ssh/executor_key user@seu-servidor.com

# 4. Copiar chave privada
cat ~/.ssh/executor_key
```

## 🛡️ Segurança

### ⚠️ IMPORTANTE

1. **NUNCA** commitar `SSH_ENCRYPTION_KEY` no Git
2. **NUNCA** compartilhar chave privada
3. **SEMPRE** usar senha mestra forte (32+ caracteres)
4. **SEMPRE** fazer backup de `SSH_ENCRYPTION_KEY`
5. **SEMPRE** usar chaves SSH com passphrase em produção

### Boas Práticas

```bash
# Permissões corretas
chmod 600 ~/.ssh/executor_key
chmod 644 ~/.ssh/executor_key.pub
chmod 700 ~/.ssh

# Backup da senha mestra
echo "SSH_ENCRYPTION_KEY=$(cat .env.local | grep SSH_ENCRYPTION_KEY)" > ~/backup_ssh_key.txt
chmod 600 ~/backup_ssh_key.txt
```

## 🔄 Fluxo de Uso

```
1. User faz login
   ↓
2. User vai em Configurações → SSH Keys
   ↓
3. User adiciona chave SSH
   ↓
4. Sistema criptografa e salva no DB
   ↓
5. User vai em Projeto → Task Executor
   ↓
6. User executa tasks
   ↓
7. Sistema:
   - Busca chave SSH do user
   - Descriptografa (backend only)
   - Conecta via SSH
   - Executa comandos
   - Mostra logs em tempo real
   ↓
8. Sucesso! 🎉
```

## 📊 Recursos Disponíveis

### Página de Configurações (`/settings`)

**Tabs**:
- 🔑 **Chaves SSH** - Gerenciamento completo ✅
- 👤 **Perfil** - Em desenvolvimento
- 🔔 **Notificações** - Em desenvolvimento
- 🛡️ **Segurança** - Em desenvolvimento

### Gerenciamento de Chaves

**Ações disponíveis**:
- ✅ Listar todas as chaves
- ✅ Adicionar nova chave
- ✅ Editar chave existente
- ✅ Deletar chave
- ✅ Marcar/desmarcar como padrão
- ✅ Ativar/desativar chave
- ✅ Testar conexão SSH
- ✅ Ver fingerprint
- ✅ Ver estatísticas de uso

### Task Executor

**Integração**:
- ✅ Usa chave SSH padrão automaticamente
- ✅ Permite selecionar chave específica (futuro)
- ✅ Logs mostram qual user executou
- ✅ Logs mostram qual chave SSH foi usada
- ✅ Tracking de uso (lastUsedAt, usageCount)

## 🐛 Troubleshooting

### Erro: "SSH_ENCRYPTION_KEY must be at least 32 characters"

```bash
# Gerar nova senha mestra
openssl rand -base64 32

# Adicionar ao .env.local
echo 'SSH_ENCRYPTION_KEY="<senha_gerada>"' >> .env.local

# Reiniciar aplicação
npm run dev
```

### Erro: "Table 'tbl_ssh_keys' doesn't exist"

```bash
# Aplicar migration
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate
```

### Erro: "Connection timeout" no teste de SSH

**Possíveis causas**:
1. Firewall bloqueando porta 22
2. Servidor SSH não está rodando
3. Host incorreto
4. Chave privada incorreta

**Solução**:
```bash
# Testar manualmente
ssh -vvv user@seu-servidor.com

# Verificar porta
nc -zv seu-servidor.com 22

# Verificar serviço SSH
sudo systemctl status sshd
```

### Erro: "Invalid private key format"

**Verificar formato da chave**:
```bash
# Chave válida começa com:
-----BEGIN OPENSSH PRIVATE KEY-----
# ou
-----BEGIN RSA PRIVATE KEY-----
# ou
-----BEGIN EC PRIVATE KEY-----
```

## 📚 Documentação Completa

- **Guia Multi-Tenant**: `MULTI_TENANT_SSH_GUIDE.md`
- **SSH Access Guide**: `SSH_ACCESS_GUIDE.md`
- **SSH Quick Start**: `SSH_QUICKSTART.md`
- **Executor Implementation**: `EXECUTOR_IMPLEMENTATION.md`

## 🎯 Próximos Passos

Após configurar tudo:

1. ✅ Adicionar chave SSH
2. ✅ Testar conexão
3. ✅ Marcar como padrão
4. ✅ Ir para projeto
5. ✅ Abrir Task Executor
6. ✅ Executar tasks
7. ✅ Ver logs em tempo real
8. 🎉 Sucesso!

## 💡 Dicas

1. **Múltiplas Chaves**: Você pode ter várias chaves para diferentes servidores
2. **Chave Padrão**: Marque a mais usada como padrão
3. **Desativar Chave**: Em vez de deletar, você pode desativar temporariamente
4. **Fingerprint**: Use para verificar se é a chave certa
5. **Teste Sempre**: Antes de salvar, teste a conexão

## ❓ Perguntas Frequentes

**P: Posso compartilhar chave com outro usuário?**
R: Não. Cada usuário tem suas próprias chaves (isolamento de segurança).

**P: Onde ficam as chaves armazenadas?**
R: No banco de dados PostgreSQL, criptografadas com AES-256-GCM.

**P: E se eu esquecer a senha mestra?**
R: Todas as chaves ficarão inacessíveis! Sempre faça backup.

**P: Posso usar a mesma chave para múltiplos servidores?**
R: Sim! Instale a chave pública em todos os servidores.

**P: É seguro?**
R: Sim! Usa criptografia de nível militar (AES-256-GCM) e isolamento por usuário.

---

**Status**: ✅ Ready to Use
**Segurança**: 🔒 Production-Ready
**Support**: Consulte a documentação completa
