# 🎓 GUIA SUPER SIMPLES - Para Quem Nunca Usou

## 🏠 ENTENDA PRIMEIRO

Você tem **2 LUGARES**:

### 1️⃣ SERVIDOR (a máquina onde o código está)
```
┌─────────────────────────────────┐
│  💻 SERVIDOR                    │
│                                 │
│  Aqui você DIGITA COMANDOS      │
│  Parece com isso:               │
│                                 │
│  nommand@servidor:~$            │
│  ▊                              │
└─────────────────────────────────┘
```
**Como acessar:** SSH, terminal, console

### 2️⃣ NAVEGADOR (seu computador)
```
┌─────────────────────────────────┐
│  🌐 NAVEGADOR                   │
│                                 │
│  Aqui você CLICA EM BOTÕES      │
│  Parece com isso:               │
│                                 │
│  [🔘 Botão] [📝 Campo] [✅ Ok]  │
│                                 │
└─────────────────────────────────┘
```
**Como acessar:** Chrome, Firefox, etc

---

## 📝 ANTES DE COMEÇAR

### Você vai precisar saber:

**1. Como acessar o servidor?**
```bash
ssh nommand@servidor.com
# OU
ssh nommand@192.168.1.100
```

**2. Qual o caminho da pasta do projeto?**
```
/home/nommand/code/maneger-porject/maneger-project
```

**3. Como abrir a interface no navegador?**
```
http://localhost:3000
# OU (se servidor remoto)
http://IP_DO_SERVIDOR:3000
```

---

## 🚀 PASSO A PASSO ILUSTRADO

### 📍 PARTE 1: NO SERVIDOR (Terminal)

#### PASSO 1: Conectar no Servidor

**O que fazer:**
```bash
ssh nommand@seu_servidor
```

**Como saber que deu certo:**
```
nommand@servidor:~$ ← você vai ver isso
```

---

#### PASSO 2: Ir para a Pasta do Projeto

**O que fazer:**
```bash
cd /home/nommand/code/maneger-porject/maneger-project
```

**Como saber que deu certo:**
```
nommand@servidor:~/code/maneger-porject/maneger-project$
```

---

#### PASSO 3: Gerar Senha Secreta

**O que fazer:**
```bash
openssl rand -base64 32
```

**O que vai aparecer:**
```
dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ=
```

**⭐ IMPORTANTE:**
1. **COPIE** essa senha que apareceu
2. **GUARDE** em um lugar seguro (bloco de notas, papel, etc)

---

#### PASSO 4: Salvar a Senha no Arquivo

**O que fazer:**
```bash
echo 'SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ1aB4cE6fG9hI0jK2lM4nO6pQ="' >> .env.local
```

**⚠️ ATENÇÃO:**
- Substitua `dK3mP9vL2nQ8rT5wX7yZ...` pela senha que VOCÊ copiou no passo 3
- Mantenha as aspas `"`
- Copie o comando INTEIRO

**Verificar se salvou:**
```bash
cat .env.local | grep SSH
```

**Deve mostrar:**
```
SSH_ENCRYPTION_KEY="dK3mP9vL2nQ8rT5wX7yZ..."
```

✅ Se mostrou = deu certo!

---

#### PASSO 5: Criar Chave SSH

**O que fazer:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N ""
```

**O que vai aparecer:**
```
Generating public/private ed25519 key pair.
Your identification has been saved in /home/nommand/.ssh/executor_key
Your public key has been saved in /home/nommand/.ssh/executor_key.pub
```

✅ Funcionou!

---

#### PASSO 6: Instalar a Chave no Servidor

**O que fazer (copie os 3 comandos):**
```bash
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Não vai aparecer nada = está certo!**

---

#### PASSO 7: Parar o Next.js

**O que fazer:**
1. Vá no terminal onde está rodando `npm run dev`
2. Aperte as teclas: `Ctrl + C` (ao mesmo tempo)

**O que vai aparecer:**
```
^C
nommand@servidor:~/projeto$ ← volta o prompt
```

---

#### PASSO 8: Limpar Cache

**O que fazer:**
```bash
rm -rf .next
```

**Não vai aparecer nada = está certo!**

---

#### PASSO 9: Iniciar Next.js Novamente

**O que fazer:**
```bash
npm run dev
```

**O que vai aparecer:**
```
> npm run dev

✓ Ready in 3.2s
✓ Local: http://localhost:3000
```

✅ Aguarde aparecer essa mensagem!

**⚠️ DEIXE ESTE TERMINAL ABERTO!** Não feche nem mexa!

---

### 📍 PARTE 2: NO NAVEGADOR (Seu Computador)

#### PASSO 10: Abrir o Navegador

**O que fazer:**
1. Abra Chrome, Firefox, ou qualquer navegador
2. Digite na barra de endereço:
```
http://localhost:3000
```

**OU se o servidor for em outra máquina:**
```
http://192.168.1.100:3000
```
(substitua pelo IP do seu servidor)

---

#### PASSO 11: Fazer Login

**O que vai aparecer:**
```
┌─────────────────────┐
│  Login              │
│                     │
│  Email: _________   │
│  Senha: _________   │
│                     │
│  [Entrar]           │
└─────────────────────┘
```

**O que fazer:**
1. Digite seu email
2. Digite sua senha
3. Clique em "Entrar"

---

#### PASSO 12: Ir para Configurações

**O que fazer:**
1. Procure seu **Avatar** (foto ou inicial) no canto superior direito
2. Clique nele
3. Vai abrir um menu
4. Clique em **"Configurações"** ou **"Settings"**

**Vai ficar assim:**
```
┌────────────────────────────────────────┐
│  Logo    Projeto    Tasks    [👤 Você] │ ← clique aqui
└────────────────────────────────────────┘
              ↓
        ┌─────────────────┐
        │ ⚙️  Configurações │ ← clique aqui
        │ 👤 Perfil        │
        │ 🚪 Sair          │
        └─────────────────┘
```

---

#### PASSO 13: Abrir Tab "Chaves SSH"

**O que vai aparecer:**
```
┌────────────────────────────────────────┐
│  Configurações                         │
├────────────────────────────────────────┤
│ [🔑 Chaves SSH] [👤 Perfil] [🔔 ...]   │ ← clique aqui
├────────────────────────────────────────┤
│                                        │
│  Nenhuma chave SSH cadastrada          │
│                                        │
│       [+ Adicionar Chave]              │
│                                        │
└────────────────────────────────────────┘
```

**O que fazer:**
1. Clique na tab **"Chaves SSH"** (ícone de chave 🔑)

---

#### PASSO 14: Clicar "Adicionar Chave"

**O que fazer:**
1. Clique no botão **"+ Adicionar Chave"**

**Vai abrir um formulário grande**

---

### 📍 PARTE 3: PREENCHER FORMULÁRIO (Navegador)

#### PASSO 15: Copiar Chave Privada

**⚠️ VOLTE PARA O TERMINAL DO SERVIDOR**

**O que fazer:**
```bash
cat ~/.ssh/executor_key
```

**Vai aparecer:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBKj9n4dP7IjCvKGfZQJYzX8wF...
... (várias linhas) ...
-----END OPENSSH PRIVATE KEY-----
```

**⭐ COPIE TUDO** (do `-----BEGIN` até `-----END`)

**Como copiar:**
1. Mouse: Selecione tudo e Ctrl+C
2. OU: Ctrl+Shift+C no terminal
3. OU: Botão direito → Copiar

---

#### PASSO 16: Ver Seu Username

**Ainda no TERMINAL DO SERVIDOR:**
```bash
whoami
```

**Vai aparecer:**
```
nommand
```

**⭐ COPIE** esse nome (vai usar no formulário)

---

#### PASSO 17: Preencher o Formulário

**⚠️ VOLTE PARA O NAVEGADOR**

**Preencha campo por campo:**

| Campo | O que escrever | De onde vem |
|-------|----------------|-------------|
| **Nome** | `Servidor Local` | Você inventa |
| **Host** | `127.0.0.1` | Cole exatamente |
| **Porta** | `22` | Já vem preenchido |
| **Username** | `nommand` | Do comando `whoami` |
| **Chave Privada** | `-----BEGIN...` | Cole do Passo 15 |

**Marcar como padrão:**
- ✅ Deixe marcado (checkbox ativado)

**Visual do formulário:**
```
┌─────────────────────────────────────┐
│  Adicionar Chave SSH                │
├─────────────────────────────────────┤
│  Nome: [Servidor Local_______]      │
│  Host: [127.0.0.1____________]      │
│  Porta: [22__]                      │
│  Username: [nommand__________]      │
│  Chave Privada:                     │
│  [-----BEGIN OPENSSH PRIVATE KEY----│
│   b3BlbnNzaC1rZXktdjEAAAAA...     │
│   -----END OPENSSH PRIVATE KEY----] │
│                                     │
│  ☑️ Marcar como padrão               │
│                                     │
│  [🧪 Testar Conexão SSH]            │
│                                     │
│  [Cancelar]  [Salvar Chave]         │
└─────────────────────────────────────┘
```

---

#### PASSO 18: Testar Conexão

**O que fazer:**
1. Clique no botão **"🧪 Testar Conexão SSH"**
2. **AGUARDE** uns 5-10 segundos

**O que vai aparecer:**

**✅ SUCESSO:**
```
✅ SSH connection successful
```

**❌ ERRO:**
```
❌ Connection failed: ...
```

**Se deu erro:** Vá para a seção "PROBLEMAS" no final deste guia

---

#### PASSO 19: Salvar a Chave

**Só faça se o teste deu ✅ sucesso!**

**O que fazer:**
1. Clique no botão **"Salvar Chave"**

**O que vai aparecer:**
```
✅ Chave SSH adicionada com sucesso
```

**Agora você vai ver a chave na lista!**

---

### 📍 PARTE 4: TESTAR EXECUÇÃO (Navegador)

#### PASSO 20: Ir para um Projeto

**O que fazer:**
1. Clique no logo ou menu para voltar
2. Escolha um projeto da lista
3. Clique nele

**OU acesse direto:**
```
http://localhost:3000/project/1
```
(substitua `1` pelo ID do seu projeto)

---

#### PASSO 21: Abrir Task Executor

**No topo da página do projeto, vai ter:**
```
┌─────────────────────────────────────────┐
│  Projeto: Nome do Projeto               │
│                                         │
│  [▶ Task Executor] [✏️ Editar] [🗑️ Del] │ ← clique aqui
└─────────────────────────────────────────┘
```

**O que fazer:**
1. Clique no botão **"▶ Task Executor"**

---

#### PASSO 22: Executar Tasks

**O que vai aparecer:**
```
┌─────────────────────────────────────────┐
│  Task Executor                          │
├─────────────────────────────────────────┤
│  [🔍 Buscar] [➕ Add] [▶ Executar (3)]  │
├─────────────────────────────────────────┤
│  ☑️ Task 1: Fazer algo                  │
│  ☑️ Task 2: Outra coisa                 │
│  ☑️ Task 3: Mais uma                    │
├─────────────────────────────────────────┤
│  Log de Execução:                       │
│  [                                    ]  │
└─────────────────────────────────────────┘
```

**O que fazer:**
1. Marque as tasks que quer executar (☑️)
2. Clique em **"▶ Executar"**

---

#### PASSO 23: Ver os Logs

**No painel "Log de Execução", vai aparecer:**

```
[10:30:45] [INFO] Execution started with 3 tasks by voce@email.com
[10:30:45] [INFO] Using SSH key: clq1k2j3k4l5m6n7o8p9
[10:30:46] [INFO] Starting task: Task 1
[10:30:48] [SUCCESS] Task completed successfully
[10:30:49] [INFO] Starting task: Task 2
...
```

**✅ SE VOCÊ VIU ISSO = FUNCIONOU!** 🎉

---

## ❌ PROBLEMAS E SOLUÇÕES

### Problema 1: "sSHKey is undefined"

**Onde aparece:** Navegador, ao abrir `/settings`

**Solução:**
```bash
# TERMINAL DO SERVIDOR:
# 1. Parar Next.js (Ctrl+C)
# 2. Executar:
rm -rf .next
npm run dev
```

---

### Problema 2: "SSH connection timeout"

**Onde aparece:** Navegador, ao testar conexão

**Solução:**
```bash
# TERMINAL DO SERVIDOR:
sudo apt-get install openssh-server
sudo systemctl start ssh
sudo systemctl enable ssh
```

---

### Problema 3: "Permission denied"

**Onde aparece:** Navegador, ao testar conexão

**Solução:**
```bash
# TERMINAL DO SERVIDOR:
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

### Problema 4: "Invalid private key"

**Onde aparece:** Navegador, ao salvar chave

**Solução:**
1. Volte ao Passo 15
2. Copie a chave novamente
3. Certifique-se de copiar TUDO
4. De `-----BEGIN` até `-----END`

---

## 🎯 CHECKLIST VISUAL

### ✅ No Servidor (Terminal):
```
[✅] Conectei no servidor via SSH
[✅] Fui para pasta: cd /home/nommand/code/.../maneger-project
[✅] Gerei senha: openssl rand -base64 32
[✅] Salvei senha: echo 'SSH_ENCRYPTION_KEY="..."' >> .env.local
[✅] Criei chave: ssh-keygen -t ed25519 -f ~/.ssh/executor_key -N ""
[✅] Instalei chave: cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
[✅] Parei Next.js: Ctrl+C
[✅] Limpei cache: rm -rf .next
[✅] Iniciei: npm run dev
[✅] Copiei chave: cat ~/.ssh/executor_key
[✅] Vi username: whoami
```

### ✅ No Navegador (Seu PC):
```
[✅] Abri: http://localhost:3000
[✅] Fiz login
[✅] Avatar → Configurações
[✅] Tab "Chaves SSH"
[✅] "Adicionar Chave"
[✅] Preenchi: Nome, Host, Porta, Username, Chave
[✅] Marquei "padrão"
[✅] Testei conexão → ✅ sucesso
[✅] Salvei chave
[✅] Fui para projeto
[✅] "Task Executor"
[✅] Executei tasks
[✅] Vi logs aparecendo → SUCESSO! 🎉
```

---

## 📞 AINDA COM DÚVIDA?

**Cole estes comandos no terminal do servidor e me envie o resultado:**

```bash
# Ver onde você está
pwd

# Ver se .env.local tem a senha
cat .env.local | grep SSH

# Ver se chave existe
ls -la ~/.ssh/executor_key

# Ver seu usuário
whoami

# Testar SSH local
ssh -o StrictHostKeyChecking=no $(whoami)@127.0.0.1 "echo OK"
```

---

**Agora sim ficou claro?** 😊

Se ainda tiver dúvida, me diga EXATAMENTE qual passo travou!
