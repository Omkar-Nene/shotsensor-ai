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
 * Two-phase detection: Find cue ball first, then use its size to find other balls
 */
function findCirclesSimple(
  imageData: ImageData,
  width: number,
  height: number
): Circle[] {
  console.log('=== PHASE 1: Finding cue ball ===');

  // Expected ball size range (as percentage of image)
  const minRadius = Math.floor(Math.min(width, height) * 0.015); // 1.5%
  const maxRadius = Math.floor(Math.min(width, height) * 0.15);  // 15%

  console.log('Detection params:', {
    imageSize: `${width}x${height}`,
    minRadius,
    maxRadius,
  });

  // Create edge map
  const edges = detectEdgesSimple(imageData, width, height);

  // PHASE 1: Find the cue ball (white, brightest ball)
  const cueBall = findCueBall(imageData, edges, width, height, minRadius, maxRadius);

  if (!cueBall) {
    console.warn('Could not find cue ball! Falling back to standard detection.');
    return findCirclesStandard(imageData, edges, width, height, minRadius, maxRadius);
  }

  console.log(`✓ Found cue ball at (${cueBall.x}, ${cueBall.y}) radius=${cueBall.radius}`);
  console.log('=== PHASE 2: Finding other balls using cue ball size ===');

  // PHASE 2: Use cue ball radius (±20%) to find other balls
  const targetRadius = cueBall.radius;
  const radiusMin = Math.floor(targetRadius * 0.8);
  const radiusMax = Math.ceil(targetRadius * 1.2);

  console.log(`Searching for balls with radius ${radiusMin}-${radiusMax}px`);

  const allBalls: Circle[] = [cueBall];
  const step = Math.floor(targetRadius * 0.6); // Search every 60% of ball width

  for (let y = radiusMax; y < height - radiusMax; y += step) {
    for (let x = radiusMax; x < width - radiusMax; x += step) {

      // Skip if too close to cue ball
      const distToCue = Math.sqrt((x - cueBall.x) ** 2 + (y - cueBall.y) ** 2);
      if (distToCue < targetRadius * 1.5) continue;

      // Try radii around the target
      for (let r = radiusMin; r <= radiusMax; r += 2) {
        const score = scoreCircleForBall(
          imageData,
          edges,
          width,
          height,
          x,
          y,
          r
        );

        if (score > 0.25) { // Lower threshold since we know the size
          allBalls.push({ x, y, radius: r, score });
        }
      }
    }
  }

  console.log('Candidate balls before NMS:', allBalls.length);

  // Remove overlapping circles
  const filtered = nonMaximumSuppression(allBalls);

  console.log('Final balls after NMS:', filtered.length);

  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, 22); // Max balls in snooker
}

/**
 * Find the cue ball (white, brightest ball)
 */
function findCueBall(
  imageData: ImageData,
  edges: Uint8Array,
  width: number,
  height: number,
  minRadius: number,
  maxRadius: number
): Circle | null {
  const candidates: Circle[] = [];
  const step = Math.floor(minRadius * 0.8);

  for (let y = maxRadius; y < height - maxRadius; y += step) {
    for (let x = maxRadius; x < width - maxRadius; x += step) {
      // Get pixel color
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Look for white pixels (cue ball)
      if (brightness > 180 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
        // Found potential cue ball center - try different radii
        for (let rad = minRadius; rad <= maxRadius; rad += Math.max(2, Math.floor(rad * 0.2))) {
          const score = scoreCircleForBall(imageData, edges, width, height, x, y, rad);
          if (score > 0.3) {
            candidates.push({ x, y, radius: rad, score: score * 1.2 }); // Boost cue ball score
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Return brightest candidate
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

/**
 * Standard detection fallback if cue ball not found
 */
function findCirclesStandard(
  imageData: ImageData,
  edges: Uint8Array,
  width: number,
  height: number,
  minRadius: number,
  maxRadius: number
): Circle[] {
  const circles: Circle[] = [];
  const step = Math.floor(minRadius * 0.8);

  for (let y = maxRadius; y < height - maxRadius; y += step) {
    for (let x = maxRadius; x < width - maxRadius; x += step) {
      for (let r = minRadius; r <= maxRadius; r += Math.max(2, Math.floor(r * 0.2))) {
        const score = scoreCircleForBall(imageData, edges, width, height, x, y, r);
        if (score > 0.30) {
          circles.push({ x, y, radius: r, score });
        }
      }
    }
  }

  const filtered = nonMaximumSuppression(circles);
  return filtered.sort((a, b) => b.score - a.score).slice(0, 22);
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
 * Score a potential circle as a ball
 */
function scoreCircleForBall(
  imageData: ImageData,
  edges: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number
): number {
  const samples = 24;
  let edgeVotes = 0;

  // Get center color
  const centerIdx = (cy * width + cx) * 4;
  const centerR = imageData.data[centerIdx];
  const centerG = imageData.data[centerIdx + 1];
  const centerB = imageData.data[centerIdx + 2];
  const centerA = imageData.data[centerIdx + 3];

  // Skip transparent or invalid pixels
  if (centerA < 200) return 0;

  const centerBrightness = (centerR + centerG + centerB) / 3;

  // Filter out ONLY obvious pockets (extremely dark)
  if (centerBrightness < 15) return 0;

  // Filter out table felt
  const isTableFelt = checkIfTableFelt(centerR, centerG, centerB);
  if (isTableFelt) return 0;

  // Check if near image border (pockets are usually at edges)
  const margin = r * 2;
  if (cx < margin || cx > width - margin || cy < margin || cy > height - margin) {
    if (centerBrightness < 25) return 0;
  }

  const perimeter: Array<{r: number, g: number, b: number}> = [];

  // Sample around perimeter
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const px = Math.round(cx + Math.cos(angle) * r);
    const py = Math.round(cy + Math.sin(angle) * r);

    if (px >= 0 && px < width && py >= 0 && py < height) {
      // Check edge strength
      const edgeStrength = edges[py * width + px];
      if (edgeStrength > 40) {
        edgeVotes++;
      }

      // Collect perimeter colors
      const idx = (py * width + px) * 4;
      perimeter.push({
        r: imageData.data[idx],
        g: imageData.data[idx + 1],
        b: imageData.data[idx + 2],
      });
    }
  }

  // Need decent edge detection
  const edgeScore = edgeVotes / samples;
  if (edgeScore < 0.20) return 0; // More lenient

  // Check color consistency (balls are uniformly colored)
  let totalColorDiff = 0;
  for (const p of perimeter) {
    const diff = Math.abs(p.r - centerR) + Math.abs(p.g - centerG) + Math.abs(p.b - centerB);
    totalColorDiff += diff;
  }
  const avgColorDiff = totalColorDiff / perimeter.length;

  // Balls should be fairly uniform in color
  let colorConsistency = 0;
  if (avgColorDiff < 120) { // More lenient
    colorConsistency = 1 - (avgColorDiff / 120);
  } else {
    return 0;
  }

  // Check if it has ball-like colors
  const hasBallColor = checkIfBallColor(centerR, centerG, centerB, centerBrightness);
  if (!hasBallColor) return 0;

  // Calculate final score
  const finalScore = (edgeScore * 0.5) + (colorConsistency * 0.5);

  return finalScore;
}

/**
 * Check if color is table felt (cyan/green)
 */
function checkIfTableFelt(r: number, g: number, b: number): boolean {
  // Pool table felt is typically cyan/turquoise/green
  // High in green and blue, lower in red, medium-high brightness

  const brightness = (r + g + b) / 3;

  // Cyan/turquoise felt (common in pool)
  if (g > 100 && b > 100 && r < 100 && brightness > 100) {
    return true;
  }

  // Green felt (common in snooker)
  if (g > 120 && g > r * 1.5 && g > b * 1.2 && brightness > 80) {
    return true;
  }

  return false;
}

/**
 * Check if color could be a pool/snooker ball
 */
function checkIfBallColor(r: number, g: number, b: number, brightness: number): boolean {
  // Balls are usually:
  // - White (cue ball): very bright, low saturation
  // - Colored: medium-high saturation, various hues
  // - NOT dark brown (table rails)
  // - NOT cyan/green (table felt)

  // White ball (very bright)
  if (brightness > 180 && Math.abs(r - g) < 40 && Math.abs(g - b) < 40) { // More lenient
    return true;
  }

  // Colored balls: at least one channel should be strong
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const saturation = maxChannel - minChannel;

  // Good saturation indicates a colored ball
  if (saturation > 30 && brightness > 40 && brightness < 230) { // More lenient ranges
    // Not table felt
    if (!checkIfTableFelt(r, g, b)) {
      return true;
    }
  }

  // Black/dark balls (8-ball, black in snooker)
  if (brightness < 70 && brightness > 10 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) {
    return true;
  }

  return false;
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
