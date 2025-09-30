# Documentação - Desenvolvimento Local

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- SQLite (já incluído no projeto)

## Passo a Passo para Subir o Projeto Localmente

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd nome-do-projeto
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Outras variáveis conforme necessário
```

### 4. Configurar o Banco de Dados

O projeto usa SQLite, então não é necessário instalar um banco de dados separado.

#### 4.1. Gerar Prisma Client

```bash
npx prisma generate
```

#### 4.2. Rodar Migrations

```bash
npx prisma db push
```

#### 4.3. Popular o Banco com Dados de Exemplo

```bash
# Criar usuário de demonstração
npx tsx seed-user.ts

# Popular com projetos, tarefas e requisitos
npx tsx seed.ts

# Popular com notificações de exemplo
npx tsx seed-notifications.ts
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### 6. Acessar a Aplicação

Abra seu navegador e acesse `http://localhost:3000`

#### Credenciais de Demonstração
- **Email**: admin@demo.com
- **Senha**: demo123

### 7. Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas da API
│   ├── api/               # Rotas da API
│   ├── auth/              # Autenticação
│   ├── notifications/     # Página de notificações
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (shadcn/ui)
│   ├── dashboard.tsx     # Dashboard principal
│   ├── notification-*.tsx # Componentes de notificação
│   └── ...
├── lib/                  # Bibliotecas e utilitários
│   ├── auth.ts          # Configuração NextAuth
│   ├── db.ts            # Conexão com banco de dados
│   └── types.ts         # Tipos TypeScript
└── hooks/               # Hooks personalizados
```

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Verificar código com ESLint
```

### Banco de Dados
```bash
npx prisma studio    # Abrir Prisma Studio (visualizar banco)
npx prisma db push   # Sincronizar schema com banco
npx prisma generate  # Gerar Prisma Client
```

### Seeds
```bash
npx tsx seed-user.ts        # Criar usuário admin
npx tsx seed.ts             # Popular com dados de exemplo
npx tsx seed-notifications.ts # Criar notificações de exemplo
```

## Configuração de Desenvolvimento

### Variáveis de Ambiente Desenvolvimento

```env
# .env.development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-not-for-production"
NODE_ENV="development"
```

### Hot Reload
O projeto suporta hot reload para:
- Componentes React
- Páginas
- Estilos
- Arquivos de configuração

### Debug
Para debugar a aplicação:

1. **Console do Navegador**: Abra o DevTools e veja o console
2. **Logs do Servidor**: Os logs aparecem no terminal onde você rodou `npm run dev`
3. **Network**: Verifique as requisições de rede na aba Network do DevTools

## Troubleshooting Comum

### Problema: "Erro ao carregar os dados"
**Solução**: 
1. Verifique se o banco de dados foi populado: `npx tsx seed.ts`
2. Verifique as variáveis de ambiente no arquivo `.env`
3. Reinicie o servidor: `Ctrl+C` e `npm run dev`

### Problema: "Prisma Client não encontrado"
**Solução**: 
```bash
npx prisma generate
```

### Problema: "Module not found"
**Solução**: 
```bash
npm install
```

### Problema: "Porta 3000 já está em uso"
**Solução**: 
1. Mate o processo na porta 3000: `lsof -ti:3000 | xargs kill -9`
2. Ou use outra porta: `PORT=3001 npm run dev`

### Problema: "Erro de permissão"
**Solução**: 
```bash
chmod +x seed*.ts
```

## Fluxo de Desenvolvimento

### 1. Criar Nova Feature
```bash
# Criar nova branch
git checkout -b feature/nova-feature

# Fazer alterações
# Testar localmente

# Commitar mudanças
git add .
git commit -m "feat: add nova feature"

# Enviar para repositório
git push origin feature/nova-feature
```

### 2. Testes
Antes de enviar para produção, verifique:
```bash
npm run lint        # Verificar código
npm run build       # Testar build
npm run start       # Testar servidor de produção
```

### 3. Banco de Dados Local
O SQLite cria um arquivo `dev.db` na raiz do projeto. Você pode:
- Visualizar com `npx prisma studio`
- Excluir para recomeçar: `rm dev.db`
- Fazer backup: `cp dev.db backup.db`

## Recursos Disponíveis

### Dashboard
- **Visão Geral**: Estatísticas e gráficos
- **Análise**: Análises detalhadas
- **Performance**: Métricas de performance
- **Projetos**: Lista e gerenciamento de projetos

### Notificações
- Dropdown no header com notificações recentes
- Página completa em `/notifications`
- Filtros por prioridade, tipo e status
- Marcar como lido/não lido

### API Endpoints
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `GET /api/requirements` - Listar requisitos
- `POST /api/requirements` - Criar requisito
- `GET /api/notifications` - Listar notificações
- `POST /api/notifications/mark-read` - Marcar notificações como lidas

## Integração com VS Code

### Extensões Recomendadas
- Prisma
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer

### Configuração de Debug
Crie um arquivo `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Verifique o console do navegador
3. Consulte esta documentação
4. Abra uma issue no repositório