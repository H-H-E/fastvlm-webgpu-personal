import { useEffect, useState } from "react";
import { useVLMContext } from "../context/useVLMContext";
import GlassContainer from "./GlassContainer";
import { GLASS_EFFECTS } from "../constants";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [isError, setIsError] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  const { loadModel, isLoaded, isLoading } = useVLMContext();

  useEffect(() => {
    // Prevent multiple loading attempts
    if (hasStartedLoading || isLoading || isLoaded) return;

    const loadModelAndProgress = async () => {
      setHasStartedLoading(true);

      try {
        setCurrentStep("Checking WebGPU support...");
        setProgress(5);

        // Check for WebGPU support first
        if (!navigator.gpu) {
          setCurrentStep("WebGPU not available in this browser");
          setIsError(true);
          return;
        }

        // Load the actual AI model
        await loadModel((message) => {
          setCurrentStep(message);
          if (message.includes("Loading processor")) {
            setProgress(10);
          } else if (message.includes("Processor loaded")) {
            setProgress(20);
          } else if (message.includes("Model loaded")) {
            setProgress(80);
          }
        });

        setCurrentStep("Ready to start!");
        setProgress(100);

        // Small delay before completing
        await new Promise((resolve) => setTimeout(resolve, 300));
        onComplete();
      } catch (error) {
        console.error("Error loading model:", error);
        setCurrentStep(`Error loading model: ${error instanceof Error ? error.message : String(error)}`);
        setIsError(true);
      }
    };

    loadModelAndProgress();
  }, [hasStartedLoading, isLoading, isLoaded, loadModel, onComplete]);

  // Handle case where model is already loaded
  useEffect(() => {
    if (isLoaded && !hasStartedLoading) {
      setProgress(100);
      setCurrentStep("Model already loaded!");
      setTimeout(onComplete, 300);
    }
  }, [isLoaded, hasStartedLoading, onComplete]);

  return (
    <div className="absolute inset-0 text-white flex items-center justify-center p-8" style={{ opacity: 1 }}>
      <GlassContainer
        className="max-w-md w-full rounded-3xl shadow-2xl"
        bgColor={isError ? GLASS_EFFECTS.COLORS.ERROR_BG : GLASS_EFFECTS.COLORS.DEFAULT_BG}
      >
        <div className="p-8 text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              {isError ? (
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-100">{isError ? "Loading Failed" : "Loading AI Model"}</h2>

            <p className={`${isError ? "text-red-400" : "text-gray-400"}`}>{currentStep}</p>
          </div>

          {!isError && (
            <div className="space-y-2">
              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-gray-700/30">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </div>
          )}

          {isError && (
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </GlassContainer>
    </div>
  );
}
