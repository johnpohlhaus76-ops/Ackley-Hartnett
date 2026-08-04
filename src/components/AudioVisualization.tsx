"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizationProps {
  isPlaying: boolean;
  width?: number;
  height?: number;
}

export function AudioVisualization({ isPlaying, width = 200, height = 40 }: AudioVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const barCount = 20;
      const barWidth = width / barCount;
      const maxHeight = height * 0.8;

      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * maxHeight;
        const x = i * barWidth + barWidth / 4;
        const y = (height - barHeight) / 2;

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
        gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.8)");
        gradient.addColorStop(1, "rgba(139, 92, 246, 0.8)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth / 2, barHeight);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
      style={{
        border: isPlaying ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid transparent",
      }}
    />
  );
}
