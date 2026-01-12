import type { Transaction } from "../../shared/types";
import { formatMoney } from "../../shared/utils";
import { categories } from "../../shared/constants/categories";
import { Button } from "../../components/Button";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onTransactionClick?: (index: number) => void;
  onCategoryChange?: (index: number, category: string) => void;
  onRecurringChange?: (index: number, isRecurring: boolean) => void;
  onUploadClick?: () => void;
  isUploading?: boolean;
}

export const SummaryModal = ({
  isOpen,
  onClose,
  transactions,
  onTransactionClick,
  onCategoryChange,
  onRecurringChange,
  onUploadClick,
  isUploading = false,
}: SummaryModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-neutral-50/50 to-white flex-shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-neutral-900">Resumen</h2>
            <p className="text-sm text-neutral-500 font-medium">
              {transactions.length} transacciones
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-lg cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm z-10">
                <tr className="border-b border-neutral-200">
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Recurrente
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    IA
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => {
                  const category =
                    transaction.selectedCategory ||
                    transaction.suggestedCategory;
                  const isAICategorized =
                    transaction.confidence === "low" ||
                    transaction.confidence === "ai";

                  return (
                    <tr
                      key={`${transaction.id}-${index}`}
                      className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors duration-150
                        ${index % 2 === 0 ? "bg-white" : "bg-neutral-50/30"}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-neutral-600 whitespace-nowrap">
                        {transaction.date}
                      </td>
                      <td 
                        className="px-6 py-4 text-sm font-medium text-neutral-900"
                        onClick={() => {
                          if (onTransactionClick) {
                            onTransactionClick(index);
                            onClose();
                          }
                        }}
                        style={onTransactionClick ? { cursor: "pointer" } : undefined}
                      >
                        <div className="truncate max-w-md" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium tabular-nums text-right whitespace-nowrap ${
                          transaction.type === "cargo"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.type === "cargo" ? "-" : "+"}
                        {formatMoney(transaction.amount)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {onCategoryChange ? (
                          <select
                            value={category}
                            onChange={(e) => onCategoryChange(index, e.target.value)}
                            className="appearance-none bg-neutral-50 border border-neutral-200 rounded-lg 
                                     px-3 py-1.5 text-xs font-medium text-neutral-700
                                     focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-0 focus:border-transparent
                                     cursor-pointer transition-all duration-200 
                                     hover:bg-neutral-100 hover:border-neutral-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full">
                            {category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {onRecurringChange ? (
                          <label className="inline-flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={transaction.isRecurring || false}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onRecurringChange(index, e.target.checked);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 peer-focus:ring-offset-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
                            </div>
                          </label>
                        ) : transaction.isRecurring ? (
                          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                            Sí
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isAICategorized ? (
                          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
                            IA
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {onUploadClick && (
          <div className="px-6 py-5 border-t border-neutral-200 flex items-center justify-end bg-neutral-50/30 flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={onUploadClick}
              disabled={isUploading || transactions.length === 0}
              className="px-8 text-base disabled:hover:scale-100"
            >
              {isUploading ? "Subiendo a Notion..." : "Publicar en Notion"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

