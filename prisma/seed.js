const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER SEQUENCE "Character_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Ranking_id_seq" RESTART WITH 1`;
  // Clear existing data
  await prisma.character.deleteMany({});
  await prisma.ranking.deleteMany({});

  await prisma.character.createMany({
    data: [
      {
        name: "Pirate flag",
        xStart: 581,
        xEnd: 622,
        yStart: 10,
        yEnd: 49,
      },
      {
        name: "Blue guy",
        xStart: 431,
        xEnd: 460,
        yStart: 20,
        yEnd: 70,
      },
      {
        name: "Captain Hook",
        xStart: 749,
        xEnd: 791,
        yStart: 263,
        yEnd: 331,
      },
    ],
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
