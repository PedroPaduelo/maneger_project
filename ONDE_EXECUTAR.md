# 🎯 ONDE EXECUTAR CADA COMANDO - GUIA VISUAL

## 📍 Entendendo os Locais

### Você tem 2 LUGARES diferentes:

```
┌─────────────────────────────────────┐
│  💻 SERVIDOR (onde o sistema roda)  │
│  - Onde está o código Next.js       │
│  - Onde roda: npm run dev           │
│  - Caminho: /home/nommand/code/...  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🌐 NAVEGADOR (seu computador)      │
│  - Chrome, Firefox, etc             │
│  - Onde você acessa a interface     │
│  - URL: http://localhost:3000       │
└─────────────────────────────────────┘
```

---

## 🔧 PASSO A PASSO COM LOCAIS

### ✅ PASSO 1: Configurar Senha (NO SERVIDOR)

**📍 ONDE:** Terminal do servidor (onde está o código)

```bash
# 1. Ir para a pasta do projeto
cd /home/nommand/code/maneger-porject/maneger-project

# 2. Gerar senha
openssl rand -base64 32

# 3. Copie o resultado (exemplo: dK3mP9vL2nQ8rT5wX7yZ...)
```

**Resultado vai aparecer algo como:**
```
dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ=
```

**⚠️ COPIE ESSA SENHA!**

---

### ✅ PASSO 2: Adicionar Senha ao Arquivo (NO SERVIDOR)

**📍 ONDE:** Ainda no terminal do servidor

**Opção A - Comando Rápido:**
```bash
# Cole este comando (substitua pela SUA senha)
echo 'SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="' >> .env.local
```

**Opção B - Editor de Texto:**
```bash
# Abrir arquivo
nano .env.local

# OU
code .env.local

# Adicionar esta linha NO FINAL:
SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="

# Salvar e fechar (Ctrl+S, Ctrl+X no nano)
```

**Verificar se salvou:**
```bash
cat .env.local | grep SSH
```

---

### ✅ PASSO 3: Criar Chave SSH (NO SERVIDOR)

**📍 ONDE:** Terminal do servidor

```bash
# Criar chave SSH
ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N ""
```

**O que vai acontecer:**
```
Generating public/private ed25519 key pair.
Your identification has been saved in /home/nommand/.ssh/executor_key
Your public key has been saved in /home/nommand/.ssh/executor_key.pub
```

**Instalar chave no próprio servidor (para teste local):**
```bash
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Ver chave privada (para copiar depois):**
```bash
cat ~/.ssh/executor_key
```

**⚠️ Vai aparecer algo como:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBKj9n4dP7IjCvKGfZQJYzX8wF...
-----END OPENSSH PRIVATE KEY-----
```

**NÃO copie agora, só no Passo 6!**

---

### ✅ PASSO 4: Reiniciar Next.js (NO SERVIDOR)

**📍 ONDE:** Terminal do servidor (onde roda o Next.js)

```bash
# 1. Parar o Next.js
# Aperte: Ctrl + C

# 2. Limpar cache
rm -rf .next

# 3. Iniciar novamente
npm run dev
```

**Aguarde aparecer:**
```
✓ Ready in 3.2s
Local: http://localhost:3000
```

---

### ✅ PASSO 5: Abrir Interface Web (NO NAVEGADOR)

**📍 ONDE:** Navegador do seu computador

**1. Abrir navegador:**
- Chrome, Firefox, Edge, etc.

**2. Acessar:**
```
http://localhost:3000
```

**OU se o servidor for remoto:**
```
http://IP_DO_SERVIDOR:3000
```

**3. Fazer login:**
- Email: seu_email@exemplo.com
- Senha: sua_senha

**4. Ir para Configurações:**
- Clicar no **Avatar** (canto superior direito)
- Clicar em **"Configurações"**

**OU acessar direto:**
```
http://localhost:3000/settings
```

---

### ✅ PASSO 6: Copiar Chave SSH (VOLTAR AO SERVIDOR)

**📍 ONDE:** Terminal do servidor

```bash
# Ver a chave privada
cat ~/.ssh/executor_key
```

**COPIE TODO O CONTEÚDO que aparecer** (de `-----BEGIN` até `-----END`)

**Exemplo do que copiar:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBKj9n4dP7IjCvKGfZQJYzX8wF... (várias linhas)
-----END OPENSSH PRIVATE KEY-----
```

---

### ✅ PASSO 7: Adicionar Chave na Interface (NO NAVEGADOR)

**📍 ONDE:** Navegador (interface web)

**1. Na página de Configurações:**
- Clicar na tab **"Chaves SSH"**
- Clicar em **"+ Adicionar Chave"**

**2. Preencher formulário:**

| Campo | O que colocar | Onde pegar |
|-------|--------------|------------|
| **Nome** | `Servidor Local` | Você escolhe |
| **Host** | `127.0.0.1` | Copie exatamente |
| **Porta** | `22` | Já vem preenchido |
| **Username** | `nommand` | Seu usuário do servidor |
| **Chave Privada** | `-----BEGIN...` | Cole a chave do Passo 6 |
| **Marcar como padrão** | ✅ | Marque o checkbox |

**3. Para saber seu Username no servidor:**

**VOLTAR AO TERMINAL DO SERVIDOR** e executar:
```bash
whoami
```

Resultado (exemplo): `nommand`

**4. Testar Conexão:**
- Clicar em **"🧪 Testar Conexão SSH"**
- Aguardar resultado

**5. Salvar:**
- Se teste deu ✅, clicar em **"Salvar Chave"**

---

## 📊 RESUMO VISUAL

```
FLUXO COMPLETO:

1️⃣ SERVIDOR (Terminal)
   └─> cd /home/nommand/code/maneger-porject/maneger-project
   └─> openssl rand -base64 32
   └─> echo 'SSH_ENCRYPTION_KEY="..."' >> .env.local
   └─> ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N ""
   └─> cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
   └─> Ctrl+C (parar Next.js)
   └─> rm -rf .next
   └─> npm run dev

2️⃣ NAVEGADOR (Interface Web)
   └─> http://localhost:3000
   └─> Login
   └─> Avatar → Configurações
   └─> Tab "Chaves SSH"

3️⃣ SERVIDOR (Terminal) - Copiar chave
   └─> cat ~/.ssh/executor_key
   └─> Copiar tudo

4️⃣ NAVEGADOR - Adicionar chave
   └─> Clicar "Adicionar Chave"
   └─> Preencher formulário
   └─> Colar chave privada
   └─> Testar conexão
   └─> Salvar

5️⃣ NAVEGADOR - Testar execução
   └─> Ir para projeto
   └─> Task Executor
   └─> Executar
   └─> Ver logs ✅
```

---

## 🖥️ IDENTIFICANDO ONDE VOCÊ ESTÁ

### Se você vê isso no terminal:
```bash
nommand@servidor:~/code/maneger-porject/maneger-project$
```
**→ Você está NO SERVIDOR** ✅
**→ Pode executar comandos de terminal**

### Se você vê isso no navegador:
```
┌──────────────────────────────┐
│  http://localhost:3000       │
├──────────────────────────────┤
│                              │
│  [Login]  Email: _______     │
│          Senha: _______      │
│                              │
└──────────────────────────────┘
```
**→ Você está NO NAVEGADOR** ✅
**→ Pode clicar em botões e preencher formulários**

---

## 🔄 COMANDOS POR LOCAL

### 💻 COMANDOS DO SERVIDOR (Terminal SSH)

```bash
# Ir para pasta do projeto
cd /home/nommand/code/maneger-porject/maneger-project

# Gerar senha
openssl rand -base64 32

# Adicionar senha
echo 'SSH_ENCRYPTION_KEY="SUA_SENHA"' >> .env.local

# Criar chave SSH
ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N ""

# Instalar chave
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys

# Ver chave (para copiar)
cat ~/.ssh/executor_key

# Ver seu usuário
whoami

# Reiniciar Next.js
rm -rf .next && npm run dev
```

### 🌐 AÇÕES NO NAVEGADOR (Cliques)

1. Abrir: `http://localhost:3000`
2. Fazer login
3. Clicar: Avatar → Configurações
4. Clicar: Tab "Chaves SSH"
5. Clicar: "Adicionar Chave"
6. Preencher formulário
7. Clicar: "Testar Conexão"
8. Clicar: "Salvar Chave"
9. Ir para projeto
10. Clicar: "Task Executor"
11. Clicar: "Executar"

---

## ❓ PERGUNTAS FREQUENTES

### "Onde fica o .env.local?"
**R:** No servidor, na pasta do projeto:
```bash
/home/nommand/code/maneger-porject/maneger-project/.env.local
```

### "Como edito o .env.local?"
**R:** No terminal do servidor:
```bash
nano .env.local
# OU
code .env.local
```

### "Onde vejo os logs do Next.js?"
**R:** No terminal do servidor onde você rodou `npm run dev`

### "Como acesso a interface?"
**R:** No navegador do seu computador:
```
http://localhost:3000
```

### "A chave SSH fica onde?"
**R:** No servidor:
```bash
~/.ssh/executor_key          # Chave privada
~/.ssh/executor_key.pub      # Chave pública
~/.ssh/authorized_keys       # Chaves autorizadas
```

### "Preciso de SSH instalado no meu PC?"
**R:** NÃO! Só no servidor. Você usa só o navegador no seu PC.

---

## 🎯 CHECKLIST POR LOCAL

### ✅ NO SERVIDOR (Terminal):
- [ ] Entrar via SSH no servidor
- [ ] Ir para pasta do projeto
- [ ] Gerar senha SSH_ENCRYPTION_KEY
- [ ] Adicionar senha ao .env.local
- [ ] Criar chave SSH
- [ ] Instalar chave no servidor
- [ ] Reiniciar Next.js
- [ ] Copiar chave privada

### ✅ NO NAVEGADOR (Seu PC):
- [ ] Abrir http://localhost:3000
- [ ] Fazer login
- [ ] Ir para Configurações
- [ ] Abrir tab "Chaves SSH"
- [ ] Clicar "Adicionar Chave"
- [ ] Preencher dados
- [ ] Colar chave privada
- [ ] Testar conexão
- [ ] Salvar chave
- [ ] Testar execução

---

## 🆘 AJUDA RÁPIDA

**Se perdeu o lugar:**

```bash
# Ver onde você está
pwd

# Se não for a pasta do projeto, vá para ela:
cd /home/nommand/code/maneger-porject/maneger-project
```

**Se não sabe se é servidor ou PC:**
- Se tem `$` ou `#` no terminal = SERVIDOR
- Se tem botões e interface = NAVEGADOR

---

**Agora ficou claro?** 🎯

- SERVIDOR = onde você executa comandos
- NAVEGADOR = onde você clica em botões
