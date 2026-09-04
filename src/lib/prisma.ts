import { PrismaClient } from "@prisma/client";

// Ishlab chiqish rejimida hot-reload paytida ko'p ulanish yaratilmasligi uchun global keshlash
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
