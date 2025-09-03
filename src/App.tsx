import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import LoadingScreen from "./components/LoadingScreen";
import CaptioningView from "./components/CaptioningView";
import WelcomeScreen from "./components/WelcomeScreen";
import WebcamPermissionDialog from "./components/WebcamPermissionDialog";
import type { AppState } from "./types";

export default function App() {
  const [appState, setAppState] = useState<AppState>("requesting-permission");
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePermissionGranted = useCallback((stream: MediaStream) => {
    setWebcamStream(stream);
    setAppState("welcome");
  }, []);

  const handleStart = useCallback(() => {
    setAppState("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setAppState("captioning");
  }, []);

  const playVideo = useCallback(async (video: HTMLVideoElement) => {
    try {
      await video.play();
    } catch (error) {
      console.error("Failed to play video:", error);
    }
  }, []);

  const setupVideo = useCallback(
    (video: HTMLVideoElement, stream: MediaStream) => {
      video.srcObject = stream;

      const handleCanPlay = () => {
        setIsVideoReady(true);
        playVideo(video);
      };

      video.addEventListener("canplay", handleCanPlay, { once: true });

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    },
    [playVideo],
  );

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const video = videoRef.current;

      video.srcObject = null;
      video.load();

      const cleanup = setupVideo(video, webcamStream);
      return cleanup;
    }
  }, [webcamStream, setupVideo]);

  const videoBlurState = useMemo(() => {
    switch (appState) {
      case "requesting-permission":
        return "blur(20px) brightness(0.2) saturate(0.5)";
      case "welcome":
        return "blur(12px) brightness(0.3) saturate(0.7)";
      case "loading":
        return "blur(8px) brightness(0.4) saturate(0.8)";
      case "captioning":
        return "none";
      default:
        return "blur(20px) brightness(0.2) saturate(0.5)";
    }
  }, [appState]);

  return (
    <div className="App relative h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />

      {webcamStream && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out"
          style={{
            filter: videoBlurState,
            opacity: isVideoReady ? 1 : 0,
          }}
        />
      )}

      {appState !== "captioning" && <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />}

      {appState === "requesting-permission" && <WebcamPermissionDialog onPermissionGranted={handlePermissionGranted} />}

      {appState === "welcome" && <WelcomeScreen onStart={handleStart} />}

      {appState === "loading" && <LoadingScreen onComplete={handleLoadingComplete} />}

      {appState === "captioning" && <CaptioningView videoRef={videoRef} />}
    </div>
  );
}
