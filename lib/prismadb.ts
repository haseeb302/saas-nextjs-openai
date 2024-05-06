import { PrismaClient } from "@prisma/client";

declare global {
  var prismadb: PrismaClient;
}

if (process.env.NODE_ENV === "production") {
  prismadb = new PrismaClient();
} else {
  if (!globalThis.prismadb) {
    globalThis.prismadb = new PrismaClient();
  }
  prismadb = globalThis.prismadb;
}

export default prismadb;
