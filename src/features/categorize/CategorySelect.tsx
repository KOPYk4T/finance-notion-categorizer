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
} from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
}

const categoryConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType }
> = {
  Sueldo: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: Wallet,
  },
  Arriendo: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Home,
  },
  'Gastos Básicos': {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Zap,
  },
  Supermercado: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: ShoppingCart,
  },
  Transporte: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    icon: Car,
  },
  Salud: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: Heart,
  },
  Estética: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    icon: Scissors,
  },
  Lavandería: {
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    icon: Shirt,
  },
  Trabajo: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: Building2,
  },
  Restaurant: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: UtensilsCrossed,
  },
  Delivery: {
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    icon: Coffee,
  },
  Cine: {
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    icon: Film,
  },
  Conciertos: {
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50',
    icon: Music,
  },
  Streaming: {
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    icon: Film,
  },
  Juegos: {
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    icon: Gamepad2,
  },
  Libros: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Book,
  },
  Vestimenta: {
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    icon: Shirt,
  },
  Deporte: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: Dumbbell,
  },
  Decoración: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: Sofa,
  },
  Ahorro: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: Wallet,
  },
  Inversiones: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: TrendingUp,
  },
  Otros: {
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-50',
    icon: MoreHorizontal,
  },
};

export const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = value || categories[0];
  const config = categoryConfig[selectedCategory] || categoryConfig.Otros;
  const Icon = config.icon;

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
          className={`p-2 rounded-lg ${config.bgColor} ${config.color} transition-transform duration-200 ${
            isOpen ? 'scale-110' : ''
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left font-normal text-neutral-900">
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
                        ? `${catConfig.bgColor} ${catConfig.color} font-medium`
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        isSelected
                          ? `${catConfig.bgColor} ${catConfig.color} scale-110`
                          : `${catConfig.bgColor} ${catConfig.color} opacity-60 group-hover:opacity-100 group-hover:scale-110`
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1 text-left text-sm">{category}</span>
                    {isSelected && (
                      <svg
                        className={`w-4 h-4 ${catConfig.color} animate-[pulse_0.5s_ease-in-out]`}
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
