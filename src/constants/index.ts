export const GLASS_EFFECTS = {
  BASE_FREQUENCY: 0.008,
  NUM_OCTAVES: 2,
  SCALE: 77,
  COLORS: {
    DEFAULT_BG: "rgba(0, 0, 0, 0.25)",
    SUCCESS_BG: "rgba(0, 50, 0, 0.25)",
    ERROR_BG: "rgba(50, 0, 0, 0.25)",
    BUTTON_BG: "rgba(59, 130, 246, 0.25)",
    HIGHLIGHT: "rgba(255, 255, 255, 0.15)",
    TEXT: "#ffffff",
  },
} as const;

export const LAYOUT = {
  MARGINS: {
    DEFAULT: 20,
    BOTTOM: 20,
  },
  DIMENSIONS: {
    PROMPT_WIDTH: 420,
    CAPTION_WIDTH: 150,
    CAPTION_HEIGHT: 45,
  },
  TRANSITIONS: {
    SCALE_DURATION: 200,
    OPACITY_DURATION: 200,
    TRANSFORM_DURATION: 400,
  },
} as const;

export const TIMING = {
  FRAME_CAPTURE_DELAY: 50,
  VIDEO_RECOVERY_INTERVAL: 1000,
  RESIZE_DEBOUNCE: 50,
  SUGGESTION_DELAY: 50,
} as const;

const DEFAULT_PROMPT = "Describe the FPS gameplay in one sentence as a commentator.";
export const PROMPTS = {
  default: DEFAULT_PROMPT,
  placeholder: DEFAULT_PROMPT,

  suggestions: [
    DEFAULT_PROMPT,
    "What actions are happening in this FPS moment?",
    "Describe the game scene and player position.",
    "Comment on the intensity of this gameplay moment.",
    "What weapons and tactics are being used?",
    "How does this FPS scene make you feel?",
  ],

  fallbackCaption: "Waiting for first caption...",
  processingMessage: "Starting FPS analysis...",
} as const;
