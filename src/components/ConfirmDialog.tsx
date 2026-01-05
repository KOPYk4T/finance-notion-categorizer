import { ModalFooter } from "./ModalFooter";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-light text-neutral-900">{title}</h3>
          <p className="text-sm font-light text-neutral-600 leading-relaxed">
            {message}
          </p>
        </div>

        <ModalFooter
          onCancel={onCancel}
          onConfirm={onConfirm}
          cancelText={cancelText}
          confirmText={confirmText}
        />
      </div>
    </div>
  );
};

