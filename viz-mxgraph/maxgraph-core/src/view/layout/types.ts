import type Dictionary from '../../util/Dictionary';
import type Cell from '../cell/Cell';
import type GraphHierarchyNode from './datatypes/GraphHierarchyNode';

export interface GraphLayoutTraverseArgs {
  vertex: Cell | null;
  directed: boolean | null;
  func: Function | null;
  edge: Cell | null;
  visited: Dictionary<Cell, boolean> | null;
}

export interface HierarchicalGraphLayoutTraverseArgs
  extends GraphLayoutTraverseArgs {
  allVertices: { [key: string]: Cell } | null;
  currentComp: { [key: string]: Cell | null };
  hierarchyVertices: GraphHierarchyNode[];
  filledVertexSet: { [key: string]: Cell } | null;
}

export interface SwimlaneGraphLayoutTraverseArgs
  extends HierarchicalGraphLayoutTraverseArgs {
  swimlaneIndex: number;
}
