import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import type { BankAdapter, ParsedTransaction } from './types';

export class SantanderAdapter implements BankAdapter {
  readonly bankName = 'Banco Santander';

  detect(workbook: WorkBook): boolean {
    try {
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (data.length < 10) return false;

      // Santander tiene "Banco Santander" en la primera fila
      const firstRow = data[0];
      if (Array.isArray(firstRow)) {
        const firstCell = String(firstRow[0] || '').trim();
        if (firstCell === 'Banco Santander') {
          return true;
        }
      }

      // Buscar el header típico de Santander en las primeras 25 filas
      for (let i = 0; i < Math.min(25, data.length); i++) {
        const row = data[i];
        if (!Array.isArray(row)) continue;

        const normalizedRow = row.map((cell) =>
          String(cell || '').trim().toLowerCase()
        );

        const hasTransactionHeaders =
          normalizedRow.includes('fecha') &&
          normalizedRow.includes('descripción') &&
          normalizedRow.includes('cheques y otros cargos') &&
          normalizedRow.includes('depositos y otros abonos');

        if (hasTransactionHeaders) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  parse(workbook: WorkBook): ParsedTransaction[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Encontrar la fila de headers
    let headerRowIndex = -1;
    let fechaIdx = -1;
    let descripcionIdx = -1;
    let cargosIdx = -1;
    let abonosIdx = -1;

    for (let i = 0; i < Math.min(25, data.length); i++) {
      const row = data[i];
      if (!Array.isArray(row)) continue;

      const normalizedRow = row.map((cell) =>
        String(cell || '').trim().toLowerCase()
      );

      fechaIdx = normalizedRow.indexOf('fecha');
      descripcionIdx = normalizedRow.findIndex((cell) =>
        cell && cell.includes('descripción')
      );
      cargosIdx = normalizedRow.findIndex((cell) =>
        cell && cell.includes('cheques y otros cargos')
      );
      abonosIdx = normalizedRow.findIndex((cell) =>
        cell && cell.includes('depositos y otros abonos')
      );

      if (
        fechaIdx !== -1 &&
        descripcionIdx !== -1 &&
        cargosIdx !== -1 &&
        abonosIdx !== -1
      ) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(
        'No se encontraron los headers de transacciones en el archivo de Santander'
      );
    }

    // Extraer año del período (buscar "Hasta DD/MM/YYYY")
    let year = new Date().getFullYear();
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (!Array.isArray(row)) continue;

      for (const cell of row) {
        const cellStr = String(cell || '');
        // Buscar patrón DD/MM/YYYY
        const dateMatch = cellStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
          year = parseInt(dateMatch[3], 10);
          break;
        }
      }
      if (year !== new Date().getFullYear()) break;
    }

    const transactions: ParsedTransaction[] = [];

    // Parsear transacciones (empezar después del header)
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const fecha = row[fechaIdx];
      const descripcion = row[descripcionIdx];
      const cargo = row[cargosIdx];
      const abono = row[abonosIdx];

      if (!fecha || !descripcion) continue;

      // Limpiar y parsear montos (Santander usa números directos)
      const cargoNum = this.parseAmount(cargo);
      const abonoNum = this.parseAmount(abono);

      let amount: number;
      let type: 'cargo' | 'abono';

      // Cargos = Gastos, Abonos = Ingresos
      if (cargoNum > 0) {
        amount = cargoNum;
        type = 'cargo';
      } else if (abonoNum > 0) {
        amount = abonoNum;
        type = 'abono';
      } else {
        continue;
      }

      const cleanDescription = String(descripcion)
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();

      const normalizedDate = this.normalizeDate(String(fecha), year);

      transactions.push({
        date: normalizedDate,
        description: cleanDescription,
        amount,
        type,
      });
    }

    return transactions;
  }

  private parseAmount(value: any): number {
    if (value === null || value === undefined || value === '') return 0;

    // Si es número directo
    if (typeof value === 'number') return value;

    // Si es string
    const str = String(value).trim();
    if (str === '') return 0;

    // Remover caracteres no numéricos excepto punto y coma
    const cleaned = str.replace(/[^0-9.,-]/g, '');
    if (cleaned === '') return 0;

    // Parsear
    const parsed = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }

  private normalizeDate(dateStr: string, year: number): string {
    // Santander usa formato DD/MM (sin año)
    const ddmmMatch = dateStr.match(/^(\d{2})\/(\d{2})$/);
    if (ddmmMatch) {
      const day = ddmmMatch[1];
      const month = ddmmMatch[2];
      return `${day}/${month}/${year}`;
    }

    // Formato completo DD/MM/YYYY
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }

    // Formato DD-MM-YYYY
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return dateStr.replace(/-/g, '/');
    }

    // Intentar parsear como fecha
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const fullYear = date.getFullYear();
        return `${day}/${month}/${fullYear}`;
      }
    } catch {
      // Ignorar
    }

    return dateStr;
  }
}
