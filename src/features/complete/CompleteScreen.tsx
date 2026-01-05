import { useState } from "react";
import { motion } from "motion/react";
import { Check, Restore } from "../../components/icons";
import type { Transaction } from "../../shared/types";
import { formatMoney } from "../../shared/utils";
import {
  uploadTransactionsToNotion,
  isNotionConfigured,
} from "../../shared/services/notionService";
import { AccountSelectorModal } from "./AccountSelectorModal";
import { Button } from "../../components/Button";
import { Confetti } from "../../components/Confetti";

interface CompleteScreenProps {
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  onRestore: (index: number) => void;
  onGoBack: () => void;
  onUploadAnother: () => void;
  onResetWithoutConfirm?: () => void;
}

export const CompleteScreen = ({
  transactions,
  deletedTransactions,
  onRestore,
  onGoBack,
  onUploadAnother,
  onResetWithoutConfirm,
}: CompleteScreenProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploaded: 0,
    total: 0,
  });
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const handleAccountSelected = async (accountId?: string) => {
    setShowAccountSelector(false);
    await uploadToNotion(accountId);
  };

  const uploadToNotion = async (accountId?: string) => {
    if (!isNotionConfigured()) {
      setUploadResult({
        success: false,
        message:
          "Notion no está configurado. Verifica las variables de entorno.",
      });
      return;
    }

    if (transactions.length === 0) {
      setUploadResult({
        success: false,
        message: "No hay transacciones para subir.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ uploaded: 0, total: transactions.length });
    setUploadResult(null);

    try {
      const result = await uploadTransactionsToNotion(
        transactions,
        accountId,
        (uploaded, total) => {
          setUploadProgress({ uploaded, total });
        }
      );

      if (result.success) {
        setUploadResult({
          success: true,
          message: `¡Éxito! ${result.uploaded} transacciones subidas a Notion.`,
        });

        setShowSuccessScreen(true);
      } else {
        setUploadResult({
          success: false,
          message: `Se subieron ${result.uploaded} de ${
            transactions.length
          } transacciones. ${result.errors?.[0] || "Error desconocido"}`,
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Error al subir a Notion",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (showSuccessScreen && uploadResult?.success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col font-sans relative overflow-hidden">
        {/* Confeti */}
        <Confetti />

        {/* Contenido */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12 text-center max-w-2xl w-full"
          >
            {/* Ícono de éxito */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mx-auto w-24 h-24"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-green-500 rounded-full blur-xl"
              />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/20">
                <Check className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Título y mensaje */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-extralight tracking-tight text-neutral-900">
                ¡Todo listo!
              </h1>
              <p className="text-neutral-500 font-light text-xl">
                {uploadResult.message.replace("¡Éxito! ", "")}
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="inline-block px-4 py-2 bg-green-50 border border-green-200 rounded-full"
              >
                <p className="text-sm text-green-700 font-medium">
                  Sincronizado con Notion
                </p>
              </motion.div>
            </motion.div>

            {/* Botón de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="pt-6"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (onResetWithoutConfirm) {
                    onResetWithoutConfirm();
                  } else {
                    onUploadAnother();
                  }
                }}
                className="px-8 py-4 text-base"
              >
                Subir otra cartola
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-neutral-200 rounded-full blur-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <AccountSelectorModal
        isOpen={showAccountSelector}
        onConfirm={handleAccountSelected}
        onCancel={() => setShowAccountSelector(false)}
      />
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="space-y-10 text-center animate-[scaleIn_0.6s_cubic-bezier(0.16,1,0.3,1)] max-w-2xl w-full">
            <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mx-auto animate-[pop_0.5s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
              <Check className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-3">
              <p className="text-3xl font-light text-neutral-900">Listo</p>
              <p className="text-neutral-400 font-light text-lg">
                {transactions.length} transacciones categorizadas
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {isUploading && (
                <div className="w-full max-w-md mx-auto">
                  <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 transition-all duration-300"
                      style={{
                        width: `${
                          (uploadProgress.uploaded / uploadProgress.total) * 100
                        }%`,
                      }}
                    />
                    <p className="text-xs text-neutral-400 font-light text-center mt-2">
                      {uploadProgress.uploaded} de {uploadProgress.total}{" "}
                      transacciones
                    </p>
                  </div>
                </div>
              )}

              {uploadResult && (
                <div
                  className={`text-sm font-light px-4 py-3 rounded-xl max-w-md mx-auto text-center ${
                    uploadResult.success
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {uploadResult.message}
                </div>
              )}

              {transactions.length > 0 && !isUploading && !uploadResult && (
                <div className="flex flex-col items-center gap-3">
                  <Button variant="secondary" size="lg" onClick={onGoBack}>
                    Volver a revisar
                  </Button>
                  <Button
                    variant="text"
                    size="sm"
                    onClick={onUploadAnother}
                    className="py-2"
                  >
                    Subir otra cartola
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {deletedTransactions.length > 0 && (
          <div className="border-t border-neutral-200 p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-light text-neutral-900">
                  Transacciones saltadas ({deletedTransactions.length})
                </h2>
              </div>

              <div className="space-y-2">
                {deletedTransactions.map((transaction, index) => (
                  <div
                    key={`deleted-${transaction.id}-${index}`}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl
                           hover:bg-neutral-100 transition-colors duration-200"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-400 font-light">
                          {transaction.date}
                        </span>
                        <span
                          className={`text-xs font-light px-2 py-0.5 rounded-full ${
                            transaction.type === "cargo"
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {transaction.type === "cargo" ? "Gasto" : "Ingreso"}
                        </span>
                      </div>
                      <p className="text-sm font-normal text-neutral-900">
                        {transaction.description}
                      </p>
                      <p
                        className={`text-sm font-light tabular-nums ${
                          transaction.type === "cargo"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.type === "cargo" ? "-" : "+"}
                        {formatMoney(transaction.amount)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRestore(index)}
                      className="ml-4 flex items-center gap-2 hover:bg-white active:scale-95"
                    >
                      <Restore className="w-4 h-4" />
                      <span>Restaurar</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
