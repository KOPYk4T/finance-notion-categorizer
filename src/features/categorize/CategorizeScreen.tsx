import { useState, useEffect, useRef, useCallback } from "react";
import type { Transaction } from "../../shared/types";
import { NavigationHeader } from "./NavigationHeader";
import { ProgressBar } from "./ProgressBar";
import { TransactionCard } from "./TransactionCard";
import { AIProgressBadge } from "./AIProgressBadge";
import { SearchModal } from "./SearchModal";
import { KeyboardHint } from "../../components/KeyboardHint";
import { MassEditModal } from "./MassEditModal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AddToNotionButton } from "../../components/AddToNotionButton";
import { HistoryButton } from "../../components/HistoryButton";
import { HistorySidebar } from "../../components/HistorySidebar";
import { categories } from "../../shared/constants/categories";
import { formatMoney } from "../../shared/utils";
import { AccountSelectorModal } from "../complete/AccountSelectorModal";
import { Button } from "../../components/Button";
import { Trash } from "../../components/icons";
import { TableSelect } from "../../components/TableSelect";
import { BrandHeader } from "../../components/BrandHeader";
import {
  uploadTransactionsToNotion,
  isNotionConfigured,
} from "../../shared/services/notionService";

interface CategorizeScreenProps {
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  currentIndex: number;
  slideDirection: "left" | "right";
  onCategoryChange: (index: number, category: string) => void;
  onRecurringChange: (index: number, isRecurring: boolean) => void;
  onDelete: (index: number) => void;
  onRestore: (index: number) => void;
  onMassDelete?: (ids: number[]) => void;
  onPrev: () => void;
  onNext: () => void;
  onGoToIndex: (index: number) => void;
  onMassCategoryChange?: (ids: number[], category: string) => void;
  onMassRecurringChange?: (ids: number[], isRecurring: boolean) => void;
  onMassTypeChange?: (ids: number[], type: "cargo" | "abono") => void;
  onTypeChange?: (index: number, type: "cargo" | "abono") => void;
  onUploadSuccess?: (uploadedCount: number) => void;
}

export const CategorizeScreen = ({
  transactions,
  deletedTransactions,
  currentIndex,
  slideDirection,
  onCategoryChange,
  onRecurringChange,
  onDelete,
  onRestore,
  onMassDelete,
  onPrev,
  onNext,
  onGoToIndex,
  onMassCategoryChange,
  onMassRecurringChange,
  onMassTypeChange,
  onTypeChange,
  onUploadSuccess,
}: CategorizeScreenProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [massEditIds, setMassEditIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"normal" | "table">(() => {
    const saved = localStorage.getItem("finance-categorizer-view-mode");
    return saved === "table" || saved === "normal" ? saved : "normal";
  });
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [reviewedTransactions, setReviewedTransactions] = useState<Set<number>>(
    new Set()
  );
  const [showUnreviewedAlert, setShowUnreviewedAlert] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const current = transactions[currentIndex];
  const progress = ((currentIndex + 1) / transactions.length) * 100;

  // Calcular transacciones con IA y cuántas están revisadas
  const aiTransactions = transactions.filter(
    (t) => t.confidence === "low" || t.confidence === "ai"
  );
  const aiReviewedCount = aiTransactions.filter((t) =>
    reviewedTransactions.has(t.id)
  ).length;

  // Guardar viewMode en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("finance-categorizer-view-mode", viewMode);
  }, [viewMode]);

  const handleCategoryChange = (category: string) => {
    onCategoryChange(currentIndex, category);
  };

  const handleRecurringChange = (isRecurring: boolean) => {
    onRecurringChange(currentIndex, isRecurring);
  };

  const handleTypeChange = (type: "cargo" | "abono") => {
    if (onTypeChange) {
      onTypeChange(currentIndex, type);
    }
  };

  // Marcar transacción como revisada cuando el usuario navega a ella (solo en vista normal)
  useEffect(() => {
    if (viewMode === "normal" && current) {
      setReviewedTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.add(current.id);
        return newSet;
      });
    }
  }, [currentIndex, viewMode, current]);

  const handleMassEdit = (ids: number[]) => {
    setMassEditIds(ids);
    setIsSearchOpen(false);
  };

  const handleMassDeleteFromSearch = (ids: number[]) => {
    if (onMassDelete) {
      onMassDelete(ids);
    }
    setIsSearchOpen(false);
  };

  const handleMassEditApply = (
    category?: string,
    isRecurring?: boolean,
    type?: "cargo" | "abono"
  ) => {
    if (category && onMassCategoryChange) {
      onMassCategoryChange(massEditIds, category);
    }
    if (isRecurring !== undefined && onMassRecurringChange) {
      onMassRecurringChange(massEditIds, isRecurring);
    }
    if (type && onMassTypeChange) {
      onMassTypeChange(massEditIds, type);
    }
    setMassEditIds([]);
  };

  const selectedTransactions = transactions.filter((t) =>
    massEditIds.includes(t.id)
  );

  const handleTableSelect = useCallback(
    (index: number) => {
      if (index < 0 || index >= transactions.length) return;

      const transactionId = transactions[index]?.id;
      if (!transactionId) return;

      setHighlightedIndex(index);

      setTimeout(() => {
        if (!tableRef.current) return;

        const row = tableRef.current.querySelector(
          `tr[data-transaction-id="${transactionId}"]`
        ) as HTMLTableRowElement | null;

        if (row) {
          row.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    },
    [transactions]
  );

  const handleUploadClick = useCallback(() => {
    if (!isNotionConfigured()) {
      alert("Notion no está configurado. Verifica las variables de entorno.");
      return;
    }

    if (transactions.length === 0) {
      alert("No hay transacciones para subir.");
      return;
    }

    if (viewMode === "normal") {
      const aiTransactions = transactions.filter(
        (t) =>
          (t.confidence === "low" || t.confidence === "ai") &&
          !reviewedTransactions.has(t.id)
      );

      if (aiTransactions.length > 0) {
        setPendingUpload(true);
        setShowUnreviewedAlert(true);
        return;
      }
    }

    setShowAccountSelector(true);
  }, [viewMode, transactions, reviewedTransactions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      if (e.key === "/" && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      if ((e.key === "v" || e.key === "V") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode((prev) => {
          const newMode = prev === "normal" ? "table" : "normal";
          localStorage.setItem("finance-categorizer-view-mode", newMode);
          return newMode;
        });
        return;
      }
      if (
        e.key === "Enter" &&
        currentIndex === transactions.length - 1 &&
        viewMode === "normal"
      ) {
        e.preventDefault();
        handleUploadClick();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSearchOpen,
    currentIndex,
    transactions.length,
    viewMode,
    handleUploadClick,
  ]);

  const handleUnreviewedConfirm = () => {
    setShowUnreviewedAlert(false);
    if (pendingUpload) {
      setPendingUpload(false);
      setShowAccountSelector(true);
    }
  };

  const handleUnreviewedCancel = () => {
    setShowUnreviewedAlert(false);
    setPendingUpload(false);
  };

  const handleAccountSelected = async (accountId?: string) => {
    setShowAccountSelector(false);

    if (!isNotionConfigured()) {
      alert("Notion no está configurado. Verifica las variables de entorno.");
      return;
    }

    if (transactions.length === 0) {
      alert("No hay transacciones para subir.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadTransactionsToNotion(
        transactions,
        accountId,
        () => {} // Progress callback - no needed here
      );

      if (result.success) {
        // Llamar al callback de éxito para redirigir a la pantalla de confeti
        if (onUploadSuccess) {
          onUploadSuccess(result.uploaded);
        } else {
          alert(`¡Éxito! ${result.uploaded} transacciones subidas a Notion.`);
        }
      } else {
        alert(
          `Se subieron ${result.uploaded} de ${
            transactions.length
          } transacciones. ${result.errors?.[0] || "Error desconocido"}`
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al subir a Notion");
    } finally {
      setIsUploading(false);
    }
  };

  // Si está en modo tabla, mostrar la vista completa de tabla
  if (viewMode === "table") {
    return (
      <>
        <SearchModal
          transactions={transactions}
          currentIndex={currentIndex}
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
          }}
          onSelect={(index) => {
            setIsSearchOpen(false);
            setTimeout(() => {
              handleTableSelect(index);
            }, 50);
          }}
          onTypeChange={onTypeChange}
          onMassEdit={onMassCategoryChange ? handleMassEdit : undefined}
          onMassDelete={onMassDelete ? handleMassDeleteFromSearch : undefined}
        />
        <MassEditModal
          isOpen={massEditIds.length > 0}
          selectedTransactions={selectedTransactions}
          onClose={() => setMassEditIds([])}
          onApply={handleMassEditApply}
        />
        <AccountSelectorModal
          isOpen={showAccountSelector}
          onConfirm={handleAccountSelected}
          onCancel={() => setShowAccountSelector(false)}
        />
        <div className="h-screen bg-white flex flex-col font-sans relative overflow-hidden">
          {/* Header con info */}
          <div className="flex-shrink-0 border-b border-neutral-100 bg-white z-20">
            <div className="px-12 py-4">
              <div className="flex items-center justify-between">
                <BrandHeader />
                {aiTransactions.length > 0 && (
                  <AIProgressBadge
                    current={aiReviewedCount}
                    total={aiTransactions.length}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className="flex-1 relative z-10 overflow-hidden"
            ref={tableRef}
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            {/* Contenedor de tabla con padding */}
            <div className="h-full px-12 py-6 pb-24">
              <div className="h-full overflow-auto hide-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white z-20 border-b-2 border-neutral-300">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-200">
                        Fecha
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-300">
                        Descripción
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-200">
                        Monto
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-300">
                        Categoría
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-200">
                        Recurrente
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider border-r border-neutral-200">
                        IA
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        data-transaction-id={transaction.id}
                        className={`hover:bg-neutral-50/50 transition-colors group border-b border-neutral-200 ${
                          highlightedIndex === index ? "bg-purple-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-sm font-light border-r border-neutral-200">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 text-sm font-normal border-r border-neutral-300">
                          {transaction.description}
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap text-sm font-medium tabular-nums text-right cursor-pointer hover:bg-neutral-50 transition-colors select-none border-r border-neutral-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTypeChange) {
                              onTypeChange(
                                index,
                                transaction.type === "cargo" ? "abono" : "cargo"
                              );
                            }
                          }}
                        >
                          <span
                            className={
                              transaction.type === "cargo"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {transaction.type === "cargo" ? "-" : "+"}
                            {formatMoney(transaction.amount)}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 group border-r border-neutral-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TableSelect
                            value={
                              transaction.selectedCategory ||
                              transaction.suggestedCategory ||
                              ""
                            }
                            options={categories}
                            onChange={(value) => onCategoryChange(index, value)}
                            isAISuggested={
                              !transaction.selectedCategory &&
                              (transaction.confidence === "ai" ||
                                transaction.confidence === "low")
                            }
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center border-r border-neutral-200"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                        </td>
                        <td className="px-4 py-3 text-center border-r border-neutral-200">
                          {transaction.confidence === "low" ||
                          transaction.confidence === "ai" ? (
                            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                              IA
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(index);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded text-neutral-300 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Eliminar transacción"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Barra flotante inferior */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-neutral-200/60">
            <div className="max-w-[95vw] mx-auto px-6 py-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setViewMode("normal");
                  localStorage.setItem(
                    "finance-categorizer-view-mode",
                    "normal"
                  );
                }}
                className="flex items-center gap-2 hover:bg-neutral-100/50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Vista normal</span>
              </Button>
              <div className="flex items-center">
                <KeyboardHint
                  shortcuts={[
                    { keys: ["V"], label: "cambiar vista" },
                    {
                      combinations: [["/"], ["Meta", "K"]],
                      label: "buscar",
                    },
                  ]}
                  size="sm"
                />
              </div>
            </div>
          </div>
          {/* Botones flotantes - posiciones fijas individuales */}
          <div className="fixed bottom-[156px] right-6 z-50">
            <HistoryButton
              count={deletedTransactions.length}
              onClick={() => setIsHistoryOpen(true)}
            />
          </div>
          <div className="fixed bottom-20 right-6 z-50">
            <AddToNotionButton
              onClick={handleUploadClick}
              disabled={transactions.length === 0}
              isUploading={isUploading}
            />
          </div>

          {/* Sidebar de historial */}
          <HistorySidebar
            isOpen={isHistoryOpen}
            deletedTransactions={deletedTransactions}
            onClose={() => setIsHistoryOpen(false)}
            onRestore={onRestore}
          />
        </div>
      </>
    );
  }

  // Calcular transacciones IA no revisadas para el mensaje
  const unreviewedAICount = transactions.filter(
    (t) =>
      (t.confidence === "low" || t.confidence === "ai") &&
      !reviewedTransactions.has(t.id)
  ).length;

  return (
    <>
      <SearchModal
        transactions={transactions}
        currentIndex={currentIndex}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={onGoToIndex}
        onMassEdit={onMassCategoryChange ? handleMassEdit : undefined}
        onMassDelete={onMassDelete ? handleMassDeleteFromSearch : undefined}
      />
      <MassEditModal
        isOpen={massEditIds.length > 0}
        selectedTransactions={selectedTransactions}
        onClose={() => setMassEditIds([])}
        onApply={handleMassEditApply}
      />
      <ConfirmDialog
        isOpen={showUnreviewedAlert}
        title="Transacciones IA sin revisar"
        message={`Tienes ${unreviewedAICount} transacción${
          unreviewedAICount > 1 ? "es" : ""
        } categorizada${
          unreviewedAICount > 1 ? "s" : ""
        } por IA que aún no has revisado. ¿Deseas continuar de todas formas?`}
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        onConfirm={handleUnreviewedConfirm}
        onCancel={handleUnreviewedCancel}
      />
      <AccountSelectorModal
        isOpen={showAccountSelector}
        onConfirm={handleAccountSelected}
        onCancel={() => setShowAccountSelector(false)}
      />

      <div
        className="min-h-screen bg-white flex flex-col font-sans relative"
        style={{ animation: "fadeIn 0.3s ease-out" }}
      >
        <NavigationHeader
          currentIndex={currentIndex}
          totalCount={transactions.length}
          aiReviewedCount={aiReviewedCount}
          aiTotalCount={aiTransactions.length}
          onPrev={onPrev}
          onNext={onNext}
        />

        <ProgressBar
          progress={progress}
          currentIndex={currentIndex}
          totalCount={transactions.length}
          transactions={transactions}
          onNavigate={onGoToIndex}
        />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 pb-24 relative z-10">
          {current ? (
            <TransactionCard
              transaction={current}
              slideDirection={slideDirection}
              onCategoryChange={handleCategoryChange}
              onRecurringChange={handleRecurringChange}
              onTypeChange={handleTypeChange}
            />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <img
                src="/empty-state-final.png"
                alt="Sin transacciones"
                className="w-64 h-auto opacity-90"
              />
              <p className="text-neutral-400 text-sm">
                No hay transacciones para mostrar
              </p>
            </div>
          )}
        </div>

        {/* Barra inferior fija con keyboard hints */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-8 py-4 z-40">
          <KeyboardHint
            shortcuts={[
              { keys: ["ArrowLeft", "ArrowRight"], label: "navegar" },
              {
                keys: ["Shift", "ArrowLeft"],
                lastKeyAlternatives: ["ArrowRight"],
                label: "saltar 10",
              },
              { keys: ["Home"], label: "inicio" },
              { keys: ["End"], label: "fin" },
              { keys: ["Enter"], label: "continuar" },
              { keys: ["R"], label: "recurrente" },
              {
                combinations: [["/"], ["Meta", "K"]],
                label: "buscar",
              },
              { keys: ["V"], label: "vista tabla" },
            ]}
          />
        </div>

        {/* Botones flotantes - posiciones fijas individuales */}
        <div className="fixed bottom-[156px] right-6 z-50">
          <HistoryButton
            count={deletedTransactions.length}
            onClick={() => setIsHistoryOpen(true)}
          />
        </div>
        <div className="fixed bottom-20 right-6 z-50">
          <AddToNotionButton
            onClick={handleUploadClick}
            disabled={transactions.length === 0}
            isUploading={isUploading}
          />
        </div>

        {/* Sidebar de historial */}
        <HistorySidebar
          isOpen={isHistoryOpen}
          deletedTransactions={deletedTransactions}
          onClose={() => setIsHistoryOpen(false)}
          onRestore={onRestore}
        />
      </div>
    </>
  );
};
