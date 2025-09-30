import { db } from "./src/lib/db";

async function seedNotifications() {
  try {
    // Create sample notifications
    const notifications = await Promise.all([
      db.notification.create({
        data: {
          userId: "system",
          type: "info",
          title: "Novo projeto criado",
          message: "O projeto 'Sistema de E-commerce' foi criado com sucesso.",
          projectId: 1,
          priority: "Média",
          metadata: {
            projectId: 1,
            action: "project_created"
          }
        }
      }),
      db.notification.create({
        data: {
          userId: "system",
          type: "warning",
          title: "Tarefa atrasada",
          message: "A tarefa 'Integrar gateway de pagamento' está atrasada.",
          projectId: 1,
          priority: "Alta",
          metadata: {
            projectId: 1,
            taskId: 3,
            action: "task_overdue"
          }
        }
      }),
      db.notification.create({
        data: {
          userId: "system",
          type: "success",
          title: "Tarefa concluída",
          message: "A tarefa 'Implementar sistema de autenticação' foi concluída.",
          projectId: 1,
          priority: "Média",
          isRead: true,
          readAt: new Date(),
          metadata: {
            projectId: 1,
            taskId: 1,
            action: "task_completed"
          }
        }
      }),
      db.notification.create({
        data: {
          userId: "system",
          type: "info",
          title: "Novo requisito adicionado",
          message: "Um novo requisito foi adicionado ao projeto 'Aplicativo Mobile'.",
          projectId: 2,
          priority: "Baixa",
          metadata: {
            projectId: 2,
            requirementId: 4,
            action: "requirement_added"
          }
        }
      }),
      db.notification.create({
        data: {
          userId: "system",
          type: "warning",
          title: "Projeto pausado",
          message: "O projeto 'API de Integração' foi pausado.",
          projectId: 3,
          priority: "Alta",
          metadata: {
            projectId: 3,
            action: "project_paused"
          }
        }
      })
    ]);

    console.log("Notifications seeded successfully!");
    console.log(`Created ${notifications.length} notifications`);

  } catch (error) {
    console.error("Error seeding notifications:", error);
  } finally {
    await db.$disconnect();
  }
}

seedNotifications();