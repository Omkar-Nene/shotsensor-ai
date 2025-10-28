/**
 * Color classification for detected balls
 * Uses HSV color space for better lighting tolerance
 */

import { RGBColor, HSVColor, ColorRange, PoolBallType, SnookerBallType } from '@/types';
import { rgbToHsv, isColorInRange, getDominantColor } from '@/lib/utils/colors';
import { getColorRanges, BALL_COLORS } from './colorRanges';

interface ClassificationResult {
  ballType: PoolBallType | SnookerBallType;
  confidence: number;
  colorName: string;
  hexColor: string;
}

/**
 * Classify a ball based on its color
 */
export function classifyBallColor(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number,
  gameMode: 'pool' | 'snooker'
): ClassificationResult {
  // Get dominant color from the ball region
  const dominantRGB = getDominantColor(imageData, x, y, Math.floor(radius * 0.6));
  const dominantHSV = rgbToHsv(dominantRGB);

  // Get color ranges for current game mode
  const colorRanges = getColorRanges(gameMode);

  // Find best matching color
  let bestMatch: ColorRange | null = null;
  let bestConfidence = 0;

  for (const range of colorRanges) {
    if (isColorInRange(dominantHSV, range.hsvMin, range.hsvMax)) {
      const confidence = calculateColorConfidence(dominantHSV, range);

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = range;
      }
    }
  }

  // Default to cue ball if no match found (white is safest assumption)
  if (!bestMatch || bestConfidence < 0.3) {
    return {
      ballType: 'cue',
      confidence: 0.5,
      colorName: 'Unknown (likely Cue Ball)',
      hexColor: '#FFFFFF',
    };
  }

  return {
    ballType: bestMatch.ballType,
    confidence: bestConfidence,
    colorName: bestMatch.name,
    hexColor: BALL_COLORS[bestMatch.ballType] || '#888888',
  };
}

/**
 * Calculate confidence score for a color match
 */
function calculateColorConfidence(color: HSVColor, range: ColorRange): number {
  // Calculate how well the color fits within the range
  const hueCenter = (range.hsvMin.h + range.hsvMax.h) / 2;
  const satCenter = (range.hsvMin.s + range.hsvMax.s) / 2;
  const valCenter = (range.hsvMin.v + range.hsvMax.v) / 2;

  // Distance from center of range (normalized)
  const hueRange = Math.abs(range.hsvMax.h - range.hsvMin.h);
  const satRange = range.hsvMax.s - range.hsvMin.s;
  const valRange = range.hsvMax.v - range.hsvMin.v;

  const hueDist = Math.abs(color.h - hueCenter) / (hueRange || 1);
  const satDist = Math.abs(color.s - satCenter) / (satRange || 1);
  const valDist = Math.abs(color.v - valCenter) / (valRange || 1);

  // Weighted confidence (hue is most important)
  const distance = Math.sqrt(
    Math.pow(hueDist * 2, 2) +
    Math.pow(satDist, 2) +
    Math.pow(valDist, 2)
  );

  // Convert distance to confidence (0-1)
  const confidence = Math.max(0, 1 - distance / 2);

  // Apply base confidence from color range
  return confidence * range.confidence;
}

/**
 * Detect if a ball has stripes (for pool)
 * Analyzes edge patterns for stripe detection
 */
export function hasStripedPattern(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number
): boolean {
  // Sample colors at multiple points around the ball
  const samples = 16;
  const colors: HSVColor[] = [];

  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const sampleX = Math.round(x + Math.cos(angle) * radius * 0.7);
    const sampleY = Math.round(y + Math.sin(angle) * radius * 0.7);

    if (
      sampleX >= 0 && sampleX < imageData.width &&
      sampleY >= 0 && sampleY < imageData.height
    ) {
      const index = (sampleY * imageData.width + sampleX) * 4;
      const rgb: RGBColor = {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
      };
      colors.push(rgbToHsv(rgb));
    }
  }

  if (colors.length < samples / 2) {
    return false; // Not enough samples
  }

  // Check for alternating light/dark pattern (stripes)
  let transitions = 0;
  const threshold = 30; // Value difference threshold

  for (let i = 0; i < colors.length - 1; i++) {
    const diff = Math.abs(colors[i].v - colors[i + 1].v);
    if (diff > threshold) {
      transitions++;
    }
  }

  // If we have multiple transitions, likely striped
  return transitions >= 4;
}

/**
 * Adjust classification based on stripe detection
 */
export function classifyWithPattern(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number,
  gameMode: 'pool' | 'snooker'
): ClassificationResult {
  const baseClassification = classifyBallColor(imageData, x, y, radius, gameMode);

  // Only check for stripes in pool mode
  if (gameMode === 'pool' && baseClassification.ballType !== 'cue' && baseClassification.ballType !== 'eight') {
    const isStriped = hasStripedPattern(imageData, x, y, radius);

    if (isStriped) {
      return {
        ...baseClassification,
        ballType: 'stripes',
        colorName: baseClassification.colorName.replace('Ball', 'Striped Ball'),
        confidence: baseClassification.confidence * 0.9, // Slightly lower confidence
      };
    } else {
      return {
        ...baseClassification,
        ballType: 'solids',
        confidence: baseClassification.confidence,
      };
    }
  }

  return baseClassification;
}
