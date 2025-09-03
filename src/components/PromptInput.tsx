import { useState, useRef, useEffect } from "react";
import { PROMPTS } from "../constants";
import GlassContainer from "./GlassContainer";

interface PromptInputProps {
  onPromptChange: (prompt: string) => void;
  defaultPrompt?: string;
}

export default function PromptInput({ onPromptChange, defaultPrompt = PROMPTS.default }: PromptInputProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 200);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    onPromptChange(prompt);
    resizeTextarea();
  }, [prompt, onPromptChange]);

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputClick = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (!e.relatedTarget || !containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearInput = () => {
    setPrompt("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div
      ref={containerRef}
      className="w-[420px] relative"
      style={
        {
          "--input-bg": "rgba(0, 0, 0, 0.2)",
          "--input-border": "rgba(255, 255, 255, 0.1)",
        } as React.CSSProperties
      }
    >
      {/* Suggestions Panel */}
      <div
        className={`absolute bottom-full left-0 right-0 mb-2 ${
          showSuggestions ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <GlassContainer className="rounded-2xl shadow-2xl">
          <div
            className={`p-5 text-white transition-opacity duration-100 ${
              showSuggestions ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="suggestion-group">
              <h4 className="text-sm mb-3 opacity-70 font-medium">Suggested Prompts</h4>
              <ul className="space-y-1">
                {PROMPTS.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }
                    }}
                    className="py-2 px-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-200 hover:bg-white/20 hover:translate-x-1 hover:shadow-sm focus:bg-white/20 focus:translate-x-1 focus:outline-none"
                  >
                    <span className="opacity-70 text-sm transition-all duration-200 hover:opacity-100">→</span>
                    <span className="text-sm transition-all duration-200 hover:text-white/90">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassContainer>
      </div>

      {/* Input Container */}
      <GlassContainer className="rounded-2xl shadow-2xl">
        <div className="text-white">
          <div className="search-container relative p-5 flex items-center transition-all duration-400">
            <div className="relative w-full">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onClick={handleInputClick}
                className="search-input w-full py-3 pl-4 pr-8 rounded-xl text-white text-base transition-all duration-400 border resize-none focus:outline-none focus:-translate-y-0.5 focus:shadow-lg"
                style={{
                  background: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "#ffffff",
                  minHeight: "48px",
                  maxHeight: "200px",
                  height: "auto",
                  overflowY: "hidden",
                }}
                placeholder={PROMPTS.placeholder}
                rows={1}
              />
              {prompt && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="search-clear absolute right-3 top-2 text-white opacity-70 hover:opacity-100 hover:bg-white/10 rounded-full p-1 transition-all duration-300"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassContainer>
    </div>
  );
}
