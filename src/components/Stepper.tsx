interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "border-neutral-300 bg-white"
                  : isCompleted
                  ? "border-neutral-200 bg-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-neutral-900"
                    : isActive
                    ? "border border-neutral-400 bg-white"
                    : "border border-neutral-300 bg-white"
                }`}
              >
                {isCompleted && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
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
              </div>
              <span
                className={`text-sm font-light transition-colors ${
                  isActive
                    ? "text-neutral-700"
                    : isCompleted
                    ? "text-neutral-900"
                    : "text-neutral-400"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className="text-neutral-300 text-xs font-light">{" > "}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
