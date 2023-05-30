import { type StencilShape } from './StencilShape';

type Stencils = {
  [k: string]: StencilShape;
};

/**
 * A singleton class that provides a registry for stencils and the methods
 * for painting those stencils onto a canvas or into a DOM.
 *
 * Code to add stencils:
 * ```javascript
 * let req = mxUtils.load('test/stencils.xml');
 * let root = req.getDocumentElement();
 * let shape = root.firstChild;
 *
 * while (shape != null)
 * {
 *   if (shape.nodeType === mxConstants.NODETYPE_ELEMENT)
 *  {
 *    mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
 *  }
 *
 *  shape = shape.nextSibling;
 * }
 * ```
 * @class StencilShapeRegistry
 */
export class StencilShapeRegistry {
  static stencils: Stencils = {};

  /**
   * Adds the given {@link Stencil}.
   * @static
   * @param {string} name
   * @param {StencilShape} stencil
   */
  static addStencil(name: string, stencil: StencilShape) {
    StencilShapeRegistry.stencils[name] = stencil;
  }

  /**
   * Returns the {@link Stencil} for the given name.
   * @static
   * @param {string} name
   * @returns {StencilShape}
   */
  static getStencil(name: string) {
    return StencilShapeRegistry.stencils[name];
  }
}

export default StencilShapeRegistry;
