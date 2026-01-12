import { ChevronLeft, ChevronRight } from "../../components/icons";
import { AIProgressBadge } from "./AIProgressBadge";
import { BrandHeader } from "../../components/BrandHeader";

interface NavigationHeaderProps {
  currentIndex: number;
  totalCount: number;
  aiReviewedCount?: number;
  aiTotalCount?: number;
  onPrev: () => void;
  onNext: () => void;
}

export const NavigationHeader = ({
  currentIndex,
  totalCount,
  aiReviewedCount = 0,
  aiTotalCount = 0,
  onPrev,
  onNext,
}: NavigationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-8 py-6">
      <BrandHeader />
      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
            currentIndex === 0
              ? "text-neutral-200 cursor-not-allowed"
              : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95"
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-base font-medium text-neutral-900 tabular-nums">
          {currentIndex + 1} de {totalCount}
        </span>

        <button
          onClick={onNext}
          className="p-3 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      {aiTotalCount > 0 && (
        <AIProgressBadge current={aiReviewedCount} total={aiTotalCount} />
      )}
    </div>
  );
};
