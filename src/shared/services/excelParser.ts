import * as XLSX from 'xlsx';
import { BANK_ADAPTERS } from './bankAdapters';
import type { ParseExcelResult } from './bankAdapters';

/**
 * Parser principal que auto-detecta el banco y usa el adapter correspondiente
 */
export async function parseBankStatementExcel(
  file: File
): Promise<ParseExcelResult> {
  try {
    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Auto-detectar el banco
    let detectedAdapter = null;

    for (const adapter of BANK_ADAPTERS) {
      if (adapter.detect(workbook)) {
        detectedAdapter = adapter;
        break;
      }
    }

    if (!detectedAdapter) {
      return {
        transactions: [],
        success: false,
        error:
          'No se pudo detectar el formato del archivo. Asegúrate de subir un archivo Excel de Banco Falabella o Banco Santander.',
      };
    }

    // Parsear usando el adapter detectado
    const transactions = detectedAdapter.parse(workbook);

    if (transactions.length === 0) {
      return {
        transactions: [],
        success: false,
        error: `No se encontraron transacciones válidas en el archivo de ${detectedAdapter.bankName}.`,
        detectedBank: detectedAdapter.bankName,
      };
    }

    return {
      transactions,
      success: true,
      detectedBank: detectedAdapter.bankName,
    };
  } catch (error) {
    return {
      transactions: [],
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al procesar el archivo Excel',
    };
  }
}

// Re-exportar tipos para mantener compatibilidad
export type { ParsedTransaction, ParseExcelResult } from './bankAdapters';
