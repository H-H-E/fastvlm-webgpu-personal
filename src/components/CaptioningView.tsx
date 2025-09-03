import { useState, useRef, useEffect, useCallback } from "react";
import WebcamCapture from "./WebcamCapture";
import DraggableContainer from "./DraggableContainer";
import PromptInput from "./PromptInput";
import LiveCaption from "./LiveCaption";
import { useVLMContext } from "../context/useVLMContext";
import { PROMPTS, TIMING } from "../constants";

interface CaptioningViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function useCaptioningLoop(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isRunning: boolean,
  promptRef: React.RefObject<string>,
  onCaptionUpdate: (caption: string) => void,
  onError: (error: string) => void,
) {
  const { isLoaded, runInference } = useVLMContext();
  const abortControllerRef = useRef<AbortController | null>(null);
  const onCaptionUpdateRef = useRef(onCaptionUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCaptionUpdateRef.current = onCaptionUpdate;
  }, [onCaptionUpdate]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    if (!isRunning || !isLoaded) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const video = videoRef.current;
    const captureLoop = async () => {
      while (!signal.aborted) {
        if (video && video.readyState >= 2 && !video.paused && video.videoWidth > 0) {
          try {
            const currentPrompt = promptRef.current || "";
            const result = await runInference(video, currentPrompt, onCaptionUpdateRef.current);
            if (result && !signal.aborted) onCaptionUpdateRef.current(result);
          } catch (error) {
            if (!signal.aborted) {
              const message = error instanceof Error ? error.message : String(error);
              onErrorRef.current(message);
              console.error("Error processing frame:", error);
            }
          }
        }
        if (signal.aborted) break;
        await new Promise((resolve) => setTimeout(resolve, TIMING.FRAME_CAPTURE_DELAY));
      }
    };

    // NB: Wrap with a setTimeout to ensure abort controller can run before starting the loop
    // This is necessary for React's strict mode which calls effects twice in development.
    setTimeout(captureLoop, 0);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isRunning, isLoaded, runInference, promptRef, videoRef]);
}

export default function CaptioningView({ videoRef }: CaptioningViewProps) {
  const [caption, setCaption] = useState<string>("");
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(true);
  const [currentPrompt, setCurrentPrompt] = useState<string>(PROMPTS.default);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store current prompt to avoid loop restarts
  const promptRef = useRef<string>(currentPrompt);

  // Update prompt ref when state changes
  useEffect(() => {
    promptRef.current = currentPrompt;
  }, [currentPrompt]);

  const handleCaptionUpdate = useCallback((newCaption: string) => {
    setCaption(newCaption);
    setError(null);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setCaption(`Error: ${errorMessage}`);
  }, []);

  useCaptioningLoop(videoRef, isLoopRunning, promptRef, handleCaptionUpdate, handleError);

  const handlePromptChange = useCallback((prompt: string) => {
    setCurrentPrompt(prompt);
    setError(null);
  }, []);

  const handleToggleLoop = useCallback(() => {
    setIsLoopRunning((prev) => !prev);
    if (error) setError(null);
  }, [error]);

  return (
    <div className="absolute inset-0 text-white">
      <div className="relative w-full h-full">
        <WebcamCapture isRunning={isLoopRunning} onToggleRunning={handleToggleLoop} error={error} />

        {/* Draggable Prompt Input - Bottom Left */}
        <DraggableContainer initialPosition="bottom-left">
          <PromptInput onPromptChange={handlePromptChange} />
        </DraggableContainer>

        {/* Draggable Live Caption - Bottom Right */}
        <DraggableContainer initialPosition="bottom-right">
          <LiveCaption caption={caption} isRunning={isLoopRunning} error={error} />
        </DraggableContainer>
      </div>
    </div>
  );
}
