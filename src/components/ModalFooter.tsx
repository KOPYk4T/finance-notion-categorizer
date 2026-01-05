import { Button } from "./Button";

interface ModalFooterProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ModalFooter = ({
  onCancel,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Continuar",
  confirmDisabled = false,
  isLoading = false,
  className = "",
}: ModalFooterProps) => {
  return (
    <div className={`flex items-center gap-3 px-6 py-4 border-t border-neutral-200 ${className}`}>
      {onCancel && (
        <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={onConfirm}
          disabled={confirmDisabled || isLoading}
        >
          {confirmText}
        </Button>
      )}
    </div>
  );
};

