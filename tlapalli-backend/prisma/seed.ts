import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);

  const adminHash = await bcrypt.hash('Admin2025', salt);
  const profHash = await bcrypt.hash('Juan2025', salt);

  // Admin Jesús
  await prisma.usuario.upsert({
    where: { email: 'jesushernandezmonts@gmail.com' },
    update: { nombre: 'Jesús Hernández', rol: 'admin' },
    create: {
      nombre: 'Jesús Hernández',
      email: 'jesushernandezmonts@gmail.com',
      passwordHash: 'GOOGLE_AUTH',
      rol: 'admin',
    },
  });

  // Admin Carlos (existente)
  await prisma.usuario.upsert({
    where: { email: 'admin@tlapalli.com' },
    update: { passwordHash: adminHash, nombre: 'Carlos Admin', rol: 'admin' },
    create: {
      nombre: 'Carlos Admin',
      email: 'admin@tlapalli.com',
      passwordHash: adminHash,
      rol: 'admin',
    },
  });

  // Profesor de prueba
  await prisma.usuario.upsert({
    where: { email: 'juan@email.com' },
    update: { passwordHash: profHash, nombre: 'Juan García' },
    create: {
      nombre: 'Juan García',
      email: 'juan@email.com',
      passwordHash: profHash,
      rol: 'profesor',
    },
  });

  // Crea algunos alumnos
  await prisma.alumno.upsert({
    where: { curp: 'GOPM050526MDFXXX01' },
    update: {},
    create: {
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Pérez',
      curp: 'GOPM050526MDFXXX01',
      telefono: '5551234567',
    },
  });

  // Crea un taller
  await prisma.taller.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombreTaller: 'Danza Folklórica',
      costoMensual: 350.00,
      cupoMaximo: 30,
      horarioDescripcion: 'Lunes y Miércoles 16:00–18:00',
    },
  });

  console.log('✅ Datos de prueba actualizados');
  console.log('   Admin: admin@tlapalli.com / Admin2025');
  console.log('   Profesor: juan@email.com / Juan2025');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
