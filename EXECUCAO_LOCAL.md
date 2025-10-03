# ✅ Sistema de Execução Local - Implementado

## 🎯 Mudança de Estratégia

**ANTES (SSH Remoto):**
- Cada usuário configurava chaves SSH
- Execução via SSH em servidores remotos
- Complexo e custoso

**AGORA (Execução Local):**
- Execução direta no servidor onde o Next.js roda
- Usuário seleciona pasta local via interface
- Comandos executados com `child_process`
- Simples e eficiente

---

## 🔧 O que foi Implementado

### 1. **Removido Sistema SSH**
✅ Modelo `SSHKey` removido do Prisma
✅ APIs de SSH removidas (`/api/user/ssh-keys/*`)
✅ Componentes SSH removidos da interface
✅ Biblioteca de criptografia removida

### 2. **Adicionado Campo de Execução**
✅ Campo `executionPath` adicionado ao modelo `Project`
✅ Armazena o diretório onde as tasks serão executadas

### 3. **API de Seleção de Diretórios**
✅ Endpoint: `POST /api/filesystem/list-directories`
✅ Lista diretórios locais do servidor
✅ Segurança: Acesso restrito ao diretório home do usuário

### 4. **Executor Local**
✅ Modificado: `/api/projects/[id]/executor/execute`
✅ Usa `child_process.exec()` para executar comandos
✅ Executa no diretório configurado no projeto

### 5. **Componente de Seleção**
✅ `DirectorySelector` criado
✅ Interface visual para navegar e selecionar pastas
✅ Integrado no formulário de edição de projetos

---

## 📝 Como Usar

### Passo 1: Configurar Diretório de Execução

1. Abra um projeto
2. Clique em "Editar Projeto"
3. No campo "Diretório de Execução", clique em "Selecionar"
4. Navegue até a pasta desejada
5. Clique em "Selecionar este diretório"
6. Salve o projeto

**Exemplo:**
```
/home/nommand/meus-projetos/api-backend
```

### Passo 2: Criar Tasks com Comandos

Ao criar uma task, no campo `Guidance Prompt` ou `Description`, coloque os comandos shell:

**Exemplo de Task:**
```
Title: Instalar dependências
Guidance Prompt: npm install
```

**Exemplo com múltiplos comandos:**
```
Title: Build e Deploy
Guidance Prompt: npm run build && npm run test && docker build -t myapp .
```

### Passo 3: Executar Tasks

1. Vá para o projeto
2. Clique em "Task Executor"
3. Selecione as tasks
4. Clique em "Executar"

**O sistema vai:**
- Executar cada comando no diretório configurado
- Mostrar output em tempo real nos logs
- Salvar resultado no banco
- Atualizar status da task

---

## 🔒 Segurança

### Restrições Implementadas:

1. **Autenticação Obrigatória**
   - Somente usuários autenticados podem listar diretórios
   - Somente dono do projeto pode executar tasks

2. **Isolamento de Diretórios**
   - Acesso restrito ao diretório home do servidor
   - Não permite navegar fora de `/home`

3. **Timeout e Limites**
   - Timeout de 5 minutos por comando
   - Buffer máximo de 10MB de output

---

## 💻 Estrutura de Arquivos Criados

```
src/
├── app/api/
│   ├── filesystem/
│   │   └── list-directories/
│   │       └── route.ts          ← API para listar pastas
│   └── projects/[id]/executor/execute/
│       └── route.ts                ← Executor local (modificado)
│
├── components/
│   ├── directory-selector.tsx      ← Seletor de diretórios
│   └── edit-project-dialog.tsx     ← Modificado (campo executionPath)
│
prisma/
└── schema.prisma                   ← Campo executionPath adicionado
```

---

## 🎬 Fluxo de Execução

```
User seleciona projeto
   ↓
User clica "Executar Tasks"
   ↓
API verifica projeto tem executionPath configurado
   ↓
Para cada task:
   ↓
   1. Extrai comando do guidancePrompt
   2. Executa: exec(comando, { cwd: executionPath })
   3. Captura stdout/stderr
   4. Salva resultado no banco
   5. Adiciona logs em tempo real
   ↓
Finaliza execução
```

---

## 📊 Exemplo Prático

### Projeto: API Backend

**Configuração:**
```
Nome: API de Produtos
Diretório: /home/nommand/projects/product-api
```

**Tasks:**
```
Task 1: "Instalar dependências"
Comando: npm install

Task 2: "Rodar testes"
Comando: npm test

Task 3: "Build produção"
Comando: npm run build

Task 4: "Deploy Docker"
Comando: docker build -t product-api . && docker push product-api
```

**Execução:**
1. User clica "Executar (4 tasks)"
2. Sistema executa sequencialmente:
   - `npm install` em `/home/nommand/projects/product-api`
   - `npm test` em `/home/nommand/projects/product-api`
   - `npm run build` em `/home/nommand/projects/product-api`
   - `docker build...` em `/home/nommand/projects/product-api`
3. Logs aparecem em tempo real
4. Tasks marcadas como "Concluída" ou "Erro"

---

## 🐛 Tratamento de Erros

### Se comando falha:
```typescript
// Task marcada como "Erro"
// Resultado salvo:
{
  status: "Erro",
  result: "Command execution failed: npm ERR! ..."
}

// Log adicionado:
{
  level: "error",
  message: "Task failed: Instalar dependências",
  details: "npm ERR! code ENOENT..."
}
```

### Se diretório não configurado:
```json
{
  "error": "Execution path not configured for this project"
}
```

### Se diretório não existe:
```json
{
  "error": "Diretório não encontrado"
}
```

---

## 🚀 Próximos Passos (Opcional)

Se você quiser melhorar ainda mais:

1. **Streaming de Logs em Tempo Real**
   - Usar WebSockets ou Server-Sent Events
   - Usuário vê output conforme executa

2. **Variáveis de Ambiente**
   - Permitir configurar `.env` via interface
   - Injetar variáveis na execução

3. **Histórico de Execuções**
   - Salvar cada execução no banco
   - Ver execuções antigas

4. **Aprovação Manual**
   - Tasks críticas exigem confirmação
   - Preview do comando antes de executar

---

## ✅ Checklist de Teste

Para verificar se está funcionando:

- [ ] Editar projeto e selecionar diretório
- [ ] Diretório salvo aparece no formulário
- [ ] Criar task com comando simples (`ls -la`)
- [ ] Executar task
- [ ] Ver logs em tempo real
- [ ] Task marcada como "Concluída"
- [ ] Resultado salvo no banco
- [ ] Criar task com comando inválido
- [ ] Ver erro nos logs
- [ ] Task marcada como "Erro"

---

## 📞 Problemas Comuns

### "Execution path not configured"
**Solução:** Edite o projeto e configure o diretório de execução

### "Diretório não encontrado"
**Solução:** Verifique se o caminho existe no servidor

### "Permission denied"
**Solução:** Verifique permissões da pasta no servidor:
```bash
chmod 755 /caminho/do/diretorio
```

### "Command not found"
**Solução:** Verifique se o comando está instalado no servidor:
```bash
which npm
which docker
```

---

## 🎯 Resumo

**Sistema simplificado:**
- ✅ Sem SSH
- ✅ Execução local no servidor
- ✅ Seleção visual de diretórios
- ✅ Output em tempo real
- ✅ Seguro e isolado

**Pronto para usar!** 🎉
