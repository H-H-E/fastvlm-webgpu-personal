import HfIcon from "./HfIcon";
import GlassContainer from "./GlassContainer";
import GlassButton from "./GlassButton";
import { GLASS_EFFECTS } from "../constants";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="absolute inset-0 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Title Card */}
        <GlassContainer
          className="rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-200"
          role="banner"
        >
          <div className="p-8 text-center">
            <h1 className="text-5xl font-bold text-gray-100 mb-4">FastVLM WebGPU</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Real-time video captioning powered by{" "}
              <a
                href="https://huggingface.co/onnx-community/FastVLM-0.5B-ONNX"
                className="text-blue-400 underline hover:text-blue-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FastVLM-0.5B model on Hugging Face"
              >
                FastVLM-0.5B
              </a>
            </p>
          </div>
        </GlassContainer>

        {/* Webcam Status Card */}
        <GlassContainer
          bgColor={GLASS_EFFECTS.COLORS.SUCCESS_BG}
          className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-200"
          role="status"
          aria-label="Camera status"
        >
          <div className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-green-400 font-medium">Camera ready</p>
            </div>
          </div>
        </GlassContainer>

        {/* How It Works Card */}
        <GlassContainer
          className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-200"
          role="region"
          aria-labelledby="how-it-works-title"
        >
          <div className="p-6">
            <h2 id="how-it-works-title" className="text-lg font-semibold text-gray-200 mb-4 text-center">
              How it works:
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                  1
                </div>
                <p className="text-gray-300">
                  You are about to load{" "}
                  <a
                    href="https://huggingface.co/onnx-community/FastVLM-0.5B-ONNX"
                    className="text-blue-400 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FastVLM-0.5B
                  </a>
                  , a powerful multimodal model optimized for in-browser inference.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                  2
                </div>
                <p className="text-gray-300">
                  Everything runs entirely in your browser with{" "}
                  <a
                    href="https://github.com/huggingface/transformers.js"
                    className="text-blue-400 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HfIcon className="inline-flex w-7 h-7 pointer-events-none" />
                    Transformers.js
                  </a>{" "}
                  and ONNX Runtime Web, meaning no data is sent to a server. It can even run offline!
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                  3
                </div>
                <p className="text-gray-300">Get started by clicking the button below.</p>
              </div>
            </div>
          </div>
        </GlassContainer>

        {/* Start Button */}
        <div className="flex flex-col items-center space-y-4">
          <GlassButton
            onClick={onStart}
            className="px-8 py-4 rounded-2xl"
            aria-label="Start live captioning with AI model"
          >
            <span className="font-semibold text-lg">Start Live Captioning</span>
          </GlassButton>

          <p className="text-sm text-gray-400 opacity-80">AI model will load when you click start</p>
        </div>
      </div>
    </div>
  );
}
