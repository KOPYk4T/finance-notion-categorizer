import { KeyIcon } from "./KeyIcon";

interface KeyboardShortcut {
  keys?: string[];
  label: string;
  // Para mostrar múltiples opciones de la última tecla (ej: "←" y "→")
  lastKeyAlternatives?: string[];
  // Para mostrar múltiples combinaciones completamente diferentes (ej: "/" o "Cmd+K")
  combinations?: string[][];
}

interface KeyboardHintProps {
  shortcuts: KeyboardShortcut[];
  size?: "sm" | "md" | "lg";
}

export const KeyboardHint = ({
  shortcuts,
  size = "sm",
}: KeyboardHintProps) => {
  const renderKeys = (shortcut: KeyboardShortcut) => {
    // Si hay combinations, renderizar múltiples combinaciones separadas por " / "
    if (shortcut.combinations) {
      return (
        <>
          {shortcut.combinations.map((combo, comboIndex) => (
            <span key={comboIndex} className="flex items-center gap-0.5">
              {comboIndex > 0 && (
                <span className="text-neutral-300 mx-1">/</span>
              )}
              {combo.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center gap-0.5">
                  {keyIndex > 0 && (
                    <span className="text-neutral-300 mx-0.5">+</span>
                  )}
                  <KeyIcon keyLabel={key} size={size} variant="single" />
                </span>
              ))}
            </span>
          ))}
        </>
      );
    }

    // Si hay lastKeyAlternatives, mostrar las alternativas para la última tecla
    if (shortcut.lastKeyAlternatives && shortcut.lastKeyAlternatives.length > 0 && shortcut.keys) {
      const baseKeys = shortcut.keys.slice(0, -1);
      const lastKey = shortcut.keys[shortcut.keys.length - 1];
      
      return (
        <>
          {baseKeys.map((key, keyIndex) => (
            <span key={keyIndex} className="flex items-center gap-0.5">
              {keyIndex > 0 && (
                <span className="text-neutral-300 mx-0.5">+</span>
              )}
              <KeyIcon keyLabel={key} size={size} variant="single" />
            </span>
          ))}
          {baseKeys.length > 0 && (
            <span className="text-neutral-300 mx-0.5">+</span>
          )}
          <span className="flex items-center gap-0.5">
            <KeyIcon keyLabel={lastKey} size={size} variant="single" />
            {shortcut.lastKeyAlternatives.map((altKey, altIndex) => (
              <span key={altIndex} className="flex items-center gap-0.5">
                <span className="text-neutral-300 mx-0.5">/</span>
                <KeyIcon keyLabel={altKey} size={size} variant="single" />
              </span>
            ))}
          </span>
        </>
      );
    }

    // Caso normal: renderizar todas las teclas con +
    if (shortcut.keys) {
      return (
        <>
          {shortcut.keys.map((key, keyIndex) => (
            <span key={keyIndex} className="flex items-center gap-0.5">
              {keyIndex > 0 && (
                <span className="text-neutral-300 mx-0.5">+</span>
              )}
              <KeyIcon keyLabel={key} size={size} variant="single" />
            </span>
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 text-neutral-300 font-light text-xs"
        >
          <div className="flex items-center gap-0.5">
            {renderKeys(shortcut)}
          </div>
          <span className="text-neutral-400">{shortcut.label}</span>
          {index < shortcuts.length - 1 && (
            <span className="text-neutral-300 mx-1">·</span>
          )}
        </div>
      ))}
    </div>
  );
};

