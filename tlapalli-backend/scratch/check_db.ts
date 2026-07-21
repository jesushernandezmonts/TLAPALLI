import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const talleres = await prisma.taller.findMany();
  const alumnos = await prisma.alumno.count();
  console.log('Talleres existentes:', talleres);
  console.log('Total alumnos en DB:', alumnos);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
