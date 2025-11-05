/**
 * Math utility functions
 */

import {Vector2} from './Vector2';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function isCircleCollidingWithCircle(
  pos1: Vector2,
  radius1: number,
  pos2: Vector2,
  radius2: number
): boolean {
  const distanceSquared = pos1.distanceSquaredTo(pos2);
  const radiusSum = radius1 + radius2;
  return distanceSquared < radiusSum * radiusSum;
}

export function isPointInCircle(
  point: Vector2,
  circlePos: Vector2,
  radius: number
): boolean {
  return point.distanceSquaredTo(circlePos) < radius * radius;
}
