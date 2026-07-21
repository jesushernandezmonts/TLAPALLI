import * as XLSX from 'xlsx';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseNombreCompleto(nombreCompleto: string) {
  const clean = nombreCompleto.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');

  if (parts.length === 1) {
    return { nombre: parts[0], apellidoPaterno: '', apellidoMaterno: null };
  }
  if (parts.length === 2) {
    return { nombre: parts[0], apellidoPaterno: parts[1], apellidoMaterno: null };
  }
  if (parts.length === 3) {
    return { nombre: parts[0], apellidoPaterno: parts[1], apellidoMaterno: parts[2] };
  }

  const lowerParts = parts.map((p) => p.toLowerCase());

  if (parts.length === 4) {
    if (lowerParts[2] === 'de' || lowerParts[2] === 'del') {
      return {
        nombre: parts.slice(0, 2).join(' '),
        apellidoPaterno: parts[2] + ' ' + parts[3],
        apellidoMaterno: null,
      };
    }
    return {
      nombre: parts.slice(0, 2).join(' '),
      apellidoPaterno: parts[2],
      apellidoMaterno: parts[3],
    };
  }

  if (clean.includes(' de la ')) {
    const idx = clean.indexOf(' de la ');
    const firstPart = clean.substring(0, idx).trim().split(' ');
    const prep = clean.substring(idx).trim();
    if (firstPart.length >= 3) {
      return {
        nombre: firstPart.slice(0, -1).join(' '),
        apellidoPaterno: firstPart[firstPart.length - 1],
        apellidoMaterno: prep,
      };
    }
  }

  if (clean.includes(' de ')) {
    const idx = clean.indexOf(' de ');
    const firstPart = clean.substring(0, idx).trim().split(' ');
    const prep = clean.substring(idx).trim();
    if (firstPart.length >= 3) {
      return {
        nombre: firstPart.slice(0, -1).join(' '),
        apellidoPaterno: firstPart[firstPart.length - 1],
        apellidoMaterno: prep,
      };
    }
  }

  return {
    nombre: parts.slice(0, parts.length - 2).join(' '),
    apellidoPaterno: parts[parts.length - 2],
    apellidoMaterno: parts[parts.length - 1],
  };
}

function getTallerId(tallerStr: string): number | null {
  const norm = tallerStr.toLowerCase().trim();
  if (norm.includes('ballet')) return 14; // Ballet
  if (norm.includes('dibujo') || norm.includes('pintura')) return 6; // Dibujo y Pintura
  if (norm.includes('artes') || norm.includes('plasica')) return 7; // Artes Plásticas
  if (norm.includes('piano')) return 4; // Piano 1
  if (norm.includes('k pop') || norm.includes('k-pop')) return 13; // Danza K-pop
  if (norm.includes('guitarra')) return 2; // Guitarra
  if (norm.includes('contemporan')) return 18; // Danza Contemporanea
  if (norm.includes('coreografia')) {
    if (norm.includes('piano')) return 4; // Piano 1
    if (norm.includes('cancelado')) return null; // skip canceled
    return 13; // fallback to Danza K-pop / Coreografía
  }
  return null;
}

function parseFechaNacimientoFromEdad(edadStr: string): Date | null {
  const edadNum = parseInt(edadStr, 10);
  if (isNaN(edadNum) || edadNum <= 0 || edadNum > 100) return null;
  const currentYear = 2026;
  const birthYear = currentYear - edadNum;
  return new Date(`${birthYear}-01-01`);
}

async function runImport(dryRun = true) {
  const filePath = path.join(process.cwd(), 'Registro Alumnos Verano 2026 (1).xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  console.log(`=== MODO DRY-RUN: ${dryRun} ===`);

  let alumnosCreados = 0;
  let alumnosExistentes = 0;
  let inscripcionesCreadas = 0;
  let inscripcionesOmitidas = 0;

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[3]) continue;

    const nombreRaw = row[3].toString().trim();
    if (nombreRaw === 'Nombre del  Alumno' || nombreRaw === 'Nombre del Alumno') continue;

    const folio = row[2]?.toString().trim() || '';
    const tel = row[4]?.toString().trim() || null;
    const edadStr = row[5]?.toString().trim() || '';
    const tallerStr = row[6]?.toString().trim() || '';
    const horarioStr = row[7]?.toString().trim() || '';
    const obsStr = row[8]?.toString().trim() || '';

    const { nombre, apellidoPaterno, apellidoMaterno } = parseNombreCompleto(nombreRaw);
    const fechaNacimiento = parseFechaNacimientoFromEdad(edadStr);
    const tallerId = getTallerId(tallerStr);

    console.log(`Fila ${i + 1}: ${nombre} ${apellidoPaterno} ${apellidoMaterno || ''} | Tel: ${tel} | TallerID: ${tallerId} (${tallerStr})`);

    if (!tallerId) {
      console.log(`  -> OMITIDO: Taller no reconocido o cancelado (${tallerStr})`);
      inscripcionesOmitidas++;
      continue;
    }

    let alumnoId: number;

    // Buscar si ya existe por nombre completo
    const existing = await prisma.alumno.findFirst({
      where: {
        nombre: { equals: nombre, mode: 'insensitive' },
        apellidoPaterno: { equals: apellidoPaterno, mode: 'insensitive' },
        ...(apellidoMaterno
          ? { apellidoMaterno: { equals: apellidoMaterno, mode: 'insensitive' } }
          : {}),
      },
    });

    if (existing) {
      alumnoId = existing.id;
      alumnosExistentes++;
      console.log(`  -> Alumno ya existe con ID ${alumnoId}`);
    } else {
      if (!dryRun) {
        const created = await prisma.alumno.create({
          data: {
            nombre,
            apellidoPaterno,
            apellidoMaterno: apellidoMaterno || null,
            telefono: tel || null,
            fechaNacimiento,
            padecimientos: obsStr ? `Observaciones: ${obsStr}` : null,
            estatusActivo: true,
          },
        });
        alumnoId = created.id;
        console.log(`  -> Creado Alumno ID ${alumnoId}`);
      } else {
        alumnoId = 9999;
        console.log(`  -> (Simulado) Crearía Alumno: ${nombre} ${apellidoPaterno}`);
      }
      alumnosCreados++;
    }

    // Verificar si ya tiene inscripcion en ese taller para Verano 2026
    if (!dryRun) {
      const existingInsc = await prisma.inscripcion.findFirst({
        where: {
          alumnoId,
          tallerId,
          periodo: 'verano',
          anio: 2026,
        },
      });

      if (!existingInsc) {
        await prisma.inscripcion.create({
          data: {
            alumnoId,
            tallerId,
            periodo: 'verano',
            anio: 2026,
            estatusPago: 'pendiente',
          },
        });
        inscripcionesCreadas++;
        console.log(`  -> Inscripción creada en taller ${tallerId}`);
      } else {
        console.log(`  -> Ya estaba inscrito en taller ${tallerId}`);
      }
    } else {
      inscripcionesCreadas++;
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`Alumnos nuevos a crear: ${alumnosCreados}`);
  console.log(`Alumnos existentes reutilizados: ${alumnosExistentes}`);
  console.log(`Inscripciones a registrar (Verano 2026): ${inscripcionesCreadas}`);
  console.log(`Inscripciones omitidas/canceladas: ${inscripcionesOmitidas}`);
}

const isExecute = process.argv.includes('--execute');
runImport(!isExecute)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
