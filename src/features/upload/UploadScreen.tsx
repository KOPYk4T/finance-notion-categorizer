import { useRef } from "react";
import { motion } from "motion/react";
import { validateFile } from "../../shared/utils/validationUtils";
import { Button } from "../../components/Button";

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
}

export const UploadScreen = ({ onFileSelect }: UploadScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    } else if (file) {
      alert(
        "Por favor, selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)"
      );
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.8,
          }}
        >
          <img
            src="/Box.svg"
            alt="Upload"
            className="w-52 h-52 animate-sketchy"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3,
            duration: 0.7,
          }}
          className="flex flex-col items-center gap-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95, rotate: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button onClick={handleClick} size="lg">
              Importar archivo
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-sm text-neutral-400 font-light"
          >
            .xlsx, .xls, .csv
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
