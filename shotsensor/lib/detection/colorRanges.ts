/**
 * Color range definitions for pool and snooker balls
 * HSV color space for better lighting tolerance
 */

import { ColorRange, HSVColor } from '@/types';

// ============================================
// POOL BALL COLOR RANGES (8-Ball)
// ============================================

export const POOL_COLOR_RANGES: ColorRange[] = [
  // Cue ball (white)
  {
    name: 'Cue Ball',
    ballType: 'cue',
    hsvMin: { h: 0, s: 0, v: 80 },
    hsvMax: { h: 360, s: 15, v: 100 },
    confidence: 0.9,
  },

  // 8-ball (black)
  {
    name: '8-Ball',
    ballType: 'eight',
    hsvMin: { h: 0, s: 0, v: 0 },
    hsvMax: { h: 360, s: 25, v: 25 },
    confidence: 0.85,
  },

  // Solid balls (1-7)
  // Ball 1 - Yellow
  {
    name: 'Ball 1 (Yellow)',
    ballType: 'solids',
    hsvMin: { h: 45, s: 60, v: 70 },
    hsvMax: { h: 65, s: 100, v: 100 },
    confidence: 0.8,
  },

  // Ball 2 - Blue
  {
    name: 'Ball 2 (Blue)',
    ballType: 'solids',
    hsvMin: { h: 200, s: 50, v: 40 },
    hsvMax: { h: 240, s: 100, v: 90 },
    confidence: 0.8,
  },

  // Ball 3 - Red
  {
    name: 'Ball 3 (Red)',
    ballType: 'solids',
    hsvMin: { h: 0, s: 60, v: 40 },
    hsvMax: { h: 15, s: 100, v: 90 },
    confidence: 0.8,
  },

  // Ball 4 - Purple
  {
    name: 'Ball 4 (Purple)',
    ballType: 'solids',
    hsvMin: { h: 270, s: 40, v: 30 },
    hsvMax: { h: 300, s: 80, v: 70 },
    confidence: 0.75,
  },

  // Ball 5 - Orange
  {
    name: 'Ball 5 (Orange)',
    ballType: 'solids',
    hsvMin: { h: 15, s: 60, v: 60 },
    hsvMax: { h: 35, s: 100, v: 100 },
    confidence: 0.8,
  },

  // Ball 6 - Green
  {
    name: 'Ball 6 (Green)',
    ballType: 'solids',
    hsvMin: { h: 90, s: 40, v: 30 },
    hsvMax: { h: 150, s: 80, v: 70 },
    confidence: 0.75,
  },

  // Ball 7 - Maroon/Burgundy
  {
    name: 'Ball 7 (Maroon)',
    ballType: 'solids',
    hsvMin: { h: 340, s: 50, v: 25 },
    hsvMax: { h: 360, s: 90, v: 50 },
    confidence: 0.7,
  },

  // Striped balls (9-15) - detect by presence of stripes
  // For MVP, we'll classify as "stripes" generically
  {
    name: 'Striped Ball',
    ballType: 'stripes',
    hsvMin: { h: 0, s: 20, v: 30 },
    hsvMax: { h: 360, s: 100, v: 100 },
    confidence: 0.6,
  },
];

// ============================================
// SNOOKER BALL COLOR RANGES
// ============================================

export const SNOOKER_COLOR_RANGES: ColorRange[] = [
  // Cue ball (white)
  {
    name: 'Cue Ball',
    ballType: 'cue',
    hsvMin: { h: 0, s: 0, v: 80 },
    hsvMax: { h: 360, s: 15, v: 100 },
    confidence: 0.9,
  },

  // Red balls (1 point)
  {
    name: 'Red Ball',
    ballType: 'red',
    hsvMin: { h: 0, s: 70, v: 30 },
    hsvMax: { h: 15, s: 100, v: 70 },
    confidence: 0.85,
  },

  // Yellow ball (2 points)
  {
    name: 'Yellow Ball',
    ballType: 'yellow',
    hsvMin: { h: 50, s: 70, v: 80 },
    hsvMax: { h: 70, s: 100, v: 100 },
    confidence: 0.85,
  },

  // Green ball (3 points)
  {
    name: 'Green Ball',
    ballType: 'green',
    hsvMin: { h: 100, s: 50, v: 35 },
    hsvMax: { h: 160, s: 90, v: 75 },
    confidence: 0.8,
  },

  // Brown ball (4 points)
  {
    name: 'Brown Ball',
    ballType: 'brown',
    hsvMin: { h: 20, s: 40, v: 25 },
    hsvMax: { h: 40, s: 80, v: 55 },
    confidence: 0.75,
  },

  // Blue ball (5 points)
  {
    name: 'Blue Ball',
    ballType: 'blue',
    hsvMin: { h: 200, s: 60, v: 45 },
    hsvMax: { h: 240, s: 100, v: 85 },
    confidence: 0.85,
  },

  // Pink ball (6 points)
  {
    name: 'Pink Ball',
    ballType: 'pink',
    hsvMin: { h: 320, s: 30, v: 70 },
    hsvMax: { h: 350, s: 70, v: 95 },
    confidence: 0.8,
  },

  // Black ball (7 points)
  {
    name: 'Black Ball',
    ballType: 'black',
    hsvMin: { h: 0, s: 0, v: 0 },
    hsvMax: { h: 360, s: 25, v: 20 },
    confidence: 0.85,
  },
];

/**
 * Get color ranges for the current game mode
 */
export function getColorRanges(gameMode: 'pool' | 'snooker'): ColorRange[] {
  return gameMode === 'pool' ? POOL_COLOR_RANGES : SNOOKER_COLOR_RANGES;
}

/**
 * Color to display name mapping
 */
export const BALL_COLORS: Record<string, string> = {
  cue: '#FFFFFF',
  eight: '#000000',
  solids: '#FF6B35', // Generic solid color
  stripes: '#F7B801', // Generic stripe color
  red: '#DC143C',
  yellow: '#FFD700',
  green: '#228B22',
  brown: '#8B4513',
  blue: '#4169E1',
  pink: '#FF69B4',
  black: '#000000',
};

/**
 * Snooker ball point values
 */
export const SNOOKER_POINTS: Record<string, number> = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
};
