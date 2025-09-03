import { type ReactNode } from "react";
import GlassContainer from "./GlassContainer";
import { GLASS_EFFECTS } from "../constants";

interface GlassButtonProps {
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  bgColor?: string;
  "aria-label"?: string;
}

export default function GlassButton({
  children,
  onClick,
  className = "",
  disabled = false,
  bgColor = GLASS_EFFECTS.COLORS.BUTTON_BG,
  ...ariaProps
}: GlassButtonProps) {
  return (
    <GlassContainer bgColor={bgColor} className="rounded-xl">
      <button
        className={`px-4 py-2 border-none cursor-pointer bg-transparent transition-transform duration-200 outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
        } ${className}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        {...ariaProps}
      >
        <div className="font-medium text-white">{children}</div>
      </button>
    </GlassContainer>
  );
}
