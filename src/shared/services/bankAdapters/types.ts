import type { WorkBook } from 'xlsx';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'cargo' | 'abono';
}

export interface BankAdapter {
  /**
   * Nombre del banco para debugging/logging
   */
  readonly bankName: string;

  /**
   * Detecta si el archivo Excel corresponde a este banco
   * @param workbook - El workbook de XLSX parseado
   * @returns true si el formato coincide con este banco
   */
  detect(workbook: WorkBook): boolean;

  /**
   * Parsea las transacciones del workbook
   * @param workbook - El workbook de XLSX parseado
   * @returns Array de transacciones parseadas
   * @throws Error si no puede parsear el archivo
   */
  parse(workbook: WorkBook): ParsedTransaction[];
}

export interface ParseExcelResult {
  transactions: ParsedTransaction[];
  success: boolean;
  error?: string;
  detectedBank?: string;
}
