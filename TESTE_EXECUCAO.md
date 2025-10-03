# 🧪 Guia de Teste - Execução Local

## ✅ Checklist Completo

### 1️⃣ Verificar Diretório Configurado

**Passo 1:** Abra o projeto
**Passo 2:** Clique em "Editar Projeto"
**Passo 3:** Veja se o campo "Diretório de Execução" está preenchido

**Resultado esperado:**
```
✅ Campo mostra um caminho tipo: /home/nommand/meu-projeto
```

**Se estiver vazio:**
1. Clique em "Selecionar"
2. Navegue até uma pasta (ex: `/home/nommand`)
3. Clique em "Selecionar este diretório"
4. Clique em "Salvar"
5. Edite novamente para confirmar que salvou

---

### 2️⃣ Verificar Task Tem Comando

**Passo 1:** Abra uma task existente
**Passo 2:** Verifique o campo "Guidance Prompt"

**Resultado esperado:**
```
✅ Tem um comando shell, ex: ls -la
```

**Se estiver vazio:**
1. Edite a task
2. No campo "Guidance Prompt" coloque: `ls -la`
3. Salve

---

### 3️⃣ Testar Execução

**Passo 1:** Vá para "Task Executor"
**Passo 2:** Selecione uma task
**Passo 3:** Clique em "Executar"

**O que deve acontecer:**

**❌ Se não tem diretório configurado:**
```
Erro: "Diretório de execução não configurado"
Mensagem: "Configure o diretório de execução do projeto..."
```
→ Volte para o passo 1️⃣

**✅ Se tem diretório configurado:**
```
Status muda para: "Running" (rodando)
Timer começa a contar
Logs aparecem:
  [INFO] Execution started with X tasks
  [INFO] Execution path: /seu/caminho
  [INFO] Starting task: Nome da Task
```

---

### 4️⃣ Acompanhar Execução

**Durante a execução você deve ver:**

1. **Status:** `Running`
2. **Timer:** Contando (ex: 00:05, 00:10)
3. **Progress:** `Task 1 de 3`
4. **Logs em tempo real:**
```
[10:30:45] [INFO] Execution started
[10:30:45] [INFO] Execution path: /caminho
[10:30:46] [INFO] Starting task: Task 1
[10:30:48] [SUCCESS] Task completed successfully
[10:30:48] [INFO] <output do comando aqui>
```

---

### 5️⃣ Verificar Resultado

**Quando terminar:**

**Status:** `Completed`
**Stats:**
```
✅ 3 successful
❌ 0 failed
⏭️ 0 skipped
```

**Logs finais:**
```
[10:31:00] [SUCCESS] Execution completed: 3 successful, 0 failed
```

---

## 🐛 Problemas Comuns

### Problema 1: Timer não muda
**Sintomas:** Timer fica em 00:00

**Causa:** Execução não iniciou ou falhou

**Verificar:**
1. Abra DevTools (F12)
2. Vá em "Console"
3. Procure por erros em vermelho

**Solução:**
- Se tiver erro 400: Diretório não configurado
- Se tiver erro 500: Veja logs do servidor

---

### Problema 2: Logs não aparecem
**Sintomas:** Área de logs fica vazia

**Causa:** Auto-refresh pode estar desabilitado

**Solução:**
1. Feche o executor
2. Abra novamente
3. Execute task nova

---

### Problema 3: Task não executa
**Sintomas:** Status fica "Pending"

**Verificar no terminal do servidor:**
```bash
# Ver logs em tempo real
tail -f /caminho/do/projeto/.next/server/app-paths-manifest.json
```

**Ou verificar erro específico:**
- Comando inválido
- Diretório não existe
- Sem permissão

---

## 📊 Teste Completo Passo a Passo

### Teste 1: Comando Simples

**Projeto:** Qualquer um
**Diretório:** `/home/nommand`
**Task:**
```
Title: Testar LS
Guidance Prompt: ls -la
```

**Resultado esperado:**
```
[INFO] Execution started
[INFO] Starting task: Testar LS
[SUCCESS] Task completed successfully
[INFO] total 48
drwxr-xr-x 12 nommand nommand 4096 ...
drwxr-xr-x  3 nommand nommand 4096 ...
...
```

---

### Teste 2: Comando que Demora

**Projeto:** Qualquer um
**Diretório:** `/home/nommand`
**Task:**
```
Title: Aguardar 5 segundos
Guidance Prompt: sleep 5 && echo "Concluído!"
```

**Resultado esperado:**
```
Timer conta: 00:01, 00:02, 00:03, 00:04, 00:05
[SUCCESS] Task completed
[INFO] Concluído!
```

---

### Teste 3: Comando com Erro

**Projeto:** Qualquer um
**Diretório:** `/home/nommand`
**Task:**
```
Title: Comando Inexistente
Guidance Prompt: comandoinexistente
```

**Resultado esperado:**
```
[ERROR] Task failed: Comando Inexistente
[ERROR] Command execution failed: ...
[ERROR] comandoinexistente: command not found
```

---

## 🔍 Debug Detalhado

### Ver Logs do Servidor

**Terminal onde o Next.js roda:**
```bash
# Vai mostrar quando task executar
Error executing task: ...
Command execution failed: ...
```

### Ver Estado da Execução

**No navegador (DevTools → Console):**
```javascript
// Ver estado atual
console.log(execution)

// Ver logs
console.log(execution.logs)

// Ver status
console.log(execution.status)
```

---

## ✅ Checklist Final

Execute este teste e marque:

- [ ] Diretório configurado no projeto
- [ ] Campo "Diretório de Execução" aparece na edição
- [ ] Campo salva quando modificado
- [ ] Task tem comando no "Guidance Prompt"
- [ ] Ao executar, status muda para "Running"
- [ ] Timer começa a contar
- [ ] Logs aparecem em tempo real
- [ ] Quando termina, status muda para "Completed"
- [ ] Stats mostram "successful"
- [ ] Resultado da task foi salvo no banco

---

## 📞 Se Não Funcionar

**Cole aqui os resultados:**

1. **Diretório configurado:**
```
/home/nommand/...
```

2. **Comando da task:**
```
ls -la
```

3. **Erro que aparece:**
```
...
```

4. **Logs do servidor (terminal):**
```
...
```

5. **Console do navegador (F12):**
```
...
```

---

**Com essas informações consigo identificar o problema!** 🔍
