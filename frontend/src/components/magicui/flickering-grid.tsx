"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.1,
  color = "#ffffff",
  width,
  height,
  className,
  maxOpacity = 0.3,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const opacitiesRef = useRef<Float32Array | null>(null);

  // Parse color to rgb components once
  const parseColor = useCallback((hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16),
      ];
    }
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [r, g, b] = parseColor(color);

    let cols: number;
    let rows: number;

    const setup = () => {
      const w = width ?? container.clientWidth;
      const h = height ?? container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      cols = Math.ceil(w / (squareSize + gridGap));
      rows = Math.ceil(h / (squareSize + gridGap));
      opacitiesRef.current = new Float32Array(cols * rows).map(
        () => Math.random() * maxOpacity
      );
    };

    setup();

    const draw = () => {
      const w = width ?? container.clientWidth;
      const h = height ?? container.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const ops = opacitiesRef.current!;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          // Flicker
          if (Math.random() < flickerChance) {
            ops[idx] = Math.random() * maxOpacity;
          }
          ctx.fillStyle = `rgba(${r},${g},${b},${ops[idx]})`;
          ctx.fillRect(
            i * (squareSize + gridGap),
            j * (squareSize + gridGap),
            squareSize,
            squareSize
          );
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      setup();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [squareSize, gridGap, flickerChance, color, width, height, maxOpacity, parseColor]);

  return (
    <div ref={containerRef} className={cn("w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        style={{ display: "block" }}
      />
    </div>
  );
}
