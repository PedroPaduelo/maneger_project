# 🚀 Guia COMPLETO para Testar - Para Iniciantes

## 📋 O que você vai fazer:

1. ✅ Configurar uma senha secreta
2. ✅ Reiniciar o sistema
3. ✅ Adicionar sua chave SSH
4. ✅ Testar execução de tasks

**Tempo estimado**: 10 minutos

---

## 🔧 PASSO 1: Configurar Senha Secreta

### O que é isso?
É uma senha que o sistema usa para proteger suas chaves SSH. Sem ela, nada funciona.

### Como fazer:

#### 1.1 - Abrir o Terminal

**No Linux/Mac:**
- Aperte `Ctrl + Alt + T`
- Ou procure por "Terminal" no menu

**No Windows:**
- Aperte `Win + R`
- Digite `cmd` e aperte Enter

#### 1.2 - Ir para a pasta do projeto

```bash
cd /home/nommand/code/maneger-porject/maneger-project
```

#### 1.3 - Gerar a senha secreta

**Copie e cole este comando:**

```bash
openssl rand -base64 32
```

**Resultado esperado:**
```
dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ=
```

⚠️ **IMPORTANTE**: Copie essa senha que apareceu! Você vai usar no próximo passo.

#### 1.4 - Adicionar a senha no arquivo .env.local

**Opção A - Editor de Texto (Mais fácil):**

1. Abra o arquivo `.env.local` na pasta do projeto
   - Use qualquer editor (VSCode, Notepad, etc)

2. Adicione esta linha NO FINAL do arquivo:
   ```
   SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="
   ```
   ⚠️ Substitua pela senha que você copiou no passo anterior!

3. Salve o arquivo (Ctrl+S)

**Opção B - Linha de Comando (Rápido):**

```bash
echo 'SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="' >> .env.local
```
⚠️ Substitua pela sua senha!

#### 1.5 - Verificar se deu certo

```bash
cat .env.local | grep SSH_ENCRYPTION_KEY
```

**Deve aparecer:**
```
SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="
```

✅ Se apareceu, deu certo! Vá para o próximo passo.

---

## 🔄 PASSO 2: Reiniciar o Sistema

### Por que precisa reiniciar?
O Next.js precisa carregar a nova senha e a tabela do banco de dados.

### Como fazer:

#### 2.1 - Parar o servidor atual

**Se você tem o Next.js rodando em um terminal:**

1. Vá até o terminal onde está rodando
2. Aperte `Ctrl + C` (ou `Cmd + C` no Mac)
3. Aguarde aparecer o prompt de comando novamente

#### 2.2 - Limpar o cache (importante!)

```bash
rm -rf .next
```

#### 2.3 - Iniciar novamente

```bash
npm run dev
```

**Aguarde aparecer:**
```
✓ Ready in 3.2s
✓ Local: http://localhost:3000
```

✅ Pronto! Sistema reiniciado.

---

## 🔑 PASSO 3: Obter sua Chave SSH

### 3.1 - Verificar se você já tem uma chave SSH

```bash
ls -la ~/.ssh/
```

**Se aparecer arquivos como:**
- `id_rsa` ou `id_ed25519` → Você já tem chave! ✅
- `No such file or directory` → Precisa criar (vá para 3.2)

### 3.2 - Criar uma chave SSH (se não tiver)

```bash
ssh-keygen -t ed25519 -C "seu_email@exemplo.com" -f ~/.ssh/minha_chave_teste
```

**O que vai perguntar:**

1. **"Enter passphrase"** → Aperte Enter (deixa vazio para teste)
2. **"Enter same passphrase again"** → Aperte Enter novamente

**Resultado:**
```
Your identification has been saved in /home/user/.ssh/minha_chave_teste
Your public key has been saved in /home/user/.ssh/minha_chave_teste.pub
```

### 3.3 - Ver sua chave privada (para copiar)

```bash
cat ~/.ssh/minha_chave_teste
```

**Vai aparecer algo assim:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBKj9n4dP7IjCvKGfZQJYzX8wF...
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **COPIE TUDO** (do `-----BEGIN` até `-----END`), você vai colar na interface web!

### 3.4 - Ver sua chave pública (opcional)

```bash
cat ~/.ssh/minha_chave_teste.pub
```

---

## 💻 PASSO 4: Acessar a Interface Web

### 4.1 - Abrir o navegador

Abra: `http://localhost:3000`

### 4.2 - Fazer Login

1. Se não estiver logado, faça login com seu usuário
2. Email e senha que você usa no sistema

### 4.3 - Ir para Configurações

**Jeito 1 - Pelo Menu:**
1. Clique no **Avatar** (foto/inicial) no canto superior direito
2. Clique em **"Configurações"** ou **"Settings"**

**Jeito 2 - Direto pela URL:**
1. Acesse: `http://localhost:3000/settings`

✅ Você deve ver a página de configurações com várias tabs.

---

## 🔐 PASSO 5: Adicionar Chave SSH

### 5.1 - Ir para a tab "Chaves SSH"

1. Na página de configurações
2. Clique na tab **"Chaves SSH"** ou **"SSH Keys"**

### 5.2 - Clicar em "Adicionar Chave"

1. Clique no botão **"+ Adicionar Chave"**
2. Um formulário vai abrir

### 5.3 - Preencher o Formulário

**Campo por campo:**

#### **Nome** (obrigatório)
```
Minha Chave de Teste
```
→ Um nome qualquer para identificar

#### **Host** (obrigatório)
```
127.0.0.1
```
→ Para teste local, use `127.0.0.1` ou `localhost`

#### **Porta**
```
22
```
→ Já vem preenchido, deixa assim

#### **Username** (obrigatório)
```
seu_usuario_linux
```
→ No Linux, digite: `whoami` no terminal para saber
→ No Windows com WSL, use o usuário do WSL

#### **Chave Privada** (obrigatório)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAA...
-----END OPENSSH PRIVATE KEY-----
```
→ Cole a chave que você copiou no PASSO 3.3

#### **Chave Pública** (opcional)
→ Pode deixar vazio para teste

#### **Passphrase** (se houver)
→ Se você colocou senha na chave, digite aqui
→ Se não, deixe vazio

#### **Descrição** (opcional)
```
Chave para testes locais do sistema
```

#### **Marcar como padrão**
✅ Marque o switch/checkbox

### 5.4 - Testar Conexão (IMPORTANTE!)

1. Clique no botão **"🧪 Testar Conexão SSH"**
2. Aguarde uns segundos

**Resultado esperado:**
- ✅ **"SSH connection successful"** → Deu certo! Continue
- ❌ **"Connection failed"** → Veja o PASSO 7 (Troubleshooting)

### 5.5 - Salvar a Chave

1. Se o teste passou ✅, clique em **"Salvar Chave"**
2. Aguarde aparecer: **"Chave SSH adicionada com sucesso"**

✅ Chave adicionada! Agora vamos testar a execução.

---

## ▶️ PASSO 6: Testar Execução de Tasks

### 6.1 - Ir para um Projeto

1. Clique no logo/menu para voltar ao dashboard
2. Escolha qualquer projeto da lista
3. Clique nele para abrir

### 6.2 - Abrir o Task Executor

**Jeito 1 - Pelo Botão:**
1. No topo da página do projeto
2. Clique no botão **"▶ Task Executor"**

**Jeito 2 - Pela URL:**
```
http://localhost:3000/project/1/executor
```
→ Substitua `1` pelo ID do seu projeto

### 6.3 - Verificar Tasks

1. Deve aparecer a lista de tasks do projeto
2. Se não tiver nenhuma, clique em **"➕ Adicionar Task"** para criar uma

### 6.4 - Executar

1. Selecione uma ou mais tasks (checkbox)
2. Clique no botão **"▶ Executar (N)"**
3. Aguarde a execução

### 6.5 - Ver os Logs

**No painel "Log de Execução", você deve ver:**

```
[10:30:45] [INFO] Execution started with 3 tasks by seu@email.com
[10:30:45] [INFO] Using SSH key: clq1k2j3k4l5m6n7o8p9
[10:30:46] [INFO] Starting task: Nome da Task
[10:30:48] [SUCCESS] Task completed successfully
```

✅ Se você ver seus logs aparecendo, **FUNCIONOU!** 🎉

---

## ❌ PASSO 7: Troubleshooting (Se der erro)

### Erro: "SSH connection timeout"

**Causa**: Servidor SSH não está rodando no host configurado.

**Solução para teste local:**

1. Instalar servidor SSH:
   ```bash
   sudo apt-get install openssh-server
   ```

2. Iniciar o serviço:
   ```bash
   sudo systemctl start ssh
   sudo systemctl enable ssh
   ```

3. Testar manualmente:
   ```bash
   ssh seu_usuario@127.0.0.1
   ```
   Se conectar, volte e teste no sistema!

### Erro: "Invalid private key format"

**Causa**: Chave copiada errada ou incompleta.

**Solução:**
1. Copie novamente a chave (PASSO 3.3)
2. Certifique-se de copiar desde `-----BEGIN` até `-----END`
3. Não copie espaços extras no início ou fim

### Erro: "Permission denied (publickey)"

**Causa**: Chave pública não está no servidor.

**Solução:**

1. Copiar chave pública para o servidor:
   ```bash
   ssh-copy-id -i ~/.ssh/minha_chave_teste.pub seu_usuario@127.0.0.1
   ```

2. Ou manualmente:
   ```bash
   cat ~/.ssh/minha_chave_teste.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### Erro: "sSHKey is undefined"

**Causa**: Next.js não recarregou o Prisma Client.

**Solução:**

1. Parar Next.js (Ctrl+C)
2. Limpar cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Erro: "SSH_ENCRYPTION_KEY must be at least 32 characters"

**Causa**: Senha mestra muito curta ou não configurada.

**Solução:**
1. Volte ao PASSO 1 e gere uma senha nova
2. Certifique-se de que tem 32+ caracteres
3. Reinicie o Next.js

---

## 📸 Como Saber se Está Funcionando?

### ✅ Sinais de Sucesso:

1. **Página /settings carrega** sem erros
2. **Tab "Chaves SSH"** aparece
3. **Teste de conexão** retorna ✅ sucesso
4. **Chave é salva** e aparece na lista
5. **Logs do executor** mostram:
   - Seu email
   - ID da chave SSH
   - Tasks sendo executadas

### ❌ Sinais de Problema:

1. Erro 500 ao acessar `/settings`
2. Erro "sSHKey is undefined"
3. Teste de conexão sempre falha
4. Logs não aparecem

---

## 🎯 Resumo do Teste Completo

```
✅ Passo 1: Configurei SSH_ENCRYPTION_KEY
✅ Passo 2: Reiniciei o Next.js
✅ Passo 3: Obtive minha chave SSH
✅ Passo 4: Acessei /settings
✅ Passo 5: Adicionei chave SSH
✅ Passo 6: Executei tasks
✅ Passo 7: Vi os logs funcionando

🎉 SISTEMA FUNCIONANDO!
```

---

## 📞 Precisa de Ajuda?

### Informações para Debug:

1. **Versão do Node.js:**
   ```bash
   node -v
   ```

2. **Versão do NPM:**
   ```bash
   npm -v
   ```

3. **Verificar banco:**
   ```bash
   npx prisma studio
   ```
   → Abrir e verificar se tabela `tbl_ssh_keys` existe

4. **Ver logs do Next.js:**
   → Terminal onde roda `npm run dev`
   → Copiar mensagens de erro

---

## 🚀 Próximos Passos (Depois que funcionar)

1. **Adicionar mais chaves SSH** para outros servidores
2. **Criar projetos** e vincular a servidores remotos
3. **Executar tasks remotamente** via SSH
4. **Monitorar logs** em tempo real

---

**Criado**: 2025-10-02
**Nível**: Iniciante/Intermediário
**Tempo**: ~10 minutos

Boa sorte! 🍀
