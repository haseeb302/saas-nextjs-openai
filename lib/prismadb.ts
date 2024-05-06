import { PrismaClient } from "@prisma/client";

let prismadb: PrismaClient;
declare global {
  var prisma: PrismaClient;
}

if (process.env.NODE_ENV === "production") {
  prismadb = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prismadb = globalThis.prisma;
}

export default prismadb;
