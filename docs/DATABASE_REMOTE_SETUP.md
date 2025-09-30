# Configuração de Banco de Dados Remoto PostgreSQL

## 📋 Visão Geral

Este documento descreve a configuração do banco de dados PostgreSQL remoto para o projeto.

## 🔧 Configurações Realizadas

### 1. Atualização do Schema Prisma

**Arquivo:** `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"  # Alterado de "sqlite" para "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Atualização das Variáveis de Ambiente

#### Arquivo `.env` (Desenvolvimento)
```env
DATABASE_URL=postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable
```

#### Arquivo `.env.production` (Produção)
```env
DATABASE_URL="postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable"
```

#### Arquivo `.env.docker` (Docker)
```env
DATABASE_URL="postgres://postgres:90e907c02b1910266cb1@cloud.nommand.com:54342/desk?sslmode=disable"
```

### 3. Atualização do Dockerfile

**Arquivo:** `Dockerfile`

- Removida a criação do diretório `/app/data` (não necessário para banco remoto)
- Removida a variável de ambiente `DATABASE_URL` padrão (agora configurada via Easy Panel)

### 4. Atualização da Documentação

#### Arquivo: `docs/DEPLOY_DOCKER_EASYPANEL.md`
- Atualizadas as variáveis de ambiente para usar o PostgreSQL remoto
- Removida a necessidade do volume para o banco de dados local
- Atualizadas as instruções de solução de problemas

#### Arquivo: `docs/DEPLOY_PRODUCAO.md`
- Atualizada a descrição do stack para usar PostgreSQL
- Atualizadas todas as variáveis de ambiente de exemplo
- Reescrita a seção de configuração de banco de dados

## 🚀 Comandos Executados

```bash
# Push do schema para o banco de dados remoto
npm run db:push

# Geração do Prisma client
npm run db:generate

# Verificação de código
npm run lint
```

## 📊 Estrutura do Banco de Dados

O banco de dados remoto contém as seguintes tabelas:

- **Account** - Contas de autenticação OAuth
- **Session** - Sessões de usuário
- **VerificationToken** - Tokens de verificação
- **Token** - Tokens diversos (recuperação de senha)
- **User** - Usuários do sistema
- **Project** - Projetos
- **Task** - Tarefas
- **TaskTodo** - Itens de checklist das tarefas
- **Requirement** - Requisitos
- **RequirementTask** - Relacionamento entre requisitos e tarefas
- **HistorySummary** - Histórico de resumos
- **ProjectFavorite** - Projetos favoritos
- **Tag** - Tags
- **ProjectTag** - Relacionamento entre projetos e tags
- **ProjectHistory** - Histórico de alterações
- **Notification** - Notificações

## 🔒 Segurança

### Configurações de Segurança
- **SSL Mode**: `disable` (configurado conforme necessidade do ambiente)
- **Credenciais**: Armazenadas em variáveis de ambiente
- **Conexão**: Direta com o banco de dados remoto

### Boas Práticas
1. Nunca commitar credenciais no repositório
2. Usar variáveis de ambiente para configurações sensíveis
3. Manter o Prisma schema atualizado
4. Realizar backups regulares do banco de dados

## 🚀 Deploy

### Easy Panel
1. Configurar as variáveis de ambiente no Easy Panel
2. Usar o Dockerfile atualizado
3. Não é necessário volume para o banco de dados (é remoto)

### Outras Plataformas
- Atualizar as variáveis de ambiente conforme a plataforma
- Garantir conectividade com o banco de dados remoto
- Configurar firewall se necessário

## 🛠️ Solução de Problemas

### Erros Comuns

#### 1. Conexão com Banco de Dados
```bash
# Verificar conectividade
telnet cloud.nommand.com 54342

# Testar conexão com psql
psql -h cloud.nommand.com -p 54342 -U postgres -d desk
```

#### 2. Prisma Schema
```bash
# Validar schema
npx prisma validate

# Recriar banco de dados (se necessário)
npx prisma db push --force-reset
```

#### 3. Migrations
```bash
# Verificar status das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name nome_da_migration
```

## 📈 Performance

### Vantagens do PostgreSQL Remoto
- **Escalabilidade**: Banco de dados dedicado
- **Performance**: Melhor performance que SQLite
- **Confiabilidade**: Backup e manutenção profissional
- **Segurança**: Configurações avançadas de segurança

### Otimizações
- Índices configurados no schema
- Consultas otimizadas pelo Prisma
- Conexão direta sem intermediários

## 🔮 Próximos Passos

1. **Monitoramento**: Configurar monitoramento do banco de dados
2. **Backup**: Implementar estratégia de backup automático
3. **Performance**: Monitorar e otimizar consultas lentas
4. **Segurança**: Revisar configurações de segurança do banco

---

## ✅ Resumo

O projeto foi configurado com sucesso para usar um banco de dados PostgreSQL remoto:

- ✅ Schema Prisma atualizado
- ✅ Variáveis de ambiente configuradas
- ✅ Dockerfile otimizado
- ✅ Documentação atualizada
- ✅ Conexão testada
- ✅ Prisma client gerado

O sistema está pronto para deploy com o banco de dados remoto!