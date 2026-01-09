import { FloatingButton } from "./FloatingButton";
import { History } from "lucide-react";

interface HistoryButtonProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export const HistoryButton = ({
  count,
  onClick,
  className = "",
}: HistoryButtonProps) => {
  return (
    <FloatingButton
      icon={<History className="w-6 h-6" />}
      text="Historial"
      onClick={onClick}
      badge={count}
      className={className}
    />
  );
};
