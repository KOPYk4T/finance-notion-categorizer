import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import type { BankAdapter, ParsedTransaction } from './types';

export class FalabellaAdapter implements BankAdapter {
  readonly bankName = 'Banco Falabella';

  detect(workbook: WorkBook): boolean {
    try {
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (data.length === 0) return false;

      const headers = data[0];
      if (!Array.isArray(headers)) return false;

      // Normalizar headers
      const normalizedHeaders = headers.map((h) =>
        String(h || '').trim().toLowerCase()
      );

      // Falabella tiene estos headers exactos en la primera fila
      const hasRequiredHeaders =
        normalizedHeaders.includes('fecha') &&
        normalizedHeaders.includes('descripcion') &&
        normalizedHeaders.includes('cargo') &&
        normalizedHeaders.includes('abono');

      return hasRequiredHeaders;
    } catch {
      return false;
    }
  }

  parse(workbook: WorkBook): ParsedTransaction[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const transactions: ParsedTransaction[] = [];
    const normalizeKey = (key: string) => key.trim().toLowerCase();

    for (const row of data) {
      const rowObj = row as Record<string, any>;
      const keys = Object.keys(rowObj);

      const normalizedRow: Record<string, any> = {};
      keys.forEach((key) => {
        normalizedRow[normalizeKey(key)] = rowObj[key];
      });

      const fecha = normalizedRow['fecha'] || normalizedRow['date'];
      const descripcion =
        normalizedRow['descripcion'] ||
        normalizedRow['descripción'] ||
        normalizedRow['description'];
      const cargo = normalizedRow['cargo'];
      const abono = normalizedRow['abono'];

      if (!fecha || !descripcion) {
        continue;
      }

      // Limpiar y parsear montos
      const cargoStr = String(cargo || '')
        .trim()
        .replace(/[^0-9.]/g, '');
      const abonoStr = String(abono || '')
        .trim()
        .replace(/[^0-9.]/g, '');

      const cargoNum = cargoStr
        ? parseFloat(cargoStr.replace(/\./g, '').replace(',', '.'))
        : 0;
      const abonoNum = abonoStr
        ? parseFloat(abonoStr.replace(/\./g, '').replace(',', '.'))
        : 0;

      let amount: number;
      let type: 'cargo' | 'abono';

      // Cargo = Gasto, Abono = Ingreso
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

      const normalizedDate = this.normalizeDate(String(fecha));

      transactions.push({
        date: normalizedDate,
        description: cleanDescription,
        amount,
        type,
      });
    }

    return transactions;
  }

  private normalizeDate(dateStr: string): string {
    // Formato DD-MM-YYYY o DD/MM/YYYY
    if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
      return dateStr.replace(/-/g, '/');
    }

    // Formato DD-MM-YY o DD/MM/YY
    if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{2}$/)) {
      const parts = dateStr.split(/[-/]/);
      const year = parseInt(parts[2], 10);
      const fullYear =
        year < 50
          ? `20${year.toString().padStart(2, '0')}`
          : `19${year.toString().padStart(2, '0')}`;
      return `${parts[0]}/${parts[1]}/${fullYear}`;
    }

    // Formato de fecha serial de Excel
    const excelDateNum = parseFloat(dateStr);
    if (!isNaN(excelDateNum) && excelDateNum > 1 && excelDateNum < 1000000) {
      const excelEpoch = new Date(1900, 0, 1);
      const days = excelDateNum - 2;
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Intentar parsear como fecha estándar
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {
      // Ignorar
    }

    return dateStr;
  }
}
