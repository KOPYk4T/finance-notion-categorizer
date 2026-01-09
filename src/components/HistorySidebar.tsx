import { motion, AnimatePresence } from "motion/react";
import { X, RotateCcw, History } from "lucide-react";
import type { Transaction } from "../shared/types";
import { formatMoney } from "../shared/utils";

interface HistorySidebarProps {
  isOpen: boolean;
  deletedTransactions: Transaction[];
  onClose: () => void;
  onRestore: (index: number) => void;
}

export const HistorySidebar = ({
  isOpen,
  deletedTransactions,
  onClose,
  onRestore,
}: HistorySidebarProps) => {
  // Ordenar transacciones eliminadas por fecha (más antigua primero)
  const sortedDeletedTransactions = [...deletedTransactions].sort((a, b) => {
    const parseDate = (dateStr: string): number => {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
      return 0;
    };

    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    return dateA - dateB; // Más antigua primero
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay invisible para cerrar al hacer click afuera */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[512px] bg-white border-l border-neutral-200 shadow-2xl z-50 flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-200 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-900 rounded-lg">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Historial de eliminados
                </h2>
                <p className="text-sm text-neutral-500">
                  {sortedDeletedTransactions.length}{" "}
                  {sortedDeletedTransactions.length === 1
                    ? "transacción"
                    : "transacciones"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-neutral-200 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Lista de transacciones eliminadas */}
          <div className="flex-1 overflow-y-auto">
            {sortedDeletedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 px-8">
                <div className="p-6 bg-neutral-100 rounded-full mb-4">
                  <History className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-base font-medium text-neutral-600 mb-1">
                  No hay transacciones eliminadas
                </p>
                <p className="text-sm text-center text-neutral-400">
                  Las transacciones que elimines aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {sortedDeletedTransactions.map((transaction, sortedIndex) => {
                  // Encontrar el índice original en el array no ordenado
                  const originalIndex = deletedTransactions.findIndex(
                    (t) => t.id === transaction.id
                  );

                  return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sortedIndex * 0.03 }}
                    className="group relative bg-white hover:bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-neutral-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Descripción y fecha */}
                        <div>
                          <p className="text-sm font-medium text-neutral-900 mb-0.5 line-clamp-1">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {transaction.date}
                          </p>
                        </div>

                        {/* Monto y categoría en una línea */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              transaction.type === "cargo"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transaction.type === "cargo" ? "-" : "+"}
                            {formatMoney(transaction.amount)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                              {transaction.selectedCategory ||
                                transaction.suggestedCategory}
                            </span>
                            {transaction.isRecurring && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                R
                              </span>
                            )}
                            {(transaction.confidence === "low" ||
                              transaction.confidence === "ai") && (
                              <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                                IA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón de restaurar */}
                      <button
                        onClick={() => onRestore(originalIndex)}
                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-white hover:bg-neutral-900 rounded-md transition-all duration-200 cursor-pointer"
                        title="Restaurar transacción"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer con info */}
          {sortedDeletedTransactions.length > 0 && (
            <div className="px-8 py-4 border-t border-neutral-200 bg-neutral-50/50">
              <p className="text-xs text-neutral-500 text-center">
                Las transacciones restauradas se ordenarán por fecha automáticamente
              </p>
            </div>
          )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
