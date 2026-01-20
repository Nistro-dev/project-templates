import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { logger } from '../src/utils/logger.js'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const hashedPassword = await bcrypt.hash('password123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
    },
  })

  logger.info('Seed completed')
}

main()
  .catch((e) => {
    logger.error({ error: e }, 'Seed failed')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })