import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Transaction } from '../../shared/types';
import { formatMoney } from '../../shared/utils';

interface ProgressBarProps {
  progress: number;
  currentIndex: number;
  totalCount: number;
  transactions: Transaction[];
  onNavigate: (index: number) => void;
}

interface TooltipPosition {
  x: number;
  y: number;
  alignment: 'left' | 'center' | 'right';
}

export const ProgressBar = ({
  progress,
  currentIndex,
  totalCount,
  transactions,
  onNavigate,
}: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
    alignment: 'center',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Índice y progreso a mostrar
  const displayIndex = isDragging && hoverIndex !== null ? hoverIndex : currentIndex;
  const displayProgress = isDragging && hoverIndex !== null
    ? ((hoverIndex + 1) / totalCount) * 100
    : progress;

  const previewTransaction = transactions[displayIndex];
  const showTooltip = isDragging || (hoverIndex !== null && hoverIndex !== currentIndex);

  /**
   * Calcula la posición óptima del tooltip para mantenerlo dentro de los límites del viewport
   */
  const calculateTooltipPosition = useCallback((): TooltipPosition => {
    if (!containerRef.current || !tooltipRef.current) {
      return { x: 0, y: 0, alignment: 'center' };
    }

    const container = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    // Posición del indicador en la barra
    const indicatorX = container.left + (displayProgress / 100) * container.width;
    const indicatorY = container.top;

    // Constantes de layout
    const EDGE_PADDING = 16;
    const TOOLTIP_OFFSET = 12; // Separación entre indicador y tooltip
    const ARROW_SIZE = 6;

    // Dimensiones del viewport
    const viewportWidth = window.innerWidth;

    // Calcular posición Y (siempre abajo del indicador)
    const y = indicatorY + container.height + TOOLTIP_OFFSET + ARROW_SIZE;

    // Calcular posición X y alignment
    let x: number;
    let alignment: 'left' | 'center' | 'right';

    const halfWidth = tooltip.width / 2;

    // Intentar centrar primero
    if (
      indicatorX - halfWidth >= EDGE_PADDING &&
      indicatorX + halfWidth <= viewportWidth - EDGE_PADDING
    ) {
      // Centrado: la esquina izquierda está a mitad del ancho a la izquierda del indicador
      x = indicatorX - halfWidth;
      alignment = 'center';
    }
    // Si se sale por la derecha, alinear a la derecha
    else if (indicatorX + halfWidth > viewportWidth - EDGE_PADDING) {
      x = viewportWidth - EDGE_PADDING - tooltip.width;
      alignment = 'right';
    }
    // Si se sale por la izquierda, alinear a la izquierda
    else {
      x = EDGE_PADDING;
      alignment = 'left';
    }

    return { x, y, alignment };
  }, [displayProgress]);

  /**
   * Actualiza la posición del tooltip
   */
  useEffect(() => {
    if (!showTooltip || !tooltipRef.current) return;

    const updatePosition = () => {
      const position = calculateTooltipPosition();
      setTooltipPosition(position);
    };

    // Esperar a que el tooltip se renderice para obtener dimensiones correctas
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });

    // Actualizar en resize y scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showTooltip, displayProgress, calculateTooltipPosition]);

  /**
   * Calcula el índice basado en la posición del mouse
   */
  const getIndexFromPosition = useCallback(
    (clientX: number): number => {
      if (!containerRef.current) return currentIndex;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const index = Math.round(percentage * (totalCount - 1));

      return Math.max(0, Math.min(totalCount - 1, index));
    },
    [totalCount, currentIndex]
  );

  /**
   * Handlers de interacción
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const index = getIndexFromPosition(e.clientX);
    setHoverIndex(index);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const index = getIndexFromPosition(e.clientX);
      setHoverIndex(index);
    },
    [isDragging, getIndexFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (hoverIndex !== null) {
      onNavigate(hoverIndex);
    }

    // Delay para permitir la animación de salida del tooltip
    setTimeout(() => {
      setHoverIndex(null);
    }, 150);
  }, [isDragging, hoverIndex, onNavigate]);

  const handleMouseMoveOver = (e: React.MouseEvent) => {
    if (isDragging) return;
    const index = getIndexFromPosition(e.clientX);
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverIndex(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const index = getIndexFromPosition(e.clientX);
    onNavigate(index);
  };

  /**
   * Efectos de eventos globales
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /**
   * Calcula la posición del tooltip arrow
   */
  const getArrowPosition = (): { left: string } => {
    if (!containerRef.current) return { left: '50%' };

    const container = containerRef.current.getBoundingClientRect();
    const indicatorX = container.left + (displayProgress / 100) * container.width;

    if (tooltipPosition.alignment === 'center') {
      return { left: '50%' };
    } else if (tooltipPosition.alignment === 'left') {
      const offset = indicatorX - tooltipPosition.x;
      return { left: `${offset}px` };
    } else {
      // right alignment
      const offset = indicatorX - tooltipPosition.x;
      return { left: `${offset}px` };
    }
  };

  return (
    <div className="relative px-8 py-4 select-none">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveOver}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative h-1.5 bg-neutral-50 rounded-full cursor-pointer group"
      >
        {/* Division lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalCount }).map((_, index) => (
            <div
              key={index}
              className="flex-1 border-r border-neutral-200/40 last:border-r-0"
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="absolute h-full bg-neutral-900 rounded-full"
          style={{
            width: `${displayProgress}%`,
            transition: isDragging
              ? 'none'
              : 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Current position indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-900 rounded-full border-2 border-white shadow-sm z-10 cursor-grab active:cursor-grabbing"
          style={{
            left: `${displayProgress}%`,
            x: '-50%',
          }}
          animate={{
            scale: isDragging || hoverIndex !== null ? 1.3 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Preview tooltip - Portal-style positioning */}
      <AnimatePresence>
        {showTooltip && previewTransaction && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 px-3 py-2.5 bg-neutral-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              minWidth: '220px',
              maxWidth: '340px',
            }}
          >
            <div className="space-y-1.5">
              {/* Description */}
              <div className="font-medium text-white line-clamp-2 leading-tight">
                {previewTransaction.description}
              </div>

              {/* Amount and Date */}
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-semibold tabular-nums ${
                    previewTransaction.type === 'cargo'
                      ? 'text-red-300'
                      : 'text-green-300'
                  }`}
                >
                  {previewTransaction.type === 'cargo' ? '-' : '+'}
                  {formatMoney(previewTransaction.amount)}
                </span>
                <span className="text-neutral-400 text-[10px]">
                  {previewTransaction.date}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="text-neutral-400 text-[10px] pt-1 border-t border-neutral-700/50 font-medium">
                {displayIndex + 1} / {totalCount}
              </div>
            </div>

            {/* Arrow */}
            <div
              className="absolute w-2 h-2 bg-neutral-900 rotate-45 -translate-x-1/2"
              style={{
                ...getArrowPosition(),
                top: '-4px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
