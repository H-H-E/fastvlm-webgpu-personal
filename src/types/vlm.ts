export type VLMContextValue = {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadModel: (onProgress?: (msg: string) => void) => Promise<void>;
  runInference: (
    video: HTMLVideoElement,
    instruction: string,
    onTextUpdate?: (text: string) => void,
  ) => Promise<string>;
};
