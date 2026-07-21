import * as XLSX from 'xlsx';
import * as path from 'path';

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

  // Handle 4 or more words (compounds like "de Fermin", "de la Fuente", "de Gante")
  // Check for prepositions in last words
  const lowerParts = parts.map(p => p.toLowerCase());
  
  if (parts.length === 4) {
    // Check if 3rd/4th form a preposition phrase like "de Fermin" or "de Gante"
    if (lowerParts[2] === 'de' || lowerParts[2] === 'del') {
      return {
        nombre: parts.slice(0, 2).join(' '),
        apellidoPaterno: parts[2] + ' ' + parts[3],
        apellidoMaterno: null,
      };
    }
    // Default 4 words: 2 first names, 1 paterno, 1 materno
    return {
      nombre: parts.slice(0, 2).join(' '),
      apellidoPaterno: parts[2],
      apellidoMaterno: parts[3],
    };
  }

  // 5+ words: e.g. "Antia Karina Montiel de la Fuente" or "Joana DanahÍ López de Gante"
  // Find where last name begins or prepositions occur
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

const filePath = path.join(process.cwd(), 'Registro Alumnos Verano 2026 (1).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

console.log('--- PRUEBA DE PARSEO DE NOMBRES ---');
rawData.slice(1).forEach((row) => {
  if (!row || !row[3]) return;
  const rawNombre = row[3].toString().trim();
  if (rawNombre === 'Nombre del  Alumno') return;
  const parsed = parseNombreCompleto(rawNombre);
  console.log(`Original: "${rawNombre}" -> Nombre: "${parsed.nombre}" | Paterno: "${parsed.apellidoPaterno}" | Materno: "${parsed.apellidoMaterno}"`);
});
