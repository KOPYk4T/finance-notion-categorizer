import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import {
  ShoppingCart,
  Home,
  Zap,
  Building2,
  UtensilsCrossed,
  Car,
  Heart,
  Scissors,
  Shirt,
  Dumbbell,
  Sofa,
  Film,
  Music,
  Gamepad2,
  Book,
  Wallet,
  TrendingUp,
  Coffee,
  MoreHorizontal,
  Coins,
} from "lucide-react";

interface TableSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
  isAISuggested?: boolean;
}

const categoryConfig: Record<
  string,
  { icon: React.ElementType }
> = {
  Sueldo: {
    icon: Wallet,
  },
  Arriendo: {
    icon: Home,
  },
  'Gastos Básicos': {
    icon: Zap,
  },
  Supermercado: {
    icon: ShoppingCart,
  },
  Transporte: {
    icon: Car,
  },
  Salud: {
    icon: Heart,
  },
  Estética: {
    icon: Scissors,
  },
  Lavandería: {
    icon: Shirt,
  },
  Trabajo: {
    icon: Building2,
  },
  Restaurant: {
    icon: UtensilsCrossed,
  },
  Delivery: {
    icon: Coffee,
  },
  Cine: {
    icon: Film,
  },
  Conciertos: {
    icon: Music,
  },
  Streaming: {
    icon: Film,
  },
  Juegos: {
    icon: Gamepad2,
  },
  Libros: {
    icon: Book,
  },
  Vestimenta: {
    icon: Shirt,
  },
  Deporte: {
    icon: Dumbbell,
  },
  Decoración: {
    icon: Sofa,
  },
  Ahorro: {
    icon: Wallet,
  },
  Inversiones: {
    icon: TrendingUp,
  },
  'Ingresos extra': {
    icon: Coins,
  },
  Otros: {
    icon: MoreHorizontal,
  },
};

export const TableSelect = ({
  value,
  options,
  onChange,
  className = "",
  isAISuggested = false,
}: TableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = value || "";
  const config = categoryConfig[selectedCategory] || categoryConfig.Otros;
  const DisplayIcon = isAISuggested ? Sparkles : config.icon;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full text-left flex items-center justify-between gap-1.5 px-2 py-1 text-sm font-normal text-neutral-900 hover:bg-neutral-50 rounded transition-all duration-200 cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className={`p-0.5 rounded bg-neutral-900 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "scale-110" : ""
          }`}>
            <DisplayIcon className="w-3 h-3 text-white" />
          </div>
          <span className="truncate">{value || "Seleccionar"}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 transition-transform duration-200 flex-shrink-0 opacity-60 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-2xl max-h-64 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          {/* Search Input */}
          <div className="p-2 border-b border-neutral-100">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-400 font-medium">
                No se encontraron categorías
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionConfig = categoryConfig[option] || categoryConfig.Otros;
                const OptionIcon = optionConfig.icon;
                const isSelected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-normal transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`p-0.5 rounded bg-neutral-900 flex-shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "scale-110"
                          : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
                      }`}
                    >
                      <OptionIcon className="w-3 h-3 text-white" />
                    </div>
                    <span>{option}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-neutral-600 animate-[pulse_0.5s_ease-in-out] ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
