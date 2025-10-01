# Sistema de Gerenciamento de Projetos

Um sistema completo de gerenciamento de projetos desenvolvido com Next.js 15, TypeScript, Prisma e shadcn/ui.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visão geral com estatísticas, gráficos e análises
- **Gestão de Projetos**: Crie, edite e acompanhe projetos com progresso e prioridades
- **Gestão de Tarefas**: Sistema completo de tarefas com todos e checklists
- **Gestão de Requisitos**: Controle de requisitos funcionais e não funcionais
- **Notificações Inteligentes**: Sistema de notificações com dropdown e página dedicada
- **Atualizações em Tempo Real**: WebSocket para atualizações instantâneas
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos
- **Autenticação**: Sistema de login seguro com NextAuth.js

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilização**: Tailwind CSS, shadcn/ui
- **Banco de Dados**: SQLite (desenvolvimento), PostgreSQL (produção)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Real-time**: Socket.IO
- **Estado**: Zustand, TanStack Query
- **Formulários**: React Hook Form, Zod
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📦 Instalação Rápida

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd nome-do-projeto
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

4. **Configure o banco de dados**
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx seed-user.ts
   npx tsx seed.ts
   ```

5. **Inicie o servidor**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   Abra `http://localhost:3000` no seu navegador.

   **Credenciais de demonstração:**
   - Email: `admin@demo.com`
   - Senha: `demo123`

## 📚 Documentação

### Desenvolvimento Local
Para instruções detalhadas sobre como configurar o ambiente de desenvolvimento, consulte:
- [Documentação de Desenvolvimento Local](docs/DESENVOLVIMENTO_LOCAL.md)

### Deploy em Produção
Para instruções completas sobre como fazer deploy em produção, consulte:
- [Documentação de Deploy em Produção](docs/DEPLOY_PRODUCAO.md)

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas da API
│   ├── api/               # Rotas da API REST
│   ├── auth/              # Páginas de autenticação
│   ├── notifications/     # Sistema de notificações
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (shadcn/ui)
│   ├── dashboard.tsx     # Dashboard principal
│   ├── notification-*.tsx # Componentes de notificação
│   └── */*.tsx           # Outros componentes
├── lib/                  # Bibliotecas e utilitários
│   ├── auth.ts          # Configuração NextAuth
│   ├── db.ts            # Conexão com banco de dados
│   └── types.ts         # Tipos TypeScript
├── hooks/               # Hooks personalizados
└── prisma/              # Schema e migrations do Prisma
```

## 🎯 Principais Componentes

### Dashboard
- **Visão Geral**: Estatísticas em cards, gráficos de progresso
- **Análise**: Gráficos detalhados de projetos, tarefas e requisitos
- **Performance**: Métricas de produtividade e eficiência
- **Projetos**: Lista filtrável de projetos com cards interativos

### Sistema de Notificações
- **Dropdown no Header**: Acesso rápido às notificações recentes
- **Página Dedicada**: Gerenciamento completo em `/notifications`
- **Filtros Avançados**: Por prioridade, tipo, status e busca
- **Ações Rápidas**: Marcar como lido, marcar todas como lidas

### Gestão de Projetos
- **CRUD Completo**: Criar, ler, atualizar e deletar projetos
- **Progresso Visual**: Barra de progresso e status
- **Prioridades**: Sistema de prioridades com cores
- **Favoritos**: Marcar projetos como favoritos
- **Tags**: Sistema de tags organizacionais

### Gestão de Tarefas
- **Todos System**: Checklist para cada tarefa
- **Status Tracking**: Pendente, Em Progresso, Concluída, Bloqueado
- **Requisitos Associados**: Vincular tarefas a requisitos
- **Histórico**: Acompanhamento de alterações

### Gestão de Requisitos
- **Tipos**: Funcionais e Não Funcionais
- **Categorias**: Organização por categorias
- **Prioridades**: Alta, Média, Baixa
- **Vinculação**: Associar a projetos e tarefas

## 🗄️ Banco de Dados

### Schema Principal
- **Users**: Usuários do sistema
- **Projects**: Projetos com metadados
- **Tasks**: Tarefas com todos e status
- **Requirements**: Requisitos funcionais e não funcionais
- **Notifications**: Sistema de notificações
- **Tags**: Sistema de tags organizacionais

### Migrations
O projeto usa Prisma Migrations para controle de versão do schema:

```bash
# Criar nova migration
npx prisma migrate dev --name nome-da-migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Visualizar banco de dados
npx prisma studio
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Verificar código com ESLint
```

### Banco de Dados
```bash
npx prisma studio    # Abrir Prisma Studio
npx prisma db push   # Sincronizar schema com banco
npx prisma generate  # Gerar Prisma Client
npx prisma migrate   # Gerenciar migrations
```

### Seeds
```bash
npx tsx seed-user.ts        # Criar usuário admin
npx tsx seed.ts             # Popular com dados de exemplo
npx tsx seed-notifications.ts # Criar notificações
```

## 🌐 API Endpoints

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/[id]` - Obter projeto específico
- `PUT /api/projects/[id]` - Atualizar projeto
- `DELETE /api/projects/[id]` - Deletar projeto

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `GET /api/tasks/[id]` - Obter tarefa específica
- `PUT /api/tasks/[id]` - Atualizar tarefa
- `DELETE /api/tasks/[id]` - Deletar tarefa

### Requisitos
- `GET /api/requirements` - Listar requisitos
- `POST /api/requirements` - Criar requisito
- `GET /api/requirements/[id]` - Obter requisito específico
- `PUT /api/requirements/[id]` - Atualizar requisito
- `DELETE /api/requirements/[id]` - Deletar requisito

### Notificações
- `GET /api/notifications` - Listar notificações
- `POST /api/notifications/mark-read` - Marcar como lidas

## 🎨 UI/UX

### Design System
- **Cores**: Paleta baseada no Tailwind CSS
- **Componentes**: shadcn/ui para consistência
- **Responsividade**: Mobile-first design
- **Acessibilidade**: ARIA labels e navegação por teclado

### Temas
- **Light Mode**: Tema claro padrão
- **Dark Mode**: Tema escuro automático
- **System Theme**: Segue preferência do sistema

## 🔒 Segurança

### Autenticação
- **NextAuth.js**: Sistema de autenticação completo
- **JWT**: Tokens seguros para sessões
- **Providers**: Suporte para múltiplos providers
- **Session Management**: Gerenciamento seguro de sessões

### Validação
- **Zod**: Validação de schemas
- **TypeScript**: Tipagem estática segura
- **Prisma**: Validação no nível do banco
- **React Hook Form**: Validação de formulários

## 🚀 Deploy

### Plataformas Suportadas
- **Vercel** (Recomendado)
- **Netlify**
- **DigitalOcean App Platform**
- **AWS (EC2, ECS)**
- **Docker**

### Configuração de Produção
1. Configure as variáveis de ambiente de produção
2. Migre para PostgreSQL (recomendado)
3. Configure SSL e domínio
4. Configure monitoramento e backups
5. Teste o ambiente de produção

Consulte a [Documentação de Deploy em Produção](docs/DEPLOY_PRODUCAO.md) para instruções detalhadas.

## 🤝 Contribuição

### Fluxo de Trabalho
1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: add nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Convenções
- Use mensagens de commit semânticas
- Siga o padrão de código existente
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Consulte a documentação nas pastas `docs/`
2. Verifique os issues existentes no GitHub
3. Crie um novo issue com detalhes do problema
4. Entre em contato com a equipe de desenvolvimento

## 📊 Roadmap

### Próximas Funcionalidades
- [ ] Relatórios avançados e exportação
- [ ] Sistema de permissões e roles
- [ ] Integração com GitHub/GitLab
- [ ] Sistema de comentários e menções
- [ ] Kanban board para tarefas
- [ ] Calendário e timeline
- [ ] API pública para integrações
- [ ] Mobile app (React Native)

### Melhorias Planejadas
- [ ] Performance optimizations
- [ ] Offline support
- [ ] Advanced search
- [ ] Custom dashboards
- [ ] Email notifications
- [ ] Webhooks
- [ ] Internationalization (i18n)

---

**Desenvolvido com ❤️ usando tecnologias modernas e melhores práticas.**