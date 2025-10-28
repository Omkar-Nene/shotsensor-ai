/**
 * Geometry utility functions for shot trajectory calculations
 */

import { Point } from '@/types';

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle in radians from p1 to p2
 * Returns angle from -PI to PI
 */
export function angleBetween(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Calculate angle in degrees from p1 to p2
 */
export function angleBetweenDegrees(p1: Point, p2: Point): number {
  return (angleBetween(p1, p2) * 180) / Math.PI;
}

/**
 * Check if a point is inside a circle
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius;
}

/**
 * Calculate intersection point of two lines defined by point and angle
 */
export function lineIntersection(
  p1: Point,
  angle1: number,
  p2: Point,
  angle2: number
): Point | null {
  const m1 = Math.tan(angle1);
  const m2 = Math.tan(angle2);

  // Check if lines are parallel
  if (Math.abs(m1 - m2) < 0.0001) {
    return null;
  }

  const b1 = p1.y - m1 * p1.x;
  const b2 = p2.y - m2 * p2.x;

  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;

  return { x, y };
}

/**
 * Calculate reflection angle
 * Given incident angle and surface normal, calculate reflected angle
 */
export function reflectAngle(incidentAngle: number, surfaceNormal: number): number {
  return 2 * surfaceNormal - incidentAngle;
}

/**
 * Move a point along an angle by a distance
 */
export function movePoint(start: Point, angle: number, distance: number): Point {
  return {
    x: start.x + distance * Math.cos(angle),
    y: start.y + distance * Math.sin(angle),
  };
}

/**
 * Calculate contact point on object ball when hit by cue ball
 * Given cue ball center, object ball center, and ball radius
 */
export function calculateContactPoint(
  cueBall: Point,
  objectBall: Point,
  ballRadius: number
): Point {
  const angle = angleBetween(cueBall, objectBall);
  return movePoint(objectBall, angle + Math.PI, ballRadius);
}

/**
 * Calculate if a shot is possible (no obstructions)
 * Simple line-of-sight check
 */
export function hasLineOfSight(
  from: Point,
  to: Point,
  obstacles: Array<{ center: Point; radius: number }>,
  clearance: number = 0
): boolean {
  const angle = angleBetween(from, to);
  const totalDistance = distance(from, to);

  // Check each obstacle
  for (const obstacle of obstacles) {
    // Skip if obstacle is the destination
    if (distance(obstacle.center, to) < obstacle.radius) {
      continue;
    }

    // Calculate perpendicular distance from obstacle to line
    const toObstacle = distance(from, obstacle.center);
    const angleToObstacle = angleBetween(from, obstacle.center);
    const angleDiff = angleToObstacle - angle;
    const perpDistance = Math.abs(toObstacle * Math.sin(angleDiff));
    const alongDistance = toObstacle * Math.cos(angleDiff);

    // Check if obstacle is in the path
    if (
      perpDistance < obstacle.radius + clearance &&
      alongDistance > 0 &&
      alongDistance < totalDistance
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate cut angle for a shot
 * Returns angle in degrees (0 = straight in, 90 = maximum cut)
 */
export function calculateCutAngle(
  cueBall: Point,
  objectBall: Point,
  pocket: Point
): number {
  const cueToBall = angleBetween(cueBall, objectBall);
  const ballToPocket = angleBetween(objectBall, pocket);

  let cutAngle = Math.abs(ballToPocket - cueToBall);

  // Normalize to 0-90 degrees
  if (cutAngle > Math.PI) {
    cutAngle = 2 * Math.PI - cutAngle;
  }
  if (cutAngle > Math.PI / 2) {
    cutAngle = Math.PI - cutAngle;
  }

  return (cutAngle * 180) / Math.PI;
}

/**
 * Generate smooth trajectory path points
 * Useful for drawing shot lines
 */
export function generatePathPoints(
  start: Point,
  end: Point,
  numPoints: number = 20
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    points.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }

  return points;
}

/**
 * Calculate the best angle to pot a ball
 * Returns the angle from cue ball that will send object ball to pocket
 */
export function calculatePottingAngle(
  cueBall: Point,
  objectBall: Point,
  pocket: Point,
  ballRadius: number
): number {
  // Calculate where on the object ball we need to hit
  const ballToPocket = angleBetween(objectBall, pocket);
  const contactPoint = movePoint(objectBall, ballToPocket + Math.PI, ballRadius);

  // Return angle from cue ball to contact point
  return angleBetween(cueBall, contactPoint);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Check if two circles intersect
 */
export function circlesIntersect(
  c1: Point,
  r1: number,
  c2: Point,
  r2: number
): boolean {
  return distance(c1, c2) <= r1 + r2;
}
