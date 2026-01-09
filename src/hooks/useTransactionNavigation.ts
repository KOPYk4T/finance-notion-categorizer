import { useEffect, useState, useRef } from "react";
import type { Transaction } from "../shared/types";
import { parseBankStatementExcel } from "../shared/services/excelParser";
import {
  suggestCategory,
  detectRecurringTransaction,
} from "../shared/services/categorySuggestions";
import {
  categorizeBatchWithGroq,
  // TODO: Habilitar cuando queramos usar Gemini
  // categorizeBatchWithGemini,
  isGroqAvailable,
  // isGeminiAvailable,
  type BatchCategoryItem,
} from "../shared/services";

type Step = "upload" | "processing" | "categorize" | "complete";
type SlideDirection = "left" | "right";

interface UseTransactionNavigationReturn {
  step: Step;
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  currentIndex: number;
  slideDirection: SlideDirection;
  fileName: string;
  error: string | null;
  uploadedCount: number;
  handleFileSelect: (file: File) => void;
  handleCategoryChange: (index: number, category: string) => void;
  handleRecurringChange: (index: number, isRecurring: boolean) => void;
  handleDelete: (index: number) => void;
  handleRestore: (index: number) => void;
  handleMassDelete: (ids: number[]) => void;
  handleMassCategoryChange: (ids: number[], category: string) => void;
  handleMassRecurringChange: (ids: number[], isRecurring: boolean) => void;
  handleUploadSuccess: (uploadedCount: number) => void;
  goNext: () => void;
  goPrev: () => void;
  goToEnd: () => void;
  goToStart: () => void;
  goToIndex: (index: number) => void;
  reset: () => void;
  confirmReset: (onConfirm: () => void) => void;
  showConfirmReset: boolean;
  handleConfirmReset: () => void;
  handleCancelReset: () => void;
}

// Función para ordenar transacciones por fecha (más antigua primero)
const sortTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    // Parsear fechas en formato DD/MM/YYYY
    const parseDate = (dateStr: string): number => {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
      return 0;
    };

    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    // Orden ascendente (más antigua primero)
    return dateA - dateB;
  });
};

export const useTransactionNavigation = (): UseTransactionNavigationReturn => {
  const [step, setStep] = useState<Step>("upload");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("right");
  const [error, setError] = useState<string | null>(null);
  const [nextId, setNextId] = useState(1);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const pendingResetRef = useRef<(() => void) | null>(null);

  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setStep("processing");
    setError(null);

    try {
      const result = await parseBankStatementExcel(file);

      if (!result.success || result.transactions.length === 0) {
        setError(
          result.error ||
            "No se pudieron extraer transacciones del archivo Excel"
        );
        setStep("upload");
        return;
      }

      let idCounter = nextId;
      const convertedTransactions: Transaction[] = [];
      const transactionsNeedingAI: BatchCategoryItem[] = [];

      for (let i = 0; i < result.transactions.length; i++) {
        const t = result.transactions[i];
        const suggestion = suggestCategory(t.description, t.type);

        if (suggestion.confidence === "low" && isGroqAvailable()) {
          transactionsNeedingAI.push({
            description: t.description,
            transactionType: t.type,
            batchIndex: transactionsNeedingAI.length,
            originalIndex: i,
          });
        }

        const isRecurring = detectRecurringTransaction(t.description);

        convertedTransactions.push({
          id: idCounter++,
          description: t.description,
          amount: t.amount,
          date: t.date,
          type: t.type,
          suggestedCategory: suggestion.category,
          confidence: suggestion.confidence,
          selectedCategory: suggestion.category,
          isRecurring,
        });
      }

      if (transactionsNeedingAI.length > 0) {
        try {
          // TODO: En el futuro, podemos usar Gemini como alternativa o preferencia
          // if (isGeminiAvailable()) {
          //   try {
          //     aiResults = await categorizeBatchWithGemini(transactionsNeedingAI);
          //   } catch (geminiError) {
          //     console.warn("Error con Gemini, intentando con Groq:", geminiError);
          //     if (isGroqAvailable()) {
          //       aiResults = await categorizeBatchWithGroq(transactionsNeedingAI);
          //     } else {
          //       throw geminiError;
          //     }
          //   }
          // } else if (isGroqAvailable()) {
          //   aiResults = await categorizeBatchWithGroq(transactionsNeedingAI);
          // } else {
          //   throw new Error("No hay servicios AI disponibles");
          // }

          // Por ahora solo usamos Groq
          const aiResults = await categorizeBatchWithGroq(
            transactionsNeedingAI
          );

          for (const aiResult of aiResults) {
            const item = transactionsNeedingAI.find(
              (ai) => ai.batchIndex === aiResult.batchIndex
            );
            if (item) {
              const transactionIndex = item.originalIndex;
              const existingTransaction =
                convertedTransactions[transactionIndex];
              convertedTransactions[transactionIndex] = {
                ...existingTransaction,
                suggestedCategory: aiResult.category,
                confidence: "ai",
                selectedCategory: aiResult.category,
                isRecurring: existingTransaction.isRecurring,
              };
            }
          }
        } catch (error) {
          console.error("Error categorizando transacciones:", error);
        }
      }

      setNextId(idCounter);
      // Ordenar transacciones por fecha antes de mostrarlas
      setTransactions(sortTransactionsByDate(convertedTransactions));
      setStep("categorize");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar el archivo Excel"
      );
      setStep("upload");
    }
  };

  const handleCategoryChange = (index: number, category: string) => {
    setTransactions((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, selectedCategory: category } : t
      )
    );
  };

  const handleRecurringChange = (index: number, isRecurring: boolean) => {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, isRecurring } : t))
    );
  };

  const handleDelete = (index: number) => {
    setTransactions((prev) => {
      const deleted = prev[index];
      if (!deleted) return prev;

      setDeletedTransactions((prevDeleted) => {
        const exists = prevDeleted.some((t) => t.id === deleted.id);
        if (exists) {
          return prevDeleted;
        }
        return [...prevDeleted, deleted];
      });

      const newTransactions = prev.filter((_, i) => i !== index);

      if (newTransactions.length === 0) {
        setCurrentIndex(0);
      } else if (index >= newTransactions.length) {
        setCurrentIndex(newTransactions.length - 1);
      }

      return newTransactions;
    });
  };

  const handleRestore = (index: number) => {
    setDeletedTransactions((prev) => {
      const restored = prev[index];
      if (!restored) return prev;

      setTransactions((prevTransactions) => {
        const exists = prevTransactions.some((t) => t.id === restored.id);
        if (exists) {
          return prevTransactions;
        }

        // Guardar la transacción actual para mantener la vista
        const currentTransaction = prevTransactions[currentIndex];

        // Agregar la transacción restaurada y ordenar
        const updated = sortTransactionsByDate([...prevTransactions, restored]);

        // Encontrar el nuevo índice de la transacción actual
        if (currentTransaction) {
          const newIndex = updated.findIndex((t) => t.id === currentTransaction.id);
          if (newIndex !== -1) {
            setCurrentIndex(newIndex);
          }
        }

        setSlideDirection("right");
        setStep("categorize");
        return updated;
      });

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMassDelete = (ids: number[]) => {
    setTransactions((prev) => {
      // Guardar las transacciones eliminadas
      const toDelete = prev.filter((t) => ids.includes(t.id));

      setDeletedTransactions((prevDeleted) => {
        const newDeleted = [...prevDeleted];
        toDelete.forEach((deleted) => {
          if (!newDeleted.some((t) => t.id === deleted.id)) {
            newDeleted.push(deleted);
          }
        });
        return newDeleted;
      });

      // Filtrar las transacciones eliminadas
      const newTransactions = prev.filter((t) => !ids.includes(t.id));

      // Ajustar el índice actual si es necesario
      if (newTransactions.length === 0) {
        setCurrentIndex(0);
      } else if (currentIndex >= newTransactions.length) {
        setCurrentIndex(newTransactions.length - 1);
      }

      return newTransactions;
    });
  };

  const handleMassCategoryChange = (ids: number[], category: string) => {
    setTransactions((prev) => {
      return prev.map((t) =>
        ids.includes(t.id) ? { ...t, selectedCategory: category } : t
      );
    });
  };

  const handleMassRecurringChange = (ids: number[], isRecurring: boolean) => {
    setTransactions((prev) => {
      return prev.map((t) => (ids.includes(t.id) ? { ...t, isRecurring } : t));
    });
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < transactions.length - 1) {
        setSlideDirection("right");
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const goPrev = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        setSlideDirection("left");
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const goToEnd = () => {
    setCurrentIndex(transactions.length - 1);
    setSlideDirection("right");
  };

  const goToStart = () => {
    setCurrentIndex(0);
    setSlideDirection("right");
    setStep("categorize");
  };

  const reset = () => {
    setStep("upload");
    setTransactions([]);
    setDeletedTransactions([]);
    setCurrentIndex(0);
    setFileName("");
    setSlideDirection("right");
    setError(null);
    setNextId(1);
    setShowConfirmReset(false);
    pendingResetRef.current = null;
  };

  const confirmReset = (onConfirm: () => void) => {
    if (transactions.length > 0 || deletedTransactions.length > 0) {
      pendingResetRef.current = onConfirm;
      setShowConfirmReset(true);
    } else {
      onConfirm();
    }
  };

  const handleConfirmReset = () => {
    if (pendingResetRef.current) {
      pendingResetRef.current();
    }
    reset();
  };

  const handleCancelReset = () => {
    setShowConfirmReset(false);
    pendingResetRef.current = null;
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < transactions.length) {
      const direction = index > currentIndex ? "right" : "left";
      setSlideDirection(direction);
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    if (step !== "categorize") return;

    const jumpForward = (amount: number = 10) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = Math.min(prevIndex + amount, transactions.length - 1);
        setSlideDirection("right");
        return newIndex;
      });
    };

    const jumpBackward = (amount: number = 10) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = Math.max(prevIndex - amount, 0);
        setSlideDirection("left");
        return newIndex;
      });
    };

    const toggleRecurring = () => {
      if (transactions[currentIndex]) {
        const current = transactions[currentIndex];
        handleRecurringChange(currentIndex, !current.isRecurring);
      }
    };

    const goToIndexInEffect = (index: number) => {
      if (index >= 0 && index < transactions.length) {
        const direction = index > currentIndex ? "right" : "left";
        setSlideDirection(direction);
        setCurrentIndex(index);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Shift + Arrow for fast navigation
      if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        jumpForward(10);
        return;
      }
      if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        jumpBackward(10);
        return;
      }

      // Home/End keys
      if (e.key === "Home") {
        e.preventDefault();
        goToIndexInEffect(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        goToIndexInEffect(transactions.length - 1);
        return;
      }

      // R for toggle recurring
      if (
        (e.key === "r" || e.key === "R") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement) &&
        !(e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        e.preventDefault();
        toggleRecurring();
        return;
      }

      if (e.key === "ArrowRight") {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < transactions.length - 1) {
            setSlideDirection("right");
            return prevIndex + 1;
          }
          return prevIndex;
        });
        return;
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prevIndex) => {
          if (prevIndex > 0) {
            setSlideDirection("left");
            return prevIndex - 1;
          }
          return prevIndex;
        });
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        setTransactions((prev) => {
          const deleted = prev[currentIndex];
          if (!deleted) return prev;

          setDeletedTransactions((prevDeleted) => {
            const exists = prevDeleted.some((t) => t.id === deleted.id);
            if (exists) {
              return prevDeleted;
            }
            return [...prevDeleted, deleted];
          });

          const newTransactions = prev.filter((_, i) => i !== currentIndex);

          if (newTransactions.length === 0) {
            setCurrentIndex(0);
          } else if (currentIndex >= newTransactions.length) {
            setCurrentIndex(newTransactions.length - 1);
          }

          return newTransactions;
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    step,
    transactions.length,
    currentIndex,
    transactions,
    handleRecurringChange,
  ]);

  // Prevenir pérdida de progreso al cerrar/recargar
  useEffect(() => {
    const hasProgress =
      transactions.length > 0 || deletedTransactions.length > 0;
    const isProcessing = step === "categorize";

    if (!hasProgress || !isProcessing) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [transactions.length, deletedTransactions.length, step]);

  const handleUploadSuccess = (count: number) => {
    setUploadedCount(count);
    setStep("complete");
  };

  return {
    step,
    transactions,
    deletedTransactions,
    currentIndex,
    slideDirection,
    fileName,
    error,
    uploadedCount,
    handleFileSelect,
    handleCategoryChange,
    handleRecurringChange,
    handleDelete,
    handleRestore,
    handleMassDelete,
    handleMassCategoryChange,
    handleMassRecurringChange,
    handleUploadSuccess,
    goNext,
    goPrev,
    goToEnd,
    goToStart,
    goToIndex,
    reset,
    confirmReset,
    showConfirmReset,
    handleConfirmReset,
    handleCancelReset,
  };
};
