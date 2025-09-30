import { db } from "./src/lib/db";

async function seed() {
  try {
    // Create sample projects
    const projects = await Promise.all([
      db.project.create({
        data: {
          name: "Sistema de E-commerce",
          description: "Plataforma completa de e-commerce com gerenciamento de produtos, pedidos e clientes",
          stack: "Next.js, React, TypeScript, Prisma, PostgreSQL",
          notes: "Projeto prioritário para Q1 2024",
          status: "Ativo",
          priority: "Alta",
          progress: 65,
          isFavorite: true,
          color: "#3b82f6",
          tags: JSON.stringify(["e-commerce", "web", "prioritário"]),
          metadata: {
            client: "TechCorp",
            deadline: "2024-03-31",
            budget: 50000
          }
        }
      }),
      db.project.create({
        data: {
          name: "Aplicativo Mobile",
          description: "Aplicativo mobile para gestão de tarefas e projetos",
          stack: "React Native, TypeScript, Firebase",
          notes: "Desenvolvimento cross-platform para iOS e Android",
          status: "Ativo",
          priority: "Média",
          progress: 30,
          isFavorite: false,
          color: "#10b981",
          tags: JSON.stringify(["mobile", "react-native", "gestão"]),
          metadata: {
            client: "StartupXYZ",
            deadline: "2024-06-30",
            budget: 35000
          }
        }
      }),
      db.project.create({
        data: {
          name: "API de Integração",
          description: "API RESTful para integração com sistemas terceiros",
          stack: "Node.js, Express, TypeScript, MongoDB",
          notes: "Documentação completa com Swagger",
          status: "Pausado",
          priority: "Baixa",
          progress: 15,
          isFavorite: false,
          color: "#f59e0b",
          tags: JSON.stringify(["api", "backend", "integration"]),
          metadata: {
            client: "Internal",
            deadline: "2024-09-30",
            budget: 25000
          }
        }
      })
    ]);

    // Create sample tasks for each project
    const tasks = await Promise.all([
      // Tasks for E-commerce project
      db.task.create({
        data: {
          title: "Implementar sistema de autenticação",
          guidancePrompt: "Criar sistema de login e registro com JWT",
          description: "Desenvolver módulo de autenticação com login, registro, recuperação de senha e gerenciamento de sessões",
          status: "Concluído",
          createdBy: "João Silva",
          updatedBy: "João Silva",
          projectId: projects[0].id,
          result: "Sistema de autenticação implementado com sucesso"
        }
      }),
      db.task.create({
        data: {
          title: "Desenvolver catálogo de produtos",
          guidancePrompt: "Criar interface para listagem e detalhes de produtos",
          description: "Implementar páginas de listagem de produtos, filtros, busca e página de detalhes do produto",
          status: "Em Progresso",
          createdBy: "Maria Santos",
          updatedBy: "Maria Santos",
          projectId: projects[0].id
        }
      }),
      db.task.create({
        data: {
          title: "Integrar gateway de pagamento",
          guidancePrompt: "Configurar integração com Stripe ou PayPal",
          description: "Implementar integração com gateway de pagamento para processamento de cartões e outros métodos",
          status: "Pendente",
          createdBy: "Pedro Oliveira",
          updatedBy: "Pedro Oliveira",
          projectId: projects[0].id
        }
      }),
      // Tasks for Mobile project
      db.task.create({
        data: {
          title: "Design da interface mobile",
          guidancePrompt: "Criar wireframes e mockups para o aplicativo",
          description: "Desenvolver o design da interface do aplicativo seguindo as melhores práticas de UX/UI",
          status: "Concluído",
          createdBy: "Ana Costa",
          updatedBy: "Ana Costa",
          projectId: projects[1].id,
          result: "Design finalizado e aprovado pelo cliente"
        }
      }),
      db.task.create({
        data: {
          title: "Implementar navegação entre telas",
          guidancePrompt: "Configurar React Navigation para navegação",
          description: "Implementar sistema de navegação entre as telas do aplicativo usando React Navigation",
          status: "Em Progresso",
          createdBy: "Carlos Mendes",
          updatedBy: "Carlos Mendes",
          projectId: projects[1].id
        }
      })
    ]);

    // Create sample requirements
    const requirements = await Promise.all([
      // Requirements for E-commerce project
      db.requirement.create({
        data: {
          title: "Sistema de busca avançada",
          description: "O sistema deve permitir busca por nome, categoria, preço e outros atributos dos produtos",
          type: "Funcional",
          category: "Busca",
          priority: "Alta",
          projectId: projects[0].id
        }
      }),
      db.requirement.create({
        data: {
          title: "Relatórios de vendas",
          description: "Gerar relatórios detalhados de vendas por período, produto e categoria",
          type: "Funcional",
          category: "Relatórios",
          priority: "Média",
          projectId: projects[0].id
        }
      }),
      db.requirement.create({
        data: {
          title: "Performance otimizada",
          description: "O sistema deve carregar páginas em menos de 3 segundos",
          type: "Não Funcional",
          category: "Performance",
          priority: "Alta",
          projectId: projects[0].id
        }
      }),
      // Requirements for Mobile project
      db.requirement.create({
        data: {
          title: "Sincronização offline",
          description: "O aplicativo deve funcionar offline e sincronizar dados quando houver conexão",
          type: "Funcional",
          category: "Sincronização",
          priority: "Alta",
          projectId: projects[1].id
        }
      }),
      db.requirement.create({
        data: {
          title: "Notificações push",
          description: "Enviar notificações push para lembretes de tarefas e atualizações",
          type: "Funcional",
          category: "Notificações",
          priority: "Média",
          projectId: projects[1].id
        }
      })
    ]);

    // Create some task todos
    const taskTodos = await Promise.all([
      db.taskTodo.create({
        data: {
          taskId: tasks[1].id, // "Desenvolver catálogo de produtos"
          description: "Criar componente de lista de produtos",
          isCompleted: true,
          sequence: 1
        }
      }),
      db.taskTodo.create({
        data: {
          taskId: tasks[1].id,
          description: "Implementar filtros por categoria",
          isCompleted: false,
          sequence: 2
        }
      }),
      db.taskTodo.create({
        data: {
          taskId: tasks[1].id,
          description: "Adicionar barra de busca",
          isCompleted: false,
          sequence: 3
        }
      }),
      db.taskTodo.create({
        data: {
          taskId: tasks[4].id, // "Implementar navegação entre telas"
          description: "Configurar Stack Navigator",
          isCompleted: true,
          sequence: 1
        }
      }),
      db.taskTodo.create({
        data: {
          taskId: tasks[4].id,
          description: "Implementar navegação por abas",
          isCompleted: false,
          sequence: 2
        }
      })
    ]);

    // Create some tags
    const tags = await Promise.all([
      db.tag.create({
        data: {
          name: "Frontend",
          color: "#3b82f6",
          description: "Tarefas relacionadas ao frontend"
        }
      }),
      db.tag.create({
        data: {
          name: "Backend",
          color: "#10b981",
          description: "Tarefas relacionadas ao backend"
        }
      }),
      db.tag.create({
        data: {
          name: "Urgente",
          color: "#ef4444",
          description: "Tarefas urgentes"
        }
      })
    ]);

    // Create project tags associations
    const projectTags = await Promise.all([
      db.projectTag.create({
        data: {
          projectId: projects[0].id,
          tagId: tags[0].id // Frontend
        }
      }),
      db.projectTag.create({
        data: {
          projectId: projects[0].id,
          tagId: tags[1].id // Backend
        }
      }),
      db.projectTag.create({
        data: {
          projectId: projects[1].id,
          tagId: tags[0].id // Frontend
        }
      })
    ]);

    console.log("Database seeded successfully!");
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${tasks.length} tasks`);
    console.log(`Created ${requirements.length} requirements`);
    console.log(`Created ${taskTodos.length} task todos`);
    console.log(`Created ${tags.length} tags`);
    console.log(`Created ${projectTags.length} project tags`);

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.$disconnect();
  }
}

seed();