import { roundPoint } from "./geometry";
import { simplifyRdp } from "./rdp";
import type { Point } from "../types";

const isSamePoint = (first: Point, second: Point): boolean => first.x === second.x && first.y === second.y;

/** Returns whether a world-space point is at least the supplied world-space sample distance from the last accepted point. */
export const shouldSamplePoint = (lastPoint: Point, point: Point, minimumDistance: number): boolean => {
  return Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >= minimumDistance;
};

/**
 * Simplifies world-space points, numerically quantizes coordinates, and removes
 * adjacent duplicates without mutating the source points or array.
 */
export const processStrokePoints = (
  points: readonly Point[],
  tolerance: number,
  precision: number
): readonly Point[] => {
  const quantizedPoints = simplifyRdp(points, tolerance).map((point) => roundPoint(point, precision));

  return quantizedPoints.reduce<readonly Point[]>((processedPoints, point, index) => {
    const previousPoint = processedPoints[processedPoints.length - 1];
    if (!previousPoint || !isSamePoint(previousPoint, point)) return [...processedPoints, point];
    return index === quantizedPoints.length - 1
      ? [...processedPoints.slice(0, -1), point]
      : processedPoints;
  }, []);
};
