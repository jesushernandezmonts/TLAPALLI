import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Generar hash real para "password123"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Crea usuario admin
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@sigetach.com' },
    update: {
      passwordHash: passwordHash
    },
    create: {
      nombre: 'Carlos Administrador',
      email: 'admin@sigetach.com',
      passwordHash: passwordHash,
      rol: 'admin',
    },
  });

  // Crea un profesor
  const profesor = await prisma.usuario.upsert({
    where: { email: 'profe@test.com' },
    update: {
      passwordHash: passwordHash
    },
    create: {
      nombre: 'Juan Profesor',
      email: 'profe@test.com',
      passwordHash: passwordHash,
      rol: 'profesor',
    },
  });

  // Crea algunos alumnos
  const alumno1 = await prisma.alumno.upsert({
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
  const taller1 = await prisma.taller.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombreTaller: 'Danza Folklórica',
      costoMensual: 350.00,
      cupoMaximo: 30,
      horarioDescripcion: 'Lunes y Miércoles 16:00–18:00',
    },
  });

  console.log('✅ Datos de prueba (Admin y Profesor) actualizados correctamente con password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
