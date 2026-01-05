import { useState } from "react";
import type { Transaction } from "../shared/types";
import {
  uploadTransactionsToNotion,
  isNotionConfigured,
} from "../shared/services/notionService";

interface UseNotionUploadReturn {
  isUploading: boolean;
  upload: (transactions: Transaction[], accountId?: string) => Promise<void>;
}

export const useNotionUpload = (): UseNotionUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (transactions: Transaction[], accountId?: string) => {
    if (!isNotionConfigured()) {
      throw new Error("Notion no está configurado. Verifica las variables de entorno.");
    }

    if (transactions.length === 0) {
      throw new Error("No hay transacciones para subir.");
    }

    setIsUploading(true);
    try {
      const result = await uploadTransactionsToNotion(transactions, accountId, () => {});

      if (!result.success) {
        throw new Error(
          `Se subieron ${result.uploaded} de ${transactions.length} transacciones. ${
            result.errors?.[0] || "Error desconocido"
          }`
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, upload };
};

