/**
 * Ball detection using canvas-based image processing
 * Simplified approach for MVP - fast and reliable
 */

import { BallDetection, DetectionResult, GameMode } from '@/types';
import { classifyWithPattern } from './colorClassifier';

interface CircleCandidate {
  x: number;
  y: number;
  radius: number;
  score: number;
}

/**
 * Main ball detection function
 * Processes image and returns detected balls with classifications
 */
export async function detectBalls(
  imageDataUrl: string,
  gameMode: GameMode,
  onProgress?: (progress: number, stage: string) => void
): Promise<DetectionResult> {
  const startTime = performance.now();

  onProgress?.(10, 'Loading image...');

  // Load image
  const img = await loadImage(imageDataUrl);

  onProgress?.(20, 'Preprocessing image...');

  // Create canvas and get image data
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Downscale for faster processing (max 800px width)
  const scale = Math.min(1, 800 / img.width);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  onProgress?.(40, 'Detecting circles...');

  // Detect circular objects
  const circles = await detectCircles(imageData, canvas.width, canvas.height);

  onProgress?.(60, 'Classifying ball colors...');

  // Classify each detected ball
  const balls: BallDetection[] = [];

  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];

    // Classify ball type by color
    const classification = classifyWithPattern(
      imageData,
      circle.x,
      circle.y,
      circle.radius,
      gameMode
    );

    balls.push({
      id: `ball-${i}`,
      position: { x: circle.x / scale, y: circle.y / scale },
      radius: circle.radius / scale,
      confidence: classification.confidence * circle.score,
      ballType: classification.ballType,
      color: classification.hexColor,
      number: undefined, // TODO: OCR for ball numbers
    });

    onProgress?.(60 + (i / circles.length) * 30, `Classified ${i + 1}/${circles.length} balls`);
  }

  onProgress?.(100, 'Detection complete!');

  const endTime = performance.now();

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
 * Detect circles in image using edge detection and Hough-like transform
 * Simplified for MVP - focuses on finding circular objects
 */
async function detectCircles(
  imageData: ImageData,
  width: number,
  height: number
): Promise<CircleCandidate[]> {
  const circles: CircleCandidate[] = [];

  // Convert to grayscale for edge detection
  const gray = toGrayscale(imageData);

  // Apply Gaussian blur to reduce noise
  const blurred = gaussianBlur(gray, width, height, 2);

  // Detect edges using Sobel operator
  const edges = detectEdges(blurred, width, height);

  // Detect circles using simplified Hough transform
  // Expected ball radius range (in pixels, for 800px wide image)
  const minRadius = Math.floor(Math.min(width, height) * 0.02); // ~2% of image
  const maxRadius = Math.floor(Math.min(width, height) * 0.12); // ~12% of image

  // Sample grid for circle centers
  const step = Math.floor(Math.min(width, height) * 0.02); // Sample every 2%

  for (let y = maxRadius; y < height - maxRadius; y += step) {
    for (let x = maxRadius; x < width - maxRadius; x += step) {
      for (let r = minRadius; r <= maxRadius; r += 2) {
        const score = scoreCircle(edges, width, height, x, y, r);

        if (score > 0.3) { // Threshold for valid circle
          circles.push({ x, y, radius: r, score });
        }
      }
    }
  }

  // Non-maximum suppression to remove overlapping circles
  const filteredCircles = nonMaxSuppression(circles);

  // Sort by score and take top 22 (max balls in snooker)
  return filteredCircles
    .sort((a, b) => b.score - a.score)
    .slice(0, 22);
}

/**
 * Convert to grayscale
 */
function toGrayscale(imageData: ImageData): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(imageData.width * imageData.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    // Weighted grayscale conversion
    gray[i / 4] = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
  }

  return gray;
}

/**
 * Gaussian blur for noise reduction
 */
function gaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const blurred = new Uint8ClampedArray(data.length);
  const kernel = generateGaussianKernel(radius);
  const kernelSize = kernel.length;
  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let weight = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const px = x + kx;
          const py = y + ky;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = py * width + px;
            const kernelIdx = (ky + halfKernel) * kernelSize + (kx + halfKernel);
            sum += data[idx] * kernel[kernelIdx];
            weight += kernel[kernelIdx];
          }
        }
      }

      blurred[y * width + x] = Math.floor(sum / weight);
    }
  }

  return blurred;
}

/**
 * Generate Gaussian kernel
 */
function generateGaussianKernel(radius: number): number[] {
  const size = radius * 2 + 1;
  const kernel: number[] = [];
  const sigma = radius / 3;

  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      kernel.push(value);
    }
  }

  return kernel;
}

/**
 * Edge detection using Sobel operator
 */
function detectEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const edges = new Uint8ClampedArray(data.length);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);

          gx += data[idx] * sobelX[kernelIdx];
          gy += data[idx] * sobelY[kernelIdx];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Score a potential circle based on edge pixels
 */
function scoreCircle(
  edges: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number
): number {
  const samples = 24; // Sample points around circle
  let edgeCount = 0;
  let totalStrength = 0;

  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(angle) * r);
    const y = Math.round(cy + Math.sin(angle) * r);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      const edgeStrength = edges[y * width + x];
      totalStrength += edgeStrength;

      if (edgeStrength > 50) { // Threshold for edge pixel
        edgeCount++;
      }
    }
  }

  // Score based on edge pixels found and average strength
  const edgeRatio = edgeCount / samples;
  const avgStrength = totalStrength / (samples * 255);

  return (edgeRatio * 0.7 + avgStrength * 0.3);
}

/**
 * Non-maximum suppression to remove overlapping circles
 */
function nonMaxSuppression(circles: CircleCandidate[]): CircleCandidate[] {
  const filtered: CircleCandidate[] = [];

  // Sort by score descending
  const sorted = [...circles].sort((a, b) => b.score - a.score);

  for (const circle of sorted) {
    let isOverlapping = false;

    for (const kept of filtered) {
      const dx = circle.x - kept.x;
      const dy = circle.y - kept.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If centers are close and radii similar, it's an overlap
      if (dist < (circle.radius + kept.radius) * 0.5) {
        isOverlapping = true;
        break;
      }
    }

    if (!isOverlapping) {
      filtered.push(circle);
    }
  }

  return filtered;
}
