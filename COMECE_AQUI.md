# 🎯 COMECE AQUI - Sistema SSH Multi-Tenant

## 🤔 Qual Guia Usar?

Escolha o guia certo para você:

---

## 📚 GUIAS DISPONÍVEIS

### 🥇 **RECOMENDADO PARA INICIANTES**

#### 📖 [`GUIA_SUPER_SIMPLES.md`](./GUIA_SUPER_SIMPLES.md)
**👉 Use este se você:**
- Nunca usou SSH antes
- Quer passo a passo bem detalhado
- Prefere ver exemplos visuais
- Quer entender o que está fazendo

**📊 Nível:** ⭐ Iniciante
**⏱️ Tempo:** ~15 minutos
**📝 Estilo:** Explicativo, com imagens ASCII

---

### 🥈 **PARA QUEM SABE O BÁSICO**

#### 📍 [`ONDE_EXECUTAR.md`](./ONDE_EXECUTAR.md)
**👉 Use este se você:**
- Já usou terminal antes
- Só quer saber ONDE executar cada comando
- Está confuso entre servidor e navegador

**📊 Nível:** ⭐⭐ Intermediário
**⏱️ Tempo:** ~10 minutos
**📝 Estilo:** Objetivo, com locais bem marcados

---

### 🥉 **PARA QUEM TEM PRÁTICA**

#### ⚡ [`COMANDOS_RAPIDOS.md`](./COMANDOS_RAPIDOS.md)
**👉 Use este se você:**
- Já tem experiência com terminal
- Quer comandos prontos para copiar
- Prefere fazer tudo rápido

**📊 Nível:** ⭐⭐⭐ Avançado
**⏱️ Tempo:** ~2 minutos
**📝 Estilo:** Comandos diretos, sem explicação

---

### 🤖 **SETUP AUTOMÁTICO**

#### 🚀 [`SETUP_AUTOMATICO.sh`](./SETUP_AUTOMATICO.sh)
**👉 Use este se você:**
- Quer que tudo seja feito automaticamente
- Confia em scripts bash
- Quer economizar tempo

**Como usar:**
```bash
cd /home/nommand/code/maneger-porject/maneger-project
chmod +x SETUP_AUTOMATICO.sh
./SETUP_AUTOMATICO.sh
```

**📊 Nível:** ⭐⭐ Intermediário
**⏱️ Tempo:** ~30 segundos
**📝 Estilo:** Script automatizado

---

### ✅ **CHECKLIST INTERATIVO**

#### 📋 [`CHECKLIST_TESTE.md`](./CHECKLIST_TESTE.md)
**👉 Use este se você:**
- Gosta de marcar itens conforme avança
- Quer ter controle de cada etapa
- Prefere checklist visual

**📊 Nível:** ⭐⭐ Intermediário
**⏱️ Tempo:** ~10 minutos
**📝 Estilo:** Lista de tarefas interativa

---

## 🎯 RECOMENDAÇÃO POR PERFIL

### 👶 **Nunca usei SSH / Sou iniciante**
```
1. GUIA_SUPER_SIMPLES.md  ← Comece aqui
2. CHECKLIST_TESTE.md     ← Use para marcar progresso
3. ONDE_EXECUTAR.md       ← Se ficar confuso com os locais
```

### 🧑 **Já usei terminal básico**
```
1. ONDE_EXECUTAR.md       ← Veja onde executar cada coisa
2. CHECKLIST_TESTE.md     ← Siga o checklist
3. COMANDOS_RAPIDOS.md    ← Para consultas rápidas
```

### 👨‍💻 **Tenho experiência**
```
1. COMANDOS_RAPIDOS.md    ← Copie e cole os comandos
OU
1. SETUP_AUTOMATICO.sh    ← Execute o script
```

---

## ⚡ INÍCIO RÁPIDO (1 Minuto)

### Se você quer começar AGORA:

**1. No terminal do servidor:**
```bash
cd /home/nommand/code/maneger-porject/maneger-project
./SETUP_AUTOMATICO.sh
```

**2. Copie as informações que aparecerem**

**3. No navegador:**
- Acesse: `http://localhost:3000/settings`
- Adicione a chave SSH com os dados copiados

**4. Teste:**
- Vá para um projeto
- Clique em "Task Executor"
- Execute uma task
- ✅ Funcionou!

---

## 📖 GUIAS TÉCNICOS (Referência)

Estes são guias técnicos detalhados, para consulta:

### 📚 Documentação Completa
- [`MULTI_TENANT_SSH_GUIDE.md`](./MULTI_TENANT_SSH_GUIDE.md) - Guia técnico completo do sistema
- [`SSH_ACCESS_GUIDE.md`](./SSH_ACCESS_GUIDE.md) - Implementação técnica detalhada
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Resumo da implementação

### 🚀 Task Executor
- [`EXECUTOR_IMPLEMENTATION.md`](./EXECUTOR_IMPLEMENTATION.md) - Implementação do executor
- [`EXECUTOR_QUICKSTART.md`](./EXECUTOR_QUICKSTART.md) - Quick start do executor
- [`EXECUTOR_UPDATE.md`](./EXECUTOR_UPDATE.md) - Atualizações do executor

### ⚙️ Setup
- [`SSH_SETUP_INSTRUCTIONS.md`](./SSH_SETUP_INSTRUCTIONS.md) - Instruções detalhadas de setup
- [`SSH_QUICKSTART.md`](./SSH_QUICKSTART.md) - Quick start SSH
- [`SETUP_NOW.md`](./SETUP_NOW.md) - Setup imediato

---

## 🆘 PROBLEMAS COMUNS

### ❌ "sSHKey is undefined"
**Solução rápida:**
```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

### ❌ "SSH connection timeout"
**Solução rápida:**
```bash
sudo apt-get install openssh-server
sudo systemctl start ssh
```

### ❌ "Permission denied"
**Solução rápida:**
```bash
cat ~/.ssh/executor_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**📖 Mais soluções:** Veja seção de Troubleshooting em qualquer guia

---

## 🎓 FLUXO RECOMENDADO

```
┌─────────────────────────┐
│  Escolha seu perfil     │
└────────────┬────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
Iniciante         Experiente
    │                 │
    ▼                 ▼
GUIA_SUPER_      COMANDOS_
SIMPLES.md       RAPIDOS.md
    │                 │
    ▼                 ▼
CHECKLIST_       OU
TESTE.md
    │            SETUP_
    ▼            AUTOMATICO.sh
                     │
    └────────┬───────┘
             ▼
    ┌──────────────────┐
    │  npm run dev     │
    └────────┬─────────┘
             ▼
    ┌──────────────────┐
    │  /settings       │
    │  Adicionar SSH   │
    └────────┬─────────┘
             ▼
    ┌──────────────────┐
    │  Task Executor   │
    │  Executar        │
    └────────┬─────────┘
             ▼
         ✅ SUCESSO!
```

---

## 📞 PRECISA DE AJUDA?

### 1. Consulte os guias
Todos os guias têm seção de "Troubleshooting"

### 2. Verifique o setup
```bash
# Executar diagnóstico
cat .env.local | grep SSH              # Senha OK?
ls ~/.ssh/executor_key                 # Chave OK?
ssh $(whoami)@127.0.0.1 "echo OK"     # SSH OK?
```

### 3. Reset completo
Se tudo falhar, comece do zero:
```bash
sed -i '/SSH_ENCRYPTION_KEY/d' .env.local
rm -f ~/.ssh/executor_key*
rm -rf .next
./SETUP_AUTOMATICO.sh
```

---

## ✅ CHECKLIST DE SUCESSO

Você saberá que funcionou quando:

- [ ] ✅ Página `/settings` carrega sem erros
- [ ] ✅ Tab "Chaves SSH" aparece
- [ ] ✅ Consegue adicionar uma chave
- [ ] ✅ Teste de conexão retorna sucesso ✅
- [ ] ✅ Chave aparece na lista
- [ ] ✅ Task Executor funciona
- [ ] ✅ Logs aparecem com seu email
- [ ] ✅ Tasks executam corretamente

**Se marcou tudo = SISTEMA FUNCIONANDO! 🎉**

---

## 🎯 COMEÇAR AGORA

**Escolha UMA opção abaixo e siga:**

### Opção 1: Iniciante (Passo a Passo)
```bash
cat GUIA_SUPER_SIMPLES.md
# Siga cada passo do guia
```

### Opção 2: Intermediário (Com Checklist)
```bash
cat ONDE_EXECUTAR.md        # Entenda os locais
cat CHECKLIST_TESTE.md      # Siga o checklist
```

### Opção 3: Avançado (Automático)
```bash
./SETUP_AUTOMATICO.sh       # Executa tudo
npm run dev                 # Inicia servidor
# Acesse /settings e adicione a chave
```

---

## 📊 RESUMO DOS ARQUIVOS

| Arquivo | Para quem | Tempo | Uso |
|---------|-----------|-------|-----|
| `GUIA_SUPER_SIMPLES.md` | ⭐ Iniciante | 15min | Passo a passo detalhado |
| `ONDE_EXECUTAR.md` | ⭐⭐ Intermediário | 10min | Onde executar cada comando |
| `CHECKLIST_TESTE.md` | ⭐⭐ Intermediário | 10min | Lista de tarefas |
| `COMANDOS_RAPIDOS.md` | ⭐⭐⭐ Avançado | 2min | Comandos prontos |
| `SETUP_AUTOMATICO.sh` | ⭐⭐ Intermediário | 30seg | Script automático |

---

**🎉 Boa sorte com o setup!**

Se ainda tiver dúvidas, abra qualquer um dos guias acima. Eles são bem detalhados! 📚
