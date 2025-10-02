# Task Executor - Guia Rápido 🚀

## Acesso Rápido

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar executor
http://localhost:3000/project/[ID_DO_PROJETO]/executor
```

## 🎯 Funcionalidades Principais

### 1. Configurar API URL (Opcional)
- Campo: **API URL**
- Função: Endpoint para executar tasks
- Exemplo: `https://api.example.com/execute`
- Ação: Clique em **Salvar** após inserir

### 2. Buscar Tasks
- Botão: **🔍 Buscar Tasks**
- Função: Atualiza lista de tasks pendentes
- Resultado: Tabela populada com tasks

### 3. Adicionar Task Rápida
- Botão: **➕ Adicionar Task**
- Campos obrigatórios:
  - **Título**: Nome da task
  - **Guidance Prompt**: Instruções da task
- Campos opcionais:
  - **Descrição**
  - **Informações Adicionais**

### 4. Selecionar Tasks
- **Checkbox na tabela**: Selecionar tasks específicas
- **Checkbox no header**: Selecionar/desselecionar todas
- Sem seleção = executa todas

### 5. Executar Tasks
- Botão: **▶ Executar (N)**
  - N = número de tasks a executar
- Estado: Desabilitado se sem tasks
- Resultado: Execução inicia

### 6. Acompanhar Execução

**Logs em Tempo Real**
- Terminal com cores
- Filtros por nível: info, success, warning, error, debug
- Busca no conteúdo
- Auto-scroll

**Barra de Progresso**
- Percentual de conclusão
- Task atual
- Estatísticas:
  - ✅ Sucessos
  - ❌ Falhas
  - ⏭️ Puladas
  - ⏱️ Duração

### 7. Parar Execução
- Botão: **⏹ Parar**
- Função: Interrompe execução
- Estado: Habilitado apenas durante execução

### 8. Exportar Logs
- Botão: **📥** (na seção de logs)
- Formato: `.txt`
- Nome: `execution-[ID]-logs.txt`

### 9. Copiar Logs
- Botão: **📋** (na seção de logs)
- Função: Copia logs filtrados para clipboard

### 10. Limpar Logs
- Botão: **🗑️** (na seção de logs)
- Função: Remove todos os logs da tela

## 🎵 Sistema de Som

**Botão Flutuante** (canto inferior direito)
- 🔊 = Som ativo
- 🔇 = Som desativado

**Sons Disponíveis**
- ✅ **Sucesso**: Toque ascendente (C-E-G)
- ❌ **Erro**: Toque descendente (G-C)
- ⚠️ **Aviso**: Toque duplo (D-D)
- ℹ️ **Info**: Toque único (A)

## 🎨 Interface

### Status da Execução

| Badge | Significado |
|-------|-------------|
| ⚪ **Pronto** | Idle, aguardando |
| 🟡 **Preparando** | Inicializando |
| 🔵 **Executando** | Em andamento |
| 🟢 **Concluído** | Finalizado com sucesso |
| 🔴 **Erro** | Finalizado com erros |
| 🟠 **Parado** | Interrompido pelo usuário |

### Indicadores de Task

| Ícone | Status |
|-------|--------|
| 🕐 | Pendente |
| ⚙️ | Executando |
| ✅ | Concluída |
| ❌ | Erro |

## 📱 Responsividade

- **Desktop**: Layout completo com todas as features
- **Tablet**: Layout adaptado, componentes empilhados
- **Mobile**: Interface otimizada, scroll vertical

## ⌨️ Atalhos de Teclado (Planejado)

```
Ctrl+R  - Buscar tasks
Ctrl+N  - Nova task
Ctrl+E  - Executar
Ctrl+S  - Parar
Ctrl+L  - Limpar logs
```

## 🔄 Auto-Refresh

- **Execução**: Atualiza a cada 2 segundos
- **Tasks**: Manual (botão Buscar)
- **Status**: Em tempo real

## 📊 Interpretando Logs

**Cores dos Logs**
- 🔵 **Azul** (info): Informações gerais
- 🟢 **Verde** (success): Operações bem-sucedidas
- 🟡 **Amarelo** (warning): Avisos
- 🔴 **Vermelho** (error): Erros
- ⚪ **Cinza** (debug): Informações de debug

**Formato do Log**
```
[HH:MM:SS.mmm] [LEVEL] Mensagem [Task #ID]
```

## 🐛 Troubleshooting

### Tasks não aparecem
- Verifique se há tasks com status "Pendente"
- Clique em "Buscar Tasks"
- Verifique conexão com banco de dados

### Execução não inicia
- Verifique se há tasks selecionadas
- Verifique API URL (se configurada)
- Veja logs de erro

### Logs não atualizam
- Auto-refresh está ativo?
- Execução está rodando?
- Verifique console do navegador

### Sons não tocam
- Botão de som está ativado? (🔊)
- Volume do navegador está alto?
- Permissões de áudio concedidas?

## 💡 Dicas

1. **Performance**: Limite de 1000 linhas de log
2. **Filtros**: Use filtros para focar em erros
3. **Seleção**: Ctrl+Click para seleção múltipla
4. **Export**: Exporte logs antes de limpar
5. **API URL**: Salve antes de executar

## 🔗 Navegação

```
/project/[id]           → Detalhes do projeto
/project/[id]/executor  → Task Executor
/task/[id]              → Detalhes da task
/                       → Dashboard
```

## 📞 Suporte

Em caso de problemas:
1. Verifique console do navegador (F12)
2. Verifique logs do servidor
3. Consulte documentação completa: `EXECUTOR_IMPLEMENTATION.md`

---

**Versão**: 1.0.0 (Phase 1)
**Última Atualização**: 2025-10-02
