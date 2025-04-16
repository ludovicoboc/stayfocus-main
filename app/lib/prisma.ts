import { PrismaClient } from '@prisma/client'

// Evita múltiplas instâncias do Prisma Client em desenvolvimento
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma