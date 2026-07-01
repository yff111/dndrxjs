import type { CollisionDetectionFn, DropPosition, DropPositionRules } from '../types'
import { calcPosition } from '../main'

/**
 * Default collision detection — identical to the built-in threshold approach.
 * Useful as an explicit value when composing strategies.
 */
export const thresholdCollision: CollisionDetectionFn = calcPosition

/**
 * Midpoint collision — snaps strictly to 'before' or 'after' at the element's
 * centre. Ignores the 'in' zone entirely (treats 'all' / 'notAfter' as 'around').
 * Gives a snappier feel for flat lists where nesting is not needed.
 */
export const midpointCollision: CollisionDetectionFn = (
  rules: DropPositionRules,
  _threshold: number,
) =>
  (offset: number, size: number): DropPosition => {
    switch (rules) {
      case 'none': return 'none'
      case 'in': return 'in'
      case 'before': return 'before'
      case 'after': return 'after'
      default: return offset < size / 2 ? 'before' : 'after'
    }
  }

/**
 * Edge-distance collision — uses the distance to the nearest edge rather than
 * a percentage threshold.  The `edgeSize` parameter sets the pixel band at
 * each edge that triggers 'before' / 'after'; everything else is 'in'.
 * Falls back to midpoint for rules that don't use the 'in' zone.
 */
export function edgeDistanceCollision(edgeSize = 8): CollisionDetectionFn {
  return (rules: DropPositionRules, _threshold: number) =>
    (offset: number, size: number): DropPosition => {
      switch (rules) {
        case 'none': return 'none'
        case 'in': return 'in'
        case 'before': return 'before'
        case 'after': return 'after'
        case 'around':
        case 'notAfter':
          return offset < size / 2 ? 'before' : 'after'
        case 'all': {
          if (offset <= edgeSize) return 'before'
          if (offset >= size - edgeSize) return 'after'
          return 'in'
        }
      }
    }
}
