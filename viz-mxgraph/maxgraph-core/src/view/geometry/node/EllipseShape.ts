import { type AbstractCanvas2D } from '../../canvas/AbstractCanvas2D';
import { type Rectangle } from '../Rectangle';
import { Shape } from '../Shape';

/**
 * Extends mxShape to implement an ellipse shape.
 * - This shape is registered under mxConstants.SHAPE_ELLIPSE in mxCellRenderer.
 */
export class EllipseShape extends Shape {
  constructor(
    bounds: Rectangle,
    fill: string,
    stroke: string,
    strokeWidth = 1,
  ) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
  }

  /**
   * Paints the ellipse shape.
   */
  paintVertexShape(
    c: AbstractCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    c.ellipse(x, y, w, h);
    c.fillAndStroke();
  }
}

export default EllipseShape;
