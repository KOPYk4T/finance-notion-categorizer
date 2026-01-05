import { motion } from "motion/react";
import { Check } from "../../components/icons";
import { Button } from "../../components/Button";
import { Confetti } from "../../components/Confetti";

interface SuccessScreenProps {
  uploadedCount: number;
  onReset: () => void;
}

export const SuccessScreen = ({ uploadedCount, onReset }: SuccessScreenProps) => {
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
              {uploadedCount} transacciones subidas a Notion
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
              onClick={onReset}
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
};
