import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

declare global {
  var prismaClient: PrismaClient | null;
}

export const prismaClient = globalThis.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalThis.prismaClient = prismaClient;
