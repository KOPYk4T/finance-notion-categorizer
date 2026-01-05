interface KeyIconProps {
  keyLabel: string;
  size?: "sm" | "md" | "lg";
  variant?: "single" | "key-combo";
}

const sizeClasses = {
  sm: "px-2 py-1 text-[10px] min-w-[20px] h-[20px]",
  md: "px-2.5 py-1.5 text-xs min-w-[28px] h-[28px]",
  lg: "px-3 py-2 text-sm min-w-[32px] h-[32px]",
};

// Tamaños mínimos específicos para teclas con texto largo
const getMinWidth = (label: string, size: "sm" | "md" | "lg") => {
  const longKeys = ["Shift", "Home", "End", "Escape", "Delete", "Backspace", "Control", "Alt"];
  if (longKeys.includes(label)) {
    const widthMap = {
      sm: "min-w-[36px]",
      md: "min-w-[44px]",
      lg: "min-w-[52px]",
    };
    return widthMap[size];
  }
  return "";
};

export const KeyIcon = ({
  keyLabel,
  size = "md",
  variant = "single",
}: KeyIconProps) => {
  const getKeyLabel = () => {
    if (!keyLabel) return "";

    const keyMap: Record<string, string> = {
      ArrowLeft: "←",
      ArrowRight: "→",
      ArrowUp: "↑",
      ArrowDown: "↓",
      Shift: "Shift",
      Meta: "⌘",
      Control: "⌃",
      Alt: "⌥",
      Enter: "↵",
      Delete: "⌫",
      Backspace: "⌫",
      Space: "␣",
      Home: "Home",
      End: "End",
      Escape: "Esc",
      "/": "/",
      "?": "?",
    };

    // Si es una tecla especial, usar el símbolo
    if (keyMap[keyLabel]) {
      return keyMap[keyLabel];
    }

    // Si es una letra, mostrar en mayúscula
    if (keyLabel.length === 1) {
      return keyLabel.toUpperCase();
    }

    // Para combinaciones como "Cmd+K", mostrar el símbolo + letra
    if (variant === "key-combo" && keyLabel.includes("+")) {
      const parts = keyLabel.split("+");
      return parts
        .map((part) => keyMap[part.trim()] || part.trim().toUpperCase())
        .join("");
    }

    return keyLabel;
  };

  const displayLabel = getKeyLabel();
  const minWidthClass = getMinWidth(displayLabel, size);

  return (
    <kbd
      className={`inline-flex items-center justify-center font-medium text-neutral-700 
                  bg-white border border-neutral-300 rounded-md
                  ${sizeClasses[size]} ${minWidthClass}
                  shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.1)]
                  transition-shadow hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.1),0_2px_6px_0_rgba(0,0,0,0.15)]`}
    >
      {displayLabel}
    </kbd>
  );
};

