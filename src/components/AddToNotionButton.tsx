import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NotionIcon } from "./icons";

interface AddToNotionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
}

export const AddToNotionButton = ({
  onClick,
  disabled = false,
  isUploading = false,
  className = "",
}: AddToNotionButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Anchos específicos para evitar bugs con 'auto'
  const collapsedWidth = 56;
  const expandedWidth = isUploading ? 140 : 188; // "Subiendo..." vs "Agregar a Notion"

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isUploading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center overflow-hidden bg-white border-2 border-neutral-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      animate={{
        borderRadius: isHovered || isUploading ? "12px" : "50%",
        width: isHovered || isUploading ? expandedWidth : collapsedWidth,
        justifyContent: isHovered || isUploading ? "flex-start" : "center",
        paddingLeft: isHovered || isUploading ? "16px" : "0px",
        backgroundColor: isHovered && !disabled ? "#000000" : "#ffffff",
        borderColor: isHovered && !disabled ? "#000000" : "#e5e5e5",
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        height: "56px",
      }}
      title={isUploading ? "Subiendo..." : "Agregar a Notion"}
    >
      {/* Icono - a la izquierda */}
      <motion.div
        className="flex-shrink-0 relative z-10"
        animate={{
          rotate: isUploading ? 360 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{
          rotate: {
            duration: isUploading ? 1 : 0.3,
            repeat: isUploading ? Infinity : 0,
            ease: "linear",
          },
          scale: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        {isUploading ? (
          <svg
            className="h-6 w-6 text-neutral-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <motion.div
            animate={{
              color: isHovered && !disabled ? "#ffffff" : "#000000",
            }}
            transition={{ duration: 0.3 }}
          >
            <NotionIcon className="h-6 w-6" />
          </motion.div>
        )}
      </motion.div>

      {/* Texto - position absolute para no afectar el layout */}
      <AnimatePresence>
        {(isHovered || isUploading) && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute text-sm font-medium whitespace-nowrap pointer-events-none"
            style={{
              color: isHovered && !disabled ? "#ffffff" : "#000000",
              right: "16px",
            }}
          >
            {isUploading ? "Subiendo..." : "Agregar a Notion"}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Efecto de brillo sutil en hover */}
      <AnimatePresence>
        {isHovered && !disabled && !isUploading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
            style={{ pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};
