import { useState, useEffect, useCallback, useMemo } from "react";
import GlassContainer from "./GlassContainer";
import GlassButton from "./GlassButton";
import { GLASS_EFFECTS } from "../constants";

const ERROR_TYPES = {
  HTTPS: "https",
  NOT_SUPPORTED: "not-supported",
  PERMISSION: "permission",
  GENERAL: "general",
} as const;

const DISPLAY_CONSTRAINTS = {
  video: {
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
    frameRate: { ideal: 60, max: 60 },
  },
  audio: false, // We don't need audio for FPS commentary
};

interface ErrorInfo {
  type: (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];
  message: string;
}

interface ScreenSharePermissionDialogProps {
  onPermissionGranted: (stream: MediaStream) => void;
}

export default function ScreenSharePermissionDialog({ onPermissionGranted }: ScreenSharePermissionDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const getErrorInfo = (err: unknown): ErrorInfo => {
    if (!navigator.mediaDevices) {
      return {
        type: ERROR_TYPES.HTTPS,
        message: "Screen sharing requires a secure connection (HTTPS)",
      };
    }

    if (!navigator.mediaDevices.getDisplayMedia) {
      return {
        type: ERROR_TYPES.NOT_SUPPORTED,
        message: "Screen sharing not supported in this browser",
      };
    }

    if (err instanceof DOMException) {
      switch (err.name) {
        case "NotAllowedError":
          return {
            type: ERROR_TYPES.PERMISSION,
            message: "Screen sharing access denied",
          };
        case "NotFoundError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "No screen available for sharing",
          };
        case "NotReadableError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "Screen is already being captured",
          };
        case "OverconstrainedError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "Screen doesn't meet capture requirements",
          };
        case "SecurityError":
          return {
            type: ERROR_TYPES.HTTPS,
            message: "Security error accessing screen",
          };
        case "AbortError":
          return {
            type: ERROR_TYPES.PERMISSION,
            message: "Screen sharing was cancelled",
          };
        default:
          return {
            type: ERROR_TYPES.GENERAL,
            message: `Screen sharing error: ${err.name}`,
          };
      }
    }

    return {
      type: ERROR_TYPES.GENERAL,
      message: "Failed to access screen",
    };
  };

  const requestScreenShare = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("NOT_SUPPORTED");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(DISPLAY_CONSTRAINTS);
      
      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing ended by user');
        // You might want to handle this case by showing a message or restarting
      });

      onPermissionGranted(stream);
    } catch (err) {
      const errorInfo = getErrorInfo(err);
      setError(errorInfo);
      console.error("Error accessing screen share:", err, errorInfo);
    } finally {
      setIsRequesting(false);
    }
  }, [onPermissionGranted]);

  useEffect(() => {
    requestScreenShare();
  }, [requestScreenShare]);

  const troubleshootingData = useMemo(
    () => ({
      [ERROR_TYPES.HTTPS]: {
        title: "🔒 HTTPS Required",
        items: [
          "Access this app via https:// instead of http://",
          "If developing locally, use localhost (exempt from HTTPS requirement)",
          "Deploy to a hosting service that provides HTTPS (Vercel, Netlify, GitHub Pages)",
        ],
      },
      [ERROR_TYPES.NOT_SUPPORTED]: {
        title: "🌐 Browser Compatibility",
        items: [
          "Update your browser to the latest version",
          "Use Chrome 72+, Edge 79+, Firefox 66+, or Safari 13+",
          "Enable JavaScript if disabled",
        ],
      },
      [ERROR_TYPES.PERMISSION]: {
        title: "🚫 Permission Issues",
        items: [
          "Click 'Share' when the screen sharing dialog appears",
          "Select your game window or entire screen",
          "Make sure to select 'Share audio' if you want game sounds",
          "Check browser settings → Privacy & Security → Screen sharing",
        ],
      },
      [ERROR_TYPES.GENERAL]: {
        title: "General Troubleshooting",
        items: [
          "Make sure your game is running and visible",
          "Try selecting 'Entire Screen' instead of a specific window",
          "Close other screen recording/sharing applications",
          "Try using a different browser or restarting your browser",
        ],
      },
    }),
    [],
  );

  const getErrorStyling = (isSecurityIssue: boolean) => ({
    container: `border rounded-lg p-4 ${
      isSecurityIssue ? "bg-orange-900/20 border-orange-500/30" : "bg-red-900/20 border-red-500/30"
    }`,
    text: `text-sm ${isSecurityIssue ? "text-orange-400" : "text-red-400"}`,
    troubleshooting: {
      bg: `border rounded-lg p-3 ${
        isSecurityIssue ? "bg-orange-900/20 border-orange-500/30" : "bg-red-900/20 border-red-500/30"
      }`,
      title: `text-xs font-semibold mb-2 ${isSecurityIssue ? "text-orange-400" : "text-red-400"}`,
      list: `text-xs space-y-1 ${isSecurityIssue ? "text-orange-300" : "text-red-300"}`,
    },
  });

  const renderIcon = () => {
    if (isRequesting) {
      return (
        <div
          className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
          role="progressbar"
          aria-label="Requesting screen sharing access"
        />
      );
    }

    const iconClass = "w-8 h-8";
    const containerClass = `w-16 h-16 rounded-full flex items-center justify-center ${
      error ? "bg-red-500/20" : "bg-blue-500/20"
    }`;

    return (
      <div className={containerClass} aria-hidden="true">
        {error ? (
          <svg className={`${iconClass} text-red-400`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className={`${iconClass} text-blue-400`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v6h10V5H5z"
              clipRule="evenodd"
            />
            <path d="M9 15a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" />
          </svg>
        )}
      </div>
    );
  };

  const getTroubleshootingContent = () => {
    if (!error) return null;

    const content = troubleshootingData[error.type];
    const isSecurityIssue = error.type === ERROR_TYPES.HTTPS;
    const styling = getErrorStyling(isSecurityIssue);

    return (
      <div className={styling.troubleshooting.bg}>
        <h4 className={styling.troubleshooting.title}>{content.title}</h4>
        <ul className={styling.troubleshooting.list}>
          {content.items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const getTitle = () => {
    if (isRequesting) return "Requesting Screen Share Access";
    if (error) return "Screen Share Access Required";
    return "Screen Share Permission Required";
  };

  const getDescription = () => {
    if (isRequesting) return "Please select your game window or screen to share for FPS commentary...";
    if (error) return error.message;
    return "This app requires screen sharing access to provide live commentary on your FPS gameplay. Please grant permission to continue.";
  };

  const isSecurityIssue = error?.type === ERROR_TYPES.HTTPS;
  const errorStyling = error ? getErrorStyling(isSecurityIssue) : null;

  return (
    <div
      className="absolute inset-0 text-white flex items-center justify-center p-8"
      role="dialog"
      aria-labelledby="screen-share-dialog-title"
      aria-describedby="screen-share-dialog-description"
    >
      <div className="max-w-md w-full space-y-6">
        <GlassContainer
          className="rounded-3xl shadow-2xl"
          bgColor={error ? GLASS_EFFECTS.COLORS.ERROR_BG : GLASS_EFFECTS.COLORS.DEFAULT_BG}
        >
          <div className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">{renderIcon()}</div>

              <h2 id="screen-share-dialog-title" className="text-2xl font-bold text-gray-100">
                {getTitle()}
              </h2>
              <p id="screen-share-dialog-description" className="text-gray-400">
                {getDescription()}
              </p>
            </div>

            {error && errorStyling && (
              <div className="space-y-4">
                <div className={errorStyling.container}>
                  <p className={errorStyling.text}>
                    {isSecurityIssue
                      ? "This app requires HTTPS to access screen sharing. FPS commentary cannot work without screen access."
                      : "Screen sharing access is required for this app to function. FPS commentary cannot work without screen input."}
                  </p>
                </div>

                <GlassButton
                  onClick={requestScreenShare}
                  disabled={isRequesting}
                  className="px-6 py-3"
                  aria-label="Try again to request screen sharing access"
                >
                  Try Again
                </GlassButton>
              </div>
            )}

            {isRequesting && (
              <p className="text-sm text-gray-500">
                If you don't see a screen sharing dialog, check your browser settings or try refreshing the page.
              </p>
            )}
          </div>
        </GlassContainer>

        {error && (
          <GlassContainer className="rounded-2xl shadow-2xl">
            <div className="p-4 text-left">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Troubleshooting:</h3>

              <div className="space-y-3">{getTroubleshootingContent()}</div>

              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <p className="text-xs text-gray-500">
                  Current URL:{" "}
                  <code className="bg-gray-800/50 px-1 rounded text-gray-400">
                    {window.location.protocol}//{window.location.host}
                  </code>
                </p>
                {isSecurityIssue && !window.location.protocol.startsWith("https") && (
                  <p className="text-xs text-orange-400 mt-1">⚠️ Non-secure connection detected</p>
                )}
              </div>
            </div>
          </GlassContainer>
        )}
      </div>
    </div>
  );
}
