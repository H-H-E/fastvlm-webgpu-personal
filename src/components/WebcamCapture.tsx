import GlassButton from "./GlassButton";
import GlassContainer from "./GlassContainer";
import { GLASS_EFFECTS } from "../constants";

interface WebcamCaptureProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  error?: string | null;
}

export default function WebcamCapture({ isRunning, onToggleRunning, error }: WebcamCaptureProps) {
  const hasError = Boolean(error);
  const [statusText, statusColor, containerBgColor] = hasError
    ? ["Error", "bg-red-500", GLASS_EFFECTS.COLORS.ERROR_BG]
    : isRunning
      ? ["Live", "bg-green-500 animate-pulse", GLASS_EFFECTS.COLORS.DEFAULT_BG]
      : ["Paused", "bg-red-500", GLASS_EFFECTS.COLORS.DEFAULT_BG];

  return (
    <>
      {/* Control buttons - positioned absolutely over the video */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <GlassButton onClick={onToggleRunning} aria-label={isRunning ? "Pause captioning" : "Resume captioning"}>
          {isRunning ? "Pause" : "Resume"}
        </GlassButton>
      </div>

      {/* Status indicator with glass morphism */}
      <div className="absolute top-4 left-4 z-20">
        <GlassContainer
          bgColor={containerBgColor}
          className="px-3 py-2 rounded-lg"
          role="status"
          aria-label={`Caption status: ${statusText}`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-white text-sm font-medium">{statusText}</span>
          </div>
        </GlassContainer>
      </div>
    </>
  );
}
