import { useState, useRef, useEffect } from 'react';
import { categories } from '../../shared/constants';
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
  Sparkles,
} from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
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

export const CategorySelect = ({ value, onChange, isAISuggested = false }: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = value || categories[0];
  const config = categoryConfig[selectedCategory] || categoryConfig.Otros;
  const DisplayIcon = isAISuggested ? Sparkles : config.icon;

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Category Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-2 ${
          isOpen
            ? 'border-neutral-300 bg-white shadow-md'
            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white'
        }`}
      >
        <div
          className={`p-2 rounded-lg transition-transform duration-200 ${
            isAISuggested 
              ? 'bg-neutral-900' 
              : 'bg-neutral-900'
          } ${isOpen ? 'scale-110' : ''}`}
        >
          <DisplayIcon className={`w-4 h-4 ${isAISuggested ? 'text-white' : 'text-white'}`} />
        </div>
        <span className="flex-1 text-left text-base font-medium text-neutral-900">
          {selectedCategory}
        </span>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          {/* Search Input */}
          <div className="p-3 border-b border-neutral-100">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          {/* Categories List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredCategories.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                No se encontraron categorías
              </div>
            ) : (
              filteredCategories.map((category) => {
                const catConfig =
                  categoryConfig[category] || categoryConfig.Otros;
                const CatIcon = catConfig.icon;
                const isSelected = category === selectedCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelect(category)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-neutral-100 font-medium'
                        : 'hover:bg-neutral-50 text-neutral-900'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md transition-all duration-200 bg-neutral-900 ${
                        isSelected
                          ? 'scale-110'
                          : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="flex-1 text-left text-sm">{category}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-neutral-600 animate-[pulse_0.5s_ease-in-out]"
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
