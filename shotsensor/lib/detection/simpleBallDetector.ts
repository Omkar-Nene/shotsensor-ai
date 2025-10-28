/**
 * Simplified ball detector for MVP - More permissive detection
 * This version prioritizes finding circles over perfect accuracy
 */

import { BallDetection, DetectionResult, GameMode } from '@/types';
import { classifyBallColor } from './colorClassifier';
import { rgbToHsv } from '@/lib/utils/colors';

interface Circle {
  x: number;
  y: number;
  radius: number;
  score: number;
}

/**
 * Simplified ball detection - focuses on finding circles quickly
 */
export async function detectBalls(
  imageDataUrl: string,
  gameMode: GameMode,
  onProgress?: (progress: number, stage: string) => void
): Promise<DetectionResult> {
  const startTime = performance.now();

  onProgress?.(10, 'Loading image...');
  const img = await loadImage(imageDataUrl);

  onProgress?.(30, 'Analyzing image...');

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Scale down for faster processing
  const maxSize = 600;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  onProgress?.(50, 'Looking for circular objects...');

  // Find circles using a grid-based approach
  const circles = findCirclesSimple(imageData, canvas.width, canvas.height);

  console.log('Found circles:', circles.length);

  onProgress?.(70, 'Classifying ball colors...');

  // Classify each circle
  const balls: BallDetection[] = [];

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];

    // Get classification
    const classification = classifyBallColor(
      imageData,
      circle.x,
      circle.y,
      circle.radius,
      gameMode
    );

    balls.push({
      id: `ball-${i}`,
      position: {
        x: circle.x / scale,
        y: circle.y / scale
      },
      radius: circle.radius / scale,
      confidence: classification.confidence * 0.8, // Slightly lower confidence for MVP
      ballType: classification.ballType,
      color: classification.hexColor,
      number: undefined,
    });

    onProgress?.(70 + (i / circles.length) * 20, `Classified ${i + 1}/${circles.length} balls`);
  }

  onProgress?.(95, 'Finalizing...');

  const endTime = performance.now();

  console.log('Detection complete:', {
    totalBalls: balls.length,
    processingTime: endTime - startTime,
    imageSize: `${canvas.width}x${canvas.height}`,
  });

  return {
    balls,
    imageWidth: img.width,
    imageHeight: img.height,
    timestamp: Date.now(),
    processingTimeMs: endTime - startTime,
  };
}

/**
 * Load image from data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Simplified circle detection using color-based approach
 * Looks for round, colored objects
 */
function findCirclesSimple(
  imageData: ImageData,
  width: number,
  height: number
): Circle[] {
  const circles: Circle[] = [];

  // Expected ball size range (as percentage of image)
  const minRadius = Math.floor(Math.min(width, height) * 0.015); // 1.5%
  const maxRadius = Math.floor(Math.min(width, height) * 0.15);  // 15%

  console.log('Detection params:', {
    imageSize: `${width}x${height}`,
    minRadius,
    maxRadius,
    step: Math.floor(minRadius * 0.8)
  });

  // Create edge map
  const edges = detectEdgesSimple(imageData, width, height);

  // Sample grid - check every ball-width distance
  const step = Math.floor(minRadius * 0.8);

  for (let y = maxRadius; y < height - maxRadius; y += step) {
    for (let x = maxRadius; x < width - maxRadius; x += step) {

      // Try different radii
      for (let r = minRadius; r <= maxRadius; r += Math.max(2, Math.floor(r * 0.2))) {

        // Check if this looks like a circle
        const score = scoreCircleSimple(
          imageData,
          edges,
          width,
          height,
          x,
          y,
          r
        );

        if (score > 0.25) { // Lower threshold for MVP
          circles.push({ x, y, radius: r, score });
        }
      }
    }
  }

  console.log('Candidate circles before NMS:', circles.length);

  // Remove overlapping circles
  const filtered = nonMaximumSuppression(circles);

  console.log('Circles after NMS:', filtered.length);

  // Return top circles
  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, 22); // Max balls in snooker
}

/**
 * Simple edge detection
 */
function detectEdgesSimple(
  imageData: ImageData,
  width: number,
  height: number
): Uint8Array {
  const edges = new Uint8Array(width * height);
  const data = imageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Simple gradient calculation
      const right = (y * width + x + 1) * 4;
      const down = ((y + 1) * width + x) * 4;

      const gx = Math.abs(data[right] - data[idx]);
      const gy = Math.abs(data[down] - data[idx]);

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Score a potential circle - simplified version
 */
function scoreCircleSimple(
  imageData: ImageData,
  edges: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number
): number {
  const samples = 16;
  let edgeVotes = 0;
  let colorConsistency = 0;

  // Get center color
  const centerIdx = (cy * width + cx) * 4;
  const centerR = imageData.data[centerIdx];
  const centerG = imageData.data[centerIdx + 1];
  const centerB = imageData.data[centerIdx + 2];

  // Check if center is not white/black table surface
  const centerBrightness = (centerR + centerG + centerB) / 3;
  if (centerBrightness < 30 || centerBrightness > 230) {
    return 0; // Likely table surface
  }

  const colors: number[] = [];

  // Sample around perimeter
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const px = Math.round(cx + Math.cos(angle) * r);
    const py = Math.round(cy + Math.sin(angle) * r);

    if (px >= 0 && px < width && py >= 0 && py < height) {
      // Check edge strength
      const edgeStrength = edges[py * width + px];
      if (edgeStrength > 30) {
        edgeVotes++;
      }

      // Check color consistency
      const idx = (py * width + px) * 4;
      const sampleR = imageData.data[idx];
      const sampleG = imageData.data[idx + 1];
      const sampleB = imageData.data[idx + 2];

      const colorDiff = Math.abs(sampleR - centerR) +
                       Math.abs(sampleG - centerG) +
                       Math.abs(sampleB - centerB);

      colors.push(colorDiff);
    }
  }

  // Calculate average color difference
  const avgColorDiff = colors.reduce((a, b) => a + b, 0) / colors.length;

  // Balls should have relatively consistent color
  if (avgColorDiff < 100) {
    colorConsistency = 1 - (avgColorDiff / 100);
  }

  // Calculate score
  const edgeScore = edgeVotes / samples;
  const finalScore = (edgeScore * 0.4) + (colorConsistency * 0.6);

  return finalScore;
}

/**
 * Non-maximum suppression
 */
function nonMaximumSuppression(circles: Circle[]): Circle[] {
  if (circles.length === 0) return [];

  const sorted = [...circles].sort((a, b) => b.score - a.score);
  const keep: Circle[] = [];

  for (const circle of sorted) {
    let overlaps = false;

    for (const kept of keep) {
      const dx = circle.x - kept.x;
      const dy = circle.y - kept.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = (circle.radius + kept.radius) * 0.6;

      if (dist < minDist) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      keep.push(circle);
    }
  }

  return keep;
}
