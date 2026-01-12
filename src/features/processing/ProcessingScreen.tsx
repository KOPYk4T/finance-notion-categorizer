interface ProcessingScreenProps {
  fileName: string;
  error?: string | null;
}

export const ProcessingScreen = ({
  fileName,
  error,
}: ProcessingScreenProps) => {
  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
        <div className="space-y-8 text-center max-w-md">
          <div className="space-y-2">
            <p className="text-2xl font-light text-red-600">
              Error al procesar
            </p>
            <p className="text-sm text-neutral-400 font-light">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="space-y-8 text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col items-center space-y-6">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-96 h-96 object-contain"
          >
            <source src="/loading.mp4" type="video/mp4" />
          </video>
          <div className="space-y-2">
            <p className="text-2xl font-medium text-neutral-900">Meowding...</p>
            <p className="text-sm text-neutral-500 font-light tracking-wide">
              {fileName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
