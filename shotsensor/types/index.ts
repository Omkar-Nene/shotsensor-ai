/**
 * Core type definitions for ShotSensor
 * Mobile-first AI Pool/Snooker Shot Recommender
 */

// ============================================
// GAME TYPES
// ============================================

export type GameMode = 'pool' | 'snooker';

export type PoolBallType = 'stripes' | 'solids' | 'cue' | 'eight';

export type SnookerBallType = 'cue' | 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';

// ============================================
// BALL DETECTION TYPES
// ============================================

export interface Point {
  x: number;
  y: number;
}

export interface BallDetection {
  id: string;
  position: Point; // Center of ball in image coordinates
  radius: number; // Radius in pixels
  confidence: number; // 0-1 confidence score
  ballType: PoolBallType | SnookerBallType;
  color: string; // Hex color code
  number?: number; // Ball number (1-15 for pool, points for snooker)
  isUserBall?: boolean; // For pool: true if this is player's ball type
}

export interface DetectionResult {
  balls: BallDetection[];
  imageWidth: number;
  imageHeight: number;
  timestamp: number;
  processingTimeMs: number;
}

// ============================================
// SHOT RECOMMENDATION TYPES
// ============================================

export interface ShotTrajectory {
  cueBallPath: Point[]; // Path of cue ball from start to object ball
  objectBallPath: Point[]; // Path of object ball to pocket
  contactPoint: Point; // Where cue ball hits object ball
  targetPocket: Point; // Center of target pocket
  pocketName: string; // e.g., "Top Left Corner"
}

export interface ShotRecommendation {
  id: string;
  rank: number; // 1 = best shot, 2 = second best, 3 = third best
  targetBall: BallDetection;
  trajectory: ShotTrajectory;
  difficulty: number; // 1-10 scale
  successProbability: number; // 0-100 percentage
  reasoning: string; // Human-readable explanation
  shotType: 'pot' | 'safety' | 'positional';
  cueAction: {
    spin: 'top' | 'center' | 'bottom' | 'left' | 'right';
    power: 'soft' | 'medium' | 'hard';
    elevation: number; // 0-90 degrees
  };
}

// ============================================
// GAME STATE TYPES
// ============================================

export interface PoolGameState {
  mode: 'pool';
  playerBallType: PoolBallType; // 'stripes' or 'solids'
  eightBallPotted: boolean;
  remainingBalls: {
    player: BallDetection[];
    opponent: BallDetection[];
    eight: BallDetection | null;
  };
}

export interface SnookerGameState {
  mode: 'snooker';
  currentTarget: 'red' | 'color'; // Snooker rule: alternate red/color
  redCount: number;
  score: number;
  remainingBalls: {
    reds: BallDetection[];
    colors: BallDetection[];
  };
}

export type GameState = PoolGameState | SnookerGameState;

// ============================================
// UI STATE TYPES
// ============================================

export interface CameraState {
  isActive: boolean;
  isCaptured: boolean;
  stream: MediaStream | null;
  facingMode: 'user' | 'environment'; // Front or back camera
  error: string | null;
}

export interface AppState {
  currentStep: 'mode-select' | 'player-select' | 'capture' | 'detection' | 'recommendations';
  gameMode: GameMode | null;
  playerBallType: PoolBallType | null; // Only for pool
  capturedImage: string | null; // Base64 image data
  detectionResult: DetectionResult | null;
  gameState: GameState | null;
  recommendations: ShotRecommendation[];
  isProcessing: boolean;
  error: string | null;
}

// ============================================
// COLOR DETECTION TYPES
// ============================================

export interface HSVColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  v: number; // Value: 0-100
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface ColorRange {
  name: string;
  ballType: PoolBallType | SnookerBallType;
  hsvMin: HSVColor;
  hsvMax: HSVColor;
  confidence: number;
}

// ============================================
// PHYSICS TYPES
// ============================================

export interface PhysicsConfig {
  tableLengthMeters: number; // Real-world table length
  ballDiameterMeters: number;
  pocketDiameterMeters: number;
  coefficientOfRestitution: number; // Bounciness
  coefficientOfFriction: number;
  maxSimulationSteps: number;
}

export interface Pocket {
  name: string;
  position: Point;
  radius: number;
}

export interface TableDimensions {
  width: number; // In pixels
  height: number;
  pockets: Pocket[];
}

// ============================================
// UTILITY TYPES
// ============================================

export interface ProcessingProgress {
  stage: 'loading' | 'detecting' | 'classifying' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface ErrorState {
  code: string;
  message: string;
  suggestions?: string[];
}

// ============================================
// DEMO MODE TYPES
// ============================================

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  gameMode: GameMode;
  imageUrl: string;
  expectedBalls: number;
}
