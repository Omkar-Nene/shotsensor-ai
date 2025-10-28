/**
 * Canvas overlay component to visualize detected balls
 */

'use client';

import { useEffect, useRef } from 'react';
import { DetectionResult } from '@/types';

interface BallOverlayProps {
  imageDataUrl: string;
  detectionResult: DetectionResult;
  onBallClick?: (ballId: string) => void;
}

export default function BallOverlay({
  imageDataUrl,
  detectionResult,
  onBallClick,
}: BallOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw image
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw detected balls
      drawBalls(ctx, detectionResult);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, detectionResult]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onBallClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get click position in canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Check if clicked on any ball
    for (const ball of detectionResult.balls) {
      const dx = x - ball.position.x;
      const dy = y - ball.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= ball.radius) {
        onBallClick(ball.id);
        break;
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-auto rounded-lg shadow-2xl cursor-pointer"
      />
      <div className="mt-4 text-center text-sm text-blue-200">
        <p>✓ Detected {detectionResult.balls.length} balls</p>
        <p className="text-xs text-blue-300/70">
          Processing time: {Math.round(detectionResult.processingTimeMs)}ms
        </p>
      </div>
    </div>
  );
}

/**
 * Draw detected balls on canvas
 */
function drawBalls(ctx: CanvasRenderingContext2D, result: DetectionResult) {
  result.balls.forEach((ball, index) => {
    const { position, radius, confidence, color, ballType } = ball;

    // Confidence-based styling
    const strokeColor = confidence > 0.7 ? '#10B981' : confidence > 0.5 ? '#F59E0B' : '#EF4444';
    const strokeWidth = confidence > 0.7 ? 4 : confidence > 0.5 ? 3 : 2;

    // Draw circle outline
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw semi-transparent fill
    ctx.fillStyle = `${strokeColor}33`; // 20% opacity
    ctx.fill();

    // Draw ball type label
    const labelY = position.y - radius - 10;

    // Label background
    ctx.font = 'bold 16px sans-serif';
    const label = getBallLabel(ballType);
    const metrics = ctx.measureText(label);
    const labelWidth = metrics.width + 16;
    const labelHeight = 28;

    ctx.fillStyle = strokeColor;
    ctx.fillRect(
      position.x - labelWidth / 2,
      labelY - labelHeight / 2,
      labelWidth,
      labelHeight
    );

    // Label text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, position.x, labelY);

    // Draw confidence indicator
    const confText = `${Math.round(confidence * 100)}%`;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(confText, position.x, position.y + radius + 15);

    // Draw ball number
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(`#${index + 1}`, position.x, position.y);
    ctx.fillText(`#${index + 1}`, position.x, position.y);
  });
}

/**
 * Get display label for ball type
 */
function getBallLabel(ballType: string): string {
  const labels: Record<string, string> = {
    cue: 'CUE',
    eight: '8-BALL',
    solids: 'SOLID',
    stripes: 'STRIPE',
    red: 'RED',
    yellow: 'YELLOW',
    green: 'GREEN',
    brown: 'BROWN',
    blue: 'BLUE',
    pink: 'PINK',
    black: 'BLACK',
  };

  return labels[ballType] || 'BALL';
}
