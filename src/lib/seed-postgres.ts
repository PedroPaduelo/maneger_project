import { prisma } from './db'
import bcrypt from 'bcryptjs'

export async function createTestUserPostgres() {
  try {
    // Verificar se já existe um usuário
    const existingUser = await prisma.user.findFirst({
      where: { email: 'developer@demo.com' }
    })

    if (existingUser) {
      console.log('Usuário de teste já existe no PostgreSQL:', existingUser.id)
      return existingUser
    }

    // Criar senha hash
    const hashedPassword = await bcrypt.hash('demo123', 10)

    // Criar usuário de teste com todos os campos necessários
    const user = await prisma.user.create({
      data: {
        email: 'developer@demo.com',
        password: hashedPassword,
        name: 'Developer Demo',
        fullName: 'Developer Demo',
        firstName: 'Developer',
        lastName: 'Demo',
        isActive: true,
        avatarUrl: null,
        dateOfBirth: null,
        emailVerified: new Date(),
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Usuário criado no PostgreSQL:', user.id, user.email)
    return user
  } catch (error) {
    console.error('Erro ao criar usuário no PostgreSQL:', error)
    throw error
  }
}

export async function createUserWithCreditsPostgres(userId: string) {
  try {
    // Criar créditos iniciais para o usuário
    const userCredit = await prisma.userCredit.upsert({
      where: { userId },
      update: {},
      create: {
        userId: userId,
        balance: 10.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Criar transação inicial
    await prisma.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        amount: 10.0,
        type: 'bonus',
        description: 'Bônus de boas-vindas',
        createdAt: new Date()
      }
    })

    console.log('Créditos criados para usuário PostgreSQL:', userId, 'saldo:', userCredit.balance)
    return userCredit
  } catch (error) {
      console.error('Erro ao criar créditos no PostgreSQL:', error)
      throw error
  }
}

// Função para rodar apenas uma vez
let seedExecuted = false
export async function seedDatabasePostgres() {
  if (seedExecuted) return
  seedExecuted = true

  try {
    // Criar usuário se não existir
    const user = await createTestUserPostgres()

    // Garantir que o usuário tenha créditos
    await createUserWithCreditsPostgres(user.id)

    console.log('Database seed PostgreSQL concluído com sucesso!')
  } catch (error) {
    console.error('Erro no seed do database PostgreSQL:', error)
  }
}