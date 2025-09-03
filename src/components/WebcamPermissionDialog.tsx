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

const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
    facingMode: "user",
  },
};

interface ErrorInfo {
  type: (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];
  message: string;
}

interface WebcamPermissionDialogProps {
  onPermissionGranted: (stream: MediaStream) => void;
}

export default function WebcamPermissionDialog({ onPermissionGranted }: WebcamPermissionDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const getErrorInfo = (err: unknown): ErrorInfo => {
    if (!navigator.mediaDevices) {
      return {
        type: ERROR_TYPES.HTTPS,
        message: "Camera access requires a secure connection (HTTPS)",
      };
    }

    if (!navigator.mediaDevices.getUserMedia) {
      return {
        type: ERROR_TYPES.NOT_SUPPORTED,
        message: "Camera access not supported in this browser",
      };
    }

    if (err instanceof DOMException) {
      switch (err.name) {
        case "NotAllowedError":
          return {
            type: ERROR_TYPES.PERMISSION,
            message: "Camera access denied",
          };
        case "NotFoundError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "No camera found",
          };
        case "NotReadableError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "Camera is in use by another application",
          };
        case "OverconstrainedError":
          return {
            type: ERROR_TYPES.GENERAL,
            message: "Camera doesn't meet requirements",
          };
        case "SecurityError":
          return {
            type: ERROR_TYPES.HTTPS,
            message: "Security error accessing camera",
          };
        default:
          return {
            type: ERROR_TYPES.GENERAL,
            message: `Camera error: ${err.name}`,
          };
      }
    }

    return {
      type: ERROR_TYPES.GENERAL,
      message: "Failed to access camera",
    };
  };

  const requestWebcamAccess = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("NOT_SUPPORTED");
      }

      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      onPermissionGranted(stream);
    } catch (err) {
      const errorInfo = getErrorInfo(err);
      setError(errorInfo);
      console.error("Error accessing webcam:", err, errorInfo);
    } finally {
      setIsRequesting(false);
    }
  }, [onPermissionGranted]);

  useEffect(() => {
    requestWebcamAccess();
  }, [requestWebcamAccess]);

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
          "Use Chrome 120+, Edge 120+, Firefox Nightly, or Safari 26 beta+",
          "Enable JavaScript if disabled",
        ],
      },
      [ERROR_TYPES.PERMISSION]: {
        title: "🚫 Permission Issues",
        items: [
          "Click the camera icon in your browser's address bar",
          'Select "Always allow" for camera access',
          "Check browser settings → Privacy & Security → Camera",
          "Clear browser data and try again",
        ],
      },
      [ERROR_TYPES.GENERAL]: {
        title: "General Troubleshooting",
        items: [
          "Check if camera permissions are blocked in your browser",
          "Try refreshing the page and allowing access",
          "Ensure no other apps are using your camera",
          "Try using a different browser or device",
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
          aria-label="Requesting camera access"
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
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
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
    if (isRequesting) return "Requesting Camera Access";
    if (error) return "Camera Access Required";
    return "Camera Permission Required";
  };

  const getDescription = () => {
    if (isRequesting) return "Please allow camera access in your browser to continue...";
    if (error) return error.message;
    return "This app requires camera access for live video captioning. Please grant permission to continue.";
  };

  const isSecurityIssue = error?.type === ERROR_TYPES.HTTPS;
  const errorStyling = error ? getErrorStyling(isSecurityIssue) : null;

  return (
    <div
      className="absolute inset-0 text-white flex items-center justify-center p-8"
      role="dialog"
      aria-labelledby="webcam-dialog-title"
      aria-describedby="webcam-dialog-description"
    >
      <div className="max-w-md w-full space-y-6">
        <GlassContainer
          className="rounded-3xl shadow-2xl"
          bgColor={error ? GLASS_EFFECTS.COLORS.ERROR_BG : GLASS_EFFECTS.COLORS.DEFAULT_BG}
        >
          <div className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">{renderIcon()}</div>

              <h2 id="webcam-dialog-title" className="text-2xl font-bold text-gray-100">
                {getTitle()}
              </h2>
              <p id="webcam-dialog-description" className="text-gray-400">
                {getDescription()}
              </p>
            </div>

            {error && errorStyling && (
              <div className="space-y-4">
                <div className={errorStyling.container}>
                  <p className={errorStyling.text}>
                    {isSecurityIssue
                      ? "This app requires HTTPS to access your camera. Live video captioning cannot work without camera input."
                      : "Camera access is required for this app to function. Live video captioning cannot work without camera input."}
                  </p>
                </div>

                <GlassButton
                  onClick={requestWebcamAccess}
                  disabled={isRequesting}
                  className="px-6 py-3"
                  aria-label="Try again to request camera access"
                >
                  Try Again
                </GlassButton>
              </div>
            )}

            {isRequesting && (
              <p className="text-sm text-gray-500">
                If you don't see a permission dialog, check your browser settings or try refreshing the page.
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
