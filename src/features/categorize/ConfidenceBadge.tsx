import type { Confidence } from '../../shared/types';
import { Sparkles } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: Confidence;
}

export const ConfidenceBadge = ({ confidence }: ConfidenceBadgeProps) => {
  if (confidence === 'ai') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium border border-neutral-800">
        <Sparkles className="w-3 h-3 text-white" />
        Sugerido por IA
      </span>
    );
  }

  if (confidence === 'low') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-medium">
        <Sparkles className="w-3 h-3 text-neutral-900" />
        Requiere revisión
      </span>
    );
  }

  return null;
};

