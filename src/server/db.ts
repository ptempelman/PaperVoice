// import { Client } from "@planetscale/database";
// import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
// import { PrismaClient } from "@prisma/client";

// import { env } from "~/env";

// const psClient = new Client({ url: env.DATABASE_URL });

// const createPrismaClient = () =>
//   new PrismaClient({
//     log:
//       env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//     adapter: new PrismaPlanetScale(psClient),
//   });

// const globalForPrisma = globalThis as unknown as {
//   prisma: ReturnType<typeof createPrismaClient> | undefined;
// };

// export const db = globalForPrisma.prisma ?? createPrismaClient();

// if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;


import { PrismaClient } from '@prisma/client';
import { env } from '~/env';


let prisma: PrismaClient;

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export const db = prisma;
