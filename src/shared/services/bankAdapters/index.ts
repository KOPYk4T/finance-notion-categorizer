import type { BankAdapter } from './types';
import { FalabellaAdapter } from './FalabellaAdapter';
import { SantanderAdapter } from './SantanderAdapter';

/**
 * Registro de todos los adapters disponibles
 * Para agregar un nuevo banco, simplemente:
 * 1. Crear una clase que implemente BankAdapter
 * 2. Agregarla a este array
 */
export const BANK_ADAPTERS: BankAdapter[] = [
  new FalabellaAdapter(),
  new SantanderAdapter(),
];

export { FalabellaAdapter, SantanderAdapter };
export type { BankAdapter, ParsedTransaction, ParseExcelResult } from './types';
