import { LINE_ARCSIZE } from '../../../util/Constants';
import { type AbstractCanvas2D } from '../../canvas/AbstractCanvas2D';
import { ActorShape } from '../ActorShape';
import { Point } from '../Point';

/**
 * Implementation of the triangle shape.
 * @class TriangleShape
 * @extends {ActorShape}
 */
export class TriangleShape extends ActorShape {
  constructor() {
    super();
  }

  /**
   * Adds roundable support.
   * @returns {boolean}
   */
  isRoundable() {
    return true;
  }

  /**
   * Draws the path for this shape.
   * @param {mxAbstractCanvas2D} c
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  redrawPath(c: AbstractCanvas2D, x: number, y: number, w: number, h: number) {
    const arcSize = (this.style?.arcSize ?? LINE_ARCSIZE) / 2;

    this.addPoints(
      c,
      [new Point(0, 0), new Point(w, 0.5 * h), new Point(0, h)],
      this.isRounded,
      arcSize,
      true,
    );
  }
}

export default TriangleShape;
