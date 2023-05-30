import {
  type AbstractCanvas2D,
  CellRenderer,
  type CellStyle,
  Client,
  type ColorValue,
  EllipseShape,
  Graph,
  InternalEvent,
  type Rectangle,
  RectangleShape,
  RubberBandHandler,
} from '@maxgraph/core';

// display the maxGraph version in the footer
const footer = document.querySelector<HTMLElement>('footer')!;
footer.innerText = 'Built with maxGraph ' + Client.VERSION;
const container = <HTMLElement>document.getElementById('graph-container');

class CustomRectangleShape extends RectangleShape {
  constructor(bounds: Rectangle, fill: ColorValue, stroke: ColorValue) {
    super(bounds, fill, stroke, 3);
    this.isRounded = true; // force rounded shape
  }

  paintBackground(
    c: AbstractCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    c.setFillColor(this.fill || 'blue');
    super.paintBackground(c, x, y, w, h);
  }

  paintVertexShape(
    c: AbstractCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    // c.setStrokeColor('Black');
    c.setStrokeColor(this.stroke || 'none');
    super.paintVertexShape(c, x, y, w, h);
  }
}

class CustomEllipseShape extends EllipseShape {
  constructor(bounds: Rectangle, fill: string, stroke: string) {
    super(bounds, fill, stroke, 5);
  }

  paintVertexShape(
    c: AbstractCanvas2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    c.setFillColor(this.fill || 'gray');
    c.setStrokeColor(this.stroke || 'none');
    super.paintVertexShape(c, x, y, w, h);
  }
}

// Disables the built-in context menu
InternalEvent.disableContextMenu(container);

const graph = new Graph(container);
// Use mouse right button for panning
graph.setPanning(true);
// Enables rubber band selection
new RubberBandHandler(graph);

// WARN: as the maxGraph css files are not available in the npm package (at least for now), dedicated CSS class must be defined in style.css
// shapes and styles
registerCustomShapes();
// TODO use constants.EDGESTYLE instead of 'orthogonalEdgeStyle'
graph.getStylesheet().getDefaultEdgeStyle().edgeStyle = 'orthogonalEdgeStyle';

// Gets the default parent for inserting new cells.
// This is normally the first child of the root (ie. layer 0).
// Adds cells to the model in a single step
const parent = graph.getDefaultParent();

console.log(';; graph ', graph);

graph.batchUpdate(() => {
  const vertex11 = graph.insertVertex(
    parent,
    null,
    'a regular rectangle',
    10,
    10,
    100,
    100,
    <CellStyle>{
      fillColor: '#4169e1',
      strokeColor: 'none',
      fontColor: 'white',
    },
  );
  const vertex12 = graph.insertVertex(
    parent,
    null,
    'a regular ellipse',
    350,
    90,
    50,
    50,
    <CellStyle>{
      shape: 'ellipse',
      fillColor: '#f0e68c',
      strokeColor: 'none',
      fontColor: 'black',
    },
  );
  graph.insertEdge(parent, null, 'a regular edge', vertex11, vertex12);

  // insert vertices using custom shapes
  // TODO type issue in CellStyle type, shape should allow string to manage custom implementation
  const vertex21 = graph.insertVertex(
    parent,
    null,
    'a custom rectangle',
    20,
    200,
    100,
    100,
    // { shape: 'customRectangle' },
    <CellStyle>{
      shape: 'customRectangle',
      fillColor: '#1e90ff',
      strokeColor: 'none',
      fontColor: 'white',
    },
  );
  const vertex22 = graph.insertVertex(
    parent,
    null,
    'a custom ellipse',
    150,
    350,
    70,
    70,
    // { shape: 'customEllipse' },
    <CellStyle>{
      shape: 'customEllipse',
      fillColor: '#f5deb3',
      strokeColor: 'none',
      fontColor: 'black',
    },
  );
  graph.insertEdge(parent, null, 'another edge', vertex21, vertex22);
});

export function registerCustomShapes(): void {
  console.info('Registering custom shapes...');
  // @ts-expect-error TODO fix CellRenderer. Calls to this function are also marked as 'ts-ignore' in CellRenderer
  CellRenderer.registerShape('customRectangle', CustomRectangleShape);
  // @ts-expect-error fix-types
  CellRenderer.registerShape('customEllipse', CustomEllipseShape);
  console.info('Custom shapes registered');
}
