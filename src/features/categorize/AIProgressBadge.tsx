import { motion, useMotionValue, useSpring, useMotionValueEvent } from 'motion/react';
import { useState, useEffect } from 'react';

interface AIProgressBadgeProps {
  current: number;
  total: number;
}

const Sparkle = ({ delay = 0, x = 0, y = 0 }: { delay?: number; x?: number; y?: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0, rotate: 0 }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    }}
    transition={{
      duration: 0.7,
      delay,
      ease: "easeOut",
    }}
    className="absolute pointer-events-none"
    style={{
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
    }}
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-400 drop-shadow-sm"
    >
      <path
        d="M7 0L8.082 4.221L12.303 5.303L8.082 6.385L7 10.606L5.918 6.385L1.697 5.303L5.918 4.221L7 0Z"
        fill="currentColor"
      />
    </svg>
  </motion.div>
);

export const AIProgressBadge = ({ current, total }: AIProgressBadgeProps) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  const [displayCount, setDisplayCount] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplayCount(Math.round(latest));
  });

  useEffect(() => {
    const prev = motionValue.get();
    motionValue.set(current);
    
    if (current > prev) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 800);
      return () => clearTimeout(timer);
    }
  }, [current, motionValue]);

  const isComplete = current === total && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors duration-300 overflow-visible ${
        isComplete
          ? 'bg-blue-50 border-blue-200/60 shadow-sm'
          : 'bg-blue-50/80 border-blue-200/40'
      }`}
    >
      {/* Sparkles */}
      {showSparkles && (
        <>
          <Sparkle delay={0} x={-8} y={-8} />
          <Sparkle delay={0.15} x={8} y={-8} />
          <Sparkle delay={0.3} x={0} y={8} />
        </>
      )}
      
      <motion.span
        key={displayCount}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-xs font-semibold text-blue-600 tabular-nums"
      >
        {displayCount}
      </motion.span>
      <span className="text-xs text-blue-400">/</span>
      <span className="text-xs font-semibold text-blue-600 tabular-nums">{total}</span>
      <span className="text-[10px] text-blue-500 font-medium ml-0.5">IA</span>
    </motion.div>
  );
};
