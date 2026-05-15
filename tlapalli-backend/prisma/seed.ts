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

  // --- TALLERES 2026 ---
  const talleres = [
    // Música
    { nombreTaller: 'Canto', costoMensual: 250, cupoMaximo: 20, horarioDescripcion: 'Martes y Jueves 5:00 - 7:00 pm' },
    { nombreTaller: 'Guitarra', costoMensual: 250, cupoMaximo: 20, horarioDescripcion: 'Martes y Jueves 4:00 - 6:00 pm' },
    { nombreTaller: 'Violín', costoMensual: 250, cupoMaximo: 20, horarioDescripcion: 'Martes y Jueves 4:00 - 6:00 pm' },
    { nombreTaller: 'Piano 1', costoMensual: 250, cupoMaximo: 15, horarioDescripcion: 'Lunes y Jueves (Inicial 4-5, Intermedio 5-6, Avanzado 6-7)' },
    { nombreTaller: 'Piano 2', costoMensual: 250, cupoMaximo: 15, horarioDescripcion: 'Martes 5-7pm, Sábado 1-3pm' },
    
    // Artes Visuales y Plásticas
    { nombreTaller: 'Dibujo y Pintura', costoMensual: 320, cupoMaximo: 25, horarioDescripcion: 'Lunes y Miércoles 4:00 - 6:00 pm' },
    { nombreTaller: 'Artes Plásticas', costoMensual: 300, cupoMaximo: 25, horarioDescripcion: 'Mar y Jue (3-5pm niños 5-7 años, 5-7pm niños 8+)' },
    
    // Danza
    { nombreTaller: 'Danza Polinesia', costoMensual: 250, cupoMaximo: 30, horarioDescripcion: 'Mat: Mar-Jue 11-12. Ves: Lun-Mie-Vie (Inf 4-5, Juv 5-6). Adu: Vie 5-6, Sab 1:30-3' },
    { nombreTaller: 'Ritmos Latinos', costoMensual: 250, cupoMaximo: 40, horarioDescripcion: 'Ini: Mie-Vie 6-8pm. Int: Lun-Mar-Jue 6-8pm' },
    { nombreTaller: 'Flamenco', costoMensual: 350, cupoMaximo: 20, horarioDescripcion: 'Lun-Vie 7:00 - 8:00 pm, Sab 12:00 - 2:00 pm' },
    { nombreTaller: 'Danza Regional', costoMensual: 250, cupoMaximo: 30, horarioDescripcion: 'Lunes, Miércoles y Viernes 6:00 - 8:00 pm' },
    { nombreTaller: 'Danza Oriental', costoMensual: 250, cupoMaximo: 20, horarioDescripcion: 'Sábado 10:00 am - 12:00 pm' },
    { nombreTaller: 'Danza K-pop', costoMensual: 250, cupoMaximo: 25, horarioDescripcion: 'Inf: Mar-Jue 4-5:30, Sab 1-2. Juv: Lun-Vie 4-6, Sab 11-1' },
    { nombreTaller: 'Ballet', costoMensual: 350, cupoMaximo: 20, horarioDescripcion: 'G-A (3-6a): Vie 3:30-5, Sab 10-11:30. G-B (7-14a): Vie 5-6:30, Sab 11:30-1' },
    
    // Artes Escénicas
    { nombreTaller: 'Teatro', costoMensual: 250, cupoMaximo: 25, horarioDescripcion: 'Cía Cervantes: Lun-Mie-Vie 5:30-7. Cía Vacío: Sab 12:30-2' },
    
    // Lectura
    { nombreTaller: 'Lectura Cuentacuentos', costoMensual: 100, cupoMaximo: 20, horarioDescripcion: 'Martes y Jueves 4:00 - 6:00 pm' },
    
    // Yoga
    { nombreTaller: 'Yoga', costoMensual: 250, cupoMaximo: 20, horarioDescripcion: 'Lunes y Miércoles 11:00 am - 12:30 pm' },
  ];

  for (const t of talleres) {
    await prisma.taller.upsert({
      where: { nombreTaller: t.nombreTaller },
      update: t,
      create: t,
    });
  }

  console.log('✅ Datos de prueba actualizados');
  console.log('   Admin: admin@tlapalli.com / Admin2025');
  console.log('   Profesor: juan@email.com / Juan2025');
  console.log(`   Talleres creados: ${talleres.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
