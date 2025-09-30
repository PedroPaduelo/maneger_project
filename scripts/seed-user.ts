import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const user = await db.user.create({
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

  console.log('Test user created:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })