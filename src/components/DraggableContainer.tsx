import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

import { LAYOUT } from "../constants";

interface DraggableContainerProps {
  children: ReactNode;
  initialPosition: "bottom-left" | "bottom-right" | { x: number; y: number };
  className?: string;
  onDimensionsReady?: (dimensions: { width: number; height: number }) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

const clampPosition = (position: Position, maxX: number, maxY: number): Position => ({
  x: Math.max(0, Math.min(position.x, maxX)),
  y: Math.max(0, Math.min(position.y, maxY)),
});

const getBasePosition = (position: "bottom-left" | "bottom-right", dimensions: Dimensions): Position => {
  const { width, height } = dimensions;

  switch (position) {
    case "bottom-left":
      return {
        x: LAYOUT.MARGINS.DEFAULT,
        y: window.innerHeight - height - LAYOUT.MARGINS.BOTTOM,
      };
    case "bottom-right":
      return {
        x: window.innerWidth - width - LAYOUT.MARGINS.DEFAULT,
        y: window.innerHeight - height - LAYOUT.MARGINS.BOTTOM,
      };
  }
};

export default function DraggableContainer({
  children,
  initialPosition,
  className = "",
  onDimensionsReady,
}: DraggableContainerProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [relativeOffset, setRelativeOffset] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback((): Position => {
    if (!containerRef.current || dimensions.width === 0) return { x: 0, y: 0 };

    if (typeof initialPosition === "object") {
      return initialPosition;
    }

    const basePosition = getBasePosition(initialPosition, dimensions);

    return hasBeenDragged
      ? {
          x: basePosition.x + relativeOffset.x,
          y: basePosition.y + relativeOffset.y,
        }
      : basePosition;
  }, [dimensions, initialPosition, hasBeenDragged, relativeOffset]);

  const updateDimensions = useCallback(
    (newDimensions: Dimensions) => {
      setDimensions(newDimensions);

      if (onDimensionsReady && !hasBeenDragged) {
        onDimensionsReady(newDimensions);
      }
    },
    [onDimensionsReady, hasBeenDragged],
  );

  const constrainToViewport = useCallback((pos: Position) => {
    if (!containerRef.current) return pos;

    const maxX = window.innerWidth - containerRef.current.offsetWidth;
    const maxY = window.innerHeight - containerRef.current.offsetHeight;

    return clampPosition(pos, maxX, maxY);
  }, []);

  useEffect(() => {
    if (!isInitialized && dimensions.width > 0 && !hasBeenDragged) {
      const newPosition = calculatePosition();
      setPosition(constrainToViewport(newPosition));
      setIsInitialized(true);
    }
  }, [isInitialized, dimensions.width, hasBeenDragged, calculatePosition, constrainToViewport]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = { width: rect.width, height: rect.height };

      updateDimensions(newDimensions);
      setPosition((prev) => constrainToViewport(prev));
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [updateDimensions, constrainToViewport]);

  useEffect(() => {
    const handleResize = () => {
      const newPosition = calculatePosition();
      setPosition(constrainToViewport(newPosition));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePosition, constrainToViewport]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      setPosition(constrainToViewport(newPosition));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setHasBeenDragged(true);

      if (containerRef.current && typeof initialPosition !== "object") {
        const basePosition = getBasePosition(initialPosition, dimensions);
        setRelativeOffset({
          x: position.x - basePosition.x,
          y: position.y - basePosition.y,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, position, initialPosition, dimensions, constrainToViewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 ${className} ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.2s ease",
        opacity: isInitialized ? 1 : 0,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}
