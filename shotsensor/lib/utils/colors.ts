/**
 * Color utility functions for ball detection
 * HSV color space is better for varying lighting conditions
 */

import { RGBColor, HSVColor } from '@/types';

/**
 * Convert RGB to HSV color space
 * HSV is better for color detection under varying lighting
 */
export function rgbToHsv(rgb: RGBColor): HSVColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100,
  };
}

/**
 * Convert HSV to RGB color space
 */
export function hsvToRgb(hsv: HSVColor): RGBColor {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Check if an HSV color is within a given range
 */
export function isColorInRange(color: HSVColor, min: HSVColor, max: HSVColor): boolean {
  // Handle hue wrapping (red is at 0 and 360)
  let hueInRange = false;
  if (min.h <= max.h) {
    hueInRange = color.h >= min.h && color.h <= max.h;
  } else {
    // Hue wraps around (e.g., 350-10 for red)
    hueInRange = color.h >= min.h || color.h <= max.h;
  }

  const saturationInRange = color.s >= min.s && color.s <= max.s;
  const valueInRange = color.v >= min.v && color.v <= max.v;

  return hueInRange && saturationInRange && valueInRange;
}

/**
 * Calculate color distance in HSV space
 * Useful for confidence scoring
 */
export function colorDistance(color1: HSVColor, color2: HSVColor): number {
  // Hue is circular, calculate shortest distance
  let hueDiff = Math.abs(color1.h - color2.h);
  if (hueDiff > 180) {
    hueDiff = 360 - hueDiff;
  }
  hueDiff = hueDiff / 180; // Normalize to 0-1

  const satDiff = Math.abs(color1.s - color2.s) / 100;
  const valDiff = Math.abs(color1.v - color2.v) / 100;

  // Weighted Euclidean distance
  return Math.sqrt(
    Math.pow(hueDiff * 2, 2) + // Hue is most important
    Math.pow(satDiff, 2) +
    Math.pow(valDiff, 2)
  );
}

/**
 * RGB to hex string
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Hex to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Get dominant color from an image region
 * Useful for analyzing detected ball regions
 */
export function getDominantColor(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number
): RGBColor {
  const pixels: RGBColor[] = [];

  // Sample pixels in a circle
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const pixelX = Math.round(x + dx);
        const pixelY = Math.round(y + dy);

        if (
          pixelX >= 0 && pixelX < imageData.width &&
          pixelY >= 0 && pixelY < imageData.height
        ) {
          const index = (pixelY * imageData.width + pixelX) * 4;
          pixels.push({
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
          });
        }
      }
    }
  }

  if (pixels.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  // Calculate average color
  const sum = pixels.reduce(
    (acc, pixel) => ({
      r: acc.r + pixel.r,
      g: acc.g + pixel.g,
      b: acc.b + pixel.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(sum.r / pixels.length),
    g: Math.round(sum.g / pixels.length),
    b: Math.round(sum.b / pixels.length),
  };
}

/**
 * Apply white balance correction
 * Useful for pool hall lighting conditions
 */
export function autoWhiteBalance(rgb: RGBColor): RGBColor {
  const avg = (rgb.r + rgb.g + rgb.b) / 3;

  if (avg === 0) return rgb;

  return {
    r: Math.min(255, Math.round((rgb.r / avg) * 128)),
    g: Math.min(255, Math.round((rgb.g / avg) * 128)),
    b: Math.min(255, Math.round((rgb.b / avg) * 128)),
  };
}
