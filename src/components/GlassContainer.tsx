import { useRef, useCallback, type ReactNode } from "react";
import type { GlassEffectProps } from "../types";
import GlassFilters from "./GlassFilters";

interface GlassContainerProps extends GlassEffectProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  style?: React.CSSProperties;
}

export default function GlassContainer({
  children,
  className = "",
  bgColor = "rgba(0, 0, 0, 0.25)",
  highlight = "rgba(255, 255, 255, 0.15)",
  onClick,
  onMouseDown,
  role,
  style,
  ...ariaProps
}: GlassContainerProps) {
  const specularRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!specularRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    specularRef.current.style.background = `radial-gradient(
      circle at ${x}px ${y}px,
      rgba(255,255,255,0.15) 0%,
      rgba(255,255,255,0.05) 30%,
      rgba(255,255,255,0) 60%
    )`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (specularRef.current) {
      specularRef.current.style.background = "none";
    }
  }, []);

  return (
    <div
      className={`glass-container relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onMouseDown={onMouseDown}
      role={role}
      style={
        {
          "--bg-color": bgColor,
          "--highlight": highlight,
          "--text": "#ffffff",
          ...style,
        } as React.CSSProperties
      }
      {...ariaProps}
    >
      <GlassFilters />
      {/* Glass layers */}
      <div
        className="glass-filter absolute inset-0 backdrop-blur-md z-10"
        style={{
          filter: "url(#glass-distortion) saturate(120%) brightness(1.15)",
          borderRadius: "inherit",
        }}
      />
      <div
        className="glass-overlay absolute inset-0 z-20"
        style={{
          background: "var(--bg-color)",
          borderRadius: "inherit",
        }}
      />
      <div
        ref={specularRef}
        className="glass-specular absolute inset-0 z-30"
        style={{
          boxShadow: "inset 1px 1px 1px var(--highlight)",
          borderRadius: "inherit",
        }}
      />

      {/* Content */}
      <div className="glass-content relative z-40">{children}</div>
    </div>
  );
}
