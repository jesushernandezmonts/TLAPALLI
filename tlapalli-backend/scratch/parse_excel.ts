import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'Registro Alumnos Verano 2026 (1).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

console.log('--- REPORTE DE FILAS EXCEL ---');
console.log(`Total de filas encontradas: ${rawData.length}`);

rawData.forEach((row, idx) => {
  if (!row || row.length === 0) return;
  const num = row[0]?.toString().trim() || '';
  const fecha = row[1]?.toString().trim() || '';
  const folio = row[2]?.toString().trim() || '';
  const nombre = row[3]?.toString().trim() || '';
  const tel = row[4]?.toString().trim() || '';
  const edad = row[5]?.toString().trim() || '';
  const taller = row[6]?.toString().trim() || '';
  const horario = row[7]?.toString().trim() || '';
  const obs = row[8]?.toString().trim() || '';

  console.log(`[Fila ${idx + 1}] Num: ${num} | Folio: ${folio} | Nombre: ${nombre} | Tel: ${tel} | Edad: ${edad} | Taller: ${taller} | Horario: ${horario} | Obs: ${obs}`);
});
