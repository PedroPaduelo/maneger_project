import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Starting database seeding...')

  // Clear existing data
  await db.projectHistory.deleteMany()
  await db.notification.deleteMany()
  await db.projectTag.deleteMany()
  await db.tag.deleteMany()
  await db.projectFavorite.deleteMany()
  await db.historySummary.deleteMany()
  await db.taskTodo.deleteMany()
  await db.requirementTask.deleteMany()
  await db.task.deleteMany()
  await db.requirement.deleteMany()
  await db.project.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.user.deleteMany()

  console.log('Cleared existing data')

  // Create users
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const adminUser = await db.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      fullName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      isActive: true,
    }
  })

  const developerUser = await db.user.create({
    data: {
      email: 'developer@demo.com',
      name: 'Developer User',
      fullName: 'Developer User',
      firstName: 'Developer',
      lastName: 'User',
      password: hashedPassword,
      isActive: true,
    }
  })

  console.log('Created users:', adminUser.email, developerUser.email)

  // Create projects
  const project1 = await db.project.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Development of a complete e-commerce platform with product catalog, shopping cart, and payment integration',
      stack: 'React, Node.js, PostgreSQL, Stripe',
      status: 'Ativo',
      priority: 'Alta',
      progress: 65,
      isFavorite: true,
      color: '#3b82f6',
      tags: 'frontend,backend,database',
      userId: adminUser.id,
    }
  })

  const project2 = await db.project.create({
    data: {
      name: 'Mobile App',
      description: 'Cross-platform mobile application for task management',
      stack: 'React Native, Firebase, TypeScript',
      status: 'Ativo',
      priority: 'Média',
      progress: 30,
      isFavorite: false,
      color: '#10b981',
      tags: 'mobile,frontend',
      userId: adminUser.id,
    }
  })

  const project3 = await db.project.create({
    data: {
      name: 'API Gateway',
      description: 'Microservices API gateway with authentication and rate limiting',
      stack: 'Go, Docker, Kubernetes, Redis',
      status: 'Em Andamento',
      priority: 'Crítica',
      progress: 80,
      isFavorite: true,
      color: '#f59e0b',
      tags: 'backend,devops',
      userId: developerUser.id,
    }
  })

  console.log('Created projects:', project1.name, project2.name, project3.name)

  // Create requirements for project 1
  const req1 = await db.requirement.create({
    data: {
      title: 'User Authentication',
      description: 'Implement secure user authentication with email/password and OAuth',
      type: 'Funcional',
      category: 'Security',
      priority: 'Alta',
      projectId: project1.id,
    }
  })

  const req2 = await db.requirement.create({
    data: {
      title: 'Product Catalog',
      description: 'Create product catalog with categories, search, and filtering',
      type: 'Funcional',
      category: 'Core Feature',
      priority: 'Alta',
      projectId: project1.id,
    }
  })

  const req3 = await db.requirement.create({
    data: {
      title: 'Payment Integration',
      description: 'Integrate Stripe payment processing',
      type: 'Funcional',
      category: 'Core Feature',
      priority: 'Alta',
      projectId: project1.id,
    }
  })

  console.log('Created requirements for project 1')

  // Create tasks for project 1
  const task1 = await db.task.create({
    data: {
      title: 'Set up authentication API',
      guidancePrompt: 'Create authentication endpoints for login, register, and password reset',
      description: 'Implement REST API endpoints for user authentication',
      status: 'Pendente',
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      projectId: project1.id,
      additionalInformation: 'Use JWT tokens and bcrypt for password hashing',
    }
  })

  const task2 = await db.task.create({
    data: {
      title: 'Create user registration form',
      guidancePrompt: 'Build a responsive registration form with validation',
      description: 'Frontend form for user registration',
      status: 'Em Progresso',
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      projectId: project1.id,
      result: 'Form UI created with validation, needs API integration',
    }
  })

  const task3 = await db.task.create({
    data: {
      title: 'Implement product database schema',
      guidancePrompt: 'Design and implement database schema for products, categories, and inventory',
      description: 'Create database tables for product catalog',
      status: 'Concluída',
      createdBy: developerUser.id,
      updatedBy: developerUser.id,
      projectId: project1.id,
      result: 'Database schema implemented with migrations',
    }
  })

  console.log('Created tasks for project 1')

  // Link tasks to requirements
  await db.requirementTask.createMany({
    data: [
      { taskId: task1.id, requirementId: req1.id },
      { taskId: task2.id, requirementId: req1.id },
      { taskId: task3.id, requirementId: req2.id },
    ]
  })

  // Create task todos
  await db.taskTodo.createMany({
    data: [
      {
        taskId: task1.id,
        description: 'Design API endpoints structure',
        isCompleted: true,
        sequence: 1,
      },
      {
        taskId: task1.id,
        description: 'Implement login endpoint',
        isCompleted: false,
        sequence: 2,
      },
      {
        taskId: task1.id,
        description: 'Implement registration endpoint',
        isCompleted: false,
        sequence: 3,
      },
      {
        taskId: task2.id,
        description: 'Create form component',
        isCompleted: true,
        sequence: 1,
      },
      {
        taskId: task2.id,
        description: 'Add form validation',
        isCompleted: true,
        sequence: 2,
      },
      {
        taskId: task2.id,
        description: 'Integrate with API',
        isCompleted: false,
        sequence: 3,
      },
    ]
  })

  console.log('Created task todos')

  // Create tags
  const tag1 = await db.tag.create({
    data: {
      name: 'frontend',
      color: '#3b82f6',
      description: 'Frontend development tasks',
    }
  })

  const tag2 = await db.tag.create({
    data: {
      name: 'backend',
      color: '#10b981',
      description: 'Backend development tasks',
    }
  })

  const tag3 = await db.tag.create({
    data: {
      name: 'urgent',
      color: '#ef4444',
      description: 'Urgent tasks',
    }
  })

  console.log('Created tags')

  // Link tags to projects
  await db.projectTag.createMany({
    data: [
      { projectId: project1.id, tagId: tag1.id },
      { projectId: project1.id, tagId: tag2.id },
      { projectId: project2.id, tagId: tag1.id },
      { projectId: project3.id, tagId: tag2.id },
      { projectId: project1.id, tagId: tag3.id },
    ]
  })

  // Create history summaries
  await db.historySummary.createMany({
    data: [
      {
        summary: '# Project Started\n\n- Initial setup completed\n- Team members assigned\n- Requirements gathered\n\n**Next steps**: Begin development of core features',
        projectId: project1.id,
        createdBy: adminUser.id,
      },
      {
        summary: '# Sprint 1 Completed\n\n- Authentication system designed\n- Database schema implemented\n- Frontend components created\n\n**Challenges**: Integration complexity\n\n**Next steps**: API integration',
        projectId: project1.id,
        createdBy: developerUser.id,
      },
    ]
  })

  console.log('Created history summaries')

  // Create notifications
  await db.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: Set up authentication API',
        priority: 'Alta',
        projectId: project1.id,
      },
      {
        userId: developerUser.id,
        type: 'project_update',
        title: 'Project Update',
        message: 'E-commerce Platform progress updated to 65%',
        priority: 'Média',
        projectId: project1.id,
      },
      {
        userId: adminUser.id,
        type: 'deadline_reminder',
        title: 'Deadline Reminder',
        message: 'Mobile App project deadline is approaching',
        priority: 'Alta',
        projectId: project2.id,
      },
    ]
  })

  console.log('Created notifications')

  // Create project favorites
  await db.projectFavorite.createMany({
    data: [
      { projectId: project1.id, userId: adminUser.id },
      { projectId: project3.id, userId: developerUser.id },
    ]
  })

  console.log('Created project favorites')

  // Create some project history
  await db.projectHistory.createMany({
    data: [
      {
        projectId: project1.id,
        action: 'created',
        entityType: 'project',
        entityId: project1.id,
        newValues: { name: project1.name, status: 'Ativo' },
        userId: adminUser.id,
        userName: 'Admin User',
        description: 'Project created',
      },
      {
        projectId: project1.id,
        action: 'created',
        entityType: 'task',
        entityId: task1.id,
        newValues: { title: task1.title, status: 'Pendente' },
        userId: adminUser.id,
        userName: 'Admin User',
        description: 'Task created: Set up authentication API',
      },
      {
        projectId: project1.id,
        action: 'updated',
        entityType: 'task',
        entityId: task2.id,
        oldValues: { status: 'Pendente' },
        newValues: { status: 'Em Progresso' },
        userId: adminUser.id,
        userName: 'Admin User',
        description: 'Task status updated to Em Progresso',
      },
    ]
  })

  console.log('Created project history')

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: 2`)
  console.log(`- Projects: 3`)
  console.log(`- Requirements: 3`)
  console.log(`- Tasks: 3`)
  console.log(`- Task Todos: 6`)
  console.log(`- Tags: 3`)
  console.log(`- Notifications: 3`)
  console.log(`- History Summaries: 2`)
  console.log(`- Project History: 3`)

  console.log('\n🔑 Login credentials:')
  console.log('Email: admin@demo.com')
  console.log('Password: demo123')
  console.log('\nEmail: developer@demo.com')
  console.log('Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })