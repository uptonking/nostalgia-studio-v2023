import { Shape } from '../Shape';
import type { AbstractCanvas2D } from '../../canvas/AbstractCanvas2D';
import type { Rectangle } from '../Rectangle';
import { type ColorValue } from '../../../types';

/**
 * Extends {@link Shape} to implement a horizontal line shape.
 * This shape is registered under {@link mxConstants.SHAPE_LINE} in {@link mxCellRenderer}.
 * @class Line
 * @extends {Shape}
 */
export class LineShape extends Shape {
  constructor(
    bounds: Rectangle,
    stroke: ColorValue,
    strokeWidth = 1,
    vertical = false,
  ) {
    super();
    this.bounds = bounds;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.vertical = vertical;
  }

  /**
   * Whether to paint a vertical line.
   */
  vertical: boolean;

  /**
   * Redirects to redrawPath for subclasses to work.
   * @param {AbstractCanvas2D} c
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  paintVertexShape(
    c: AbstractCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    c.begin();

    if (this.vertical) {
      const mid = x + w / 2;
      c.moveTo(mid, y);
      c.lineTo(mid, y + h);
    } else {
      const mid = y + h / 2;
      c.moveTo(x, mid);
      c.lineTo(x + w, mid);
    }

    c.stroke();
  }
}

export default LineShape;
