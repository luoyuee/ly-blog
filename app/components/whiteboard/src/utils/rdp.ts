import { pointToSegmentDistance } from "./geometry";
import type { Point } from "../types";

const copyPoint = (point: Point): Point => ({ x: point.x, y: point.y });

/**
 * Simplifies a world-space polyline with Ramer-Douglas-Peucker using a
 * world-space tolerance, preserving copied first and last endpoints.
 */
export const simplifyRdp = (points: readonly Point[], tolerance: number): readonly Point[] => {
  if (points.length <= 2) return points.map(copyPoint);

  const simplifyRange = (startIndex: number, endIndex: number): readonly Point[] => {
    const start = points[startIndex];
    const end = points[endIndex];
    if (!start || !end) return [];

    let furthestIndex = startIndex + 1;
    let furthestDistance = -1;
    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const point = points[index];
      if (!point) continue;
      const distance = pointToSegmentDistance(point, start, end);
      if (distance > furthestDistance) {
        furthestDistance = distance;
        furthestIndex = index;
      }
    }

    if (furthestDistance <= tolerance) return [copyPoint(start), copyPoint(end)];
    const first = simplifyRange(startIndex, furthestIndex);
    const second = simplifyRange(furthestIndex, endIndex);
    return [...first.slice(0, -1), ...second];
  };

  return simplifyRange(0, points.length - 1);
};
