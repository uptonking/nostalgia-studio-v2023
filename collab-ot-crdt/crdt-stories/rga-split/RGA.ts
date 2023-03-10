import { RGAIdentifier } from './RGAIdentifier';
import { RGAInsert } from './RGAInsert';
import { RGANode } from './RGANode';
import { RGARemove } from './RGARemove';

export interface RGAJSON {
  nodes: RGANode[];
}

export interface RGAOperationJSON {
  reference: RGAIdentifier;
  id?: RGAIdentifier;
  content?: string;
  offset: number;
}

export function rgaOperationFromJSON(
  op: RGAOperationJSON,
): RGAInsert | RGARemove {
  if (op.content && op.id) {
    return new RGAInsert(
      new RGAIdentifier(op.reference.sid, op.reference.sum),
      new RGAIdentifier(op.id.sid, op.id.sum),
      op.content,
      op.offset,
    );
  } else {
    return new RGARemove(
      new RGAIdentifier(op.reference.sid, op.reference.sum),
      op.offset,
    );
  }
}

/**
 * The RGA structure is a CRDT that allows for collaborative editing.
 * More info here: https://pages.lip6.fr/Marc.Shapiro/papers/rgasplit-group2016-11.pdf
 */
export class RGA {
  private head: RGANode;
  private sid: number;
  private clock: number;

  private nodeMap: Map<number, Map<number, RGANode>>;

  /**
   * Constructs a new RGA structure
   * @param sid The identifier for this replica of RGA
   */
  public constructor(
    sid: number = Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
  ) {
    this.head = new RGANode(RGAIdentifier.NullIdentifier, '');
    this.sid = sid;
    this.clock = 0;
    this.nodeMap = new Map();
    this.setToNodeMap(this.head);
  }

  private getFromNodeMap(identifier: RGAIdentifier): RGANode | null {
    return this.findOffset(identifier, 0);
  }

  public findOffset(
    identifier: RGAIdentifier,
    offset: number,
    before = true,
  ): RGANode | null {
    let node = this.nodeMap.get(identifier.sid)?.get(identifier.sum) || null;

    while (
      node !== null &&
      (before
        ? node.offset + node.content.length < offset
        : node.offset + node.content.length <= offset)
    ) {
      node = node.split;

      if (!node) {
        throw new Error('No more splits. Is something off?');
      }
    }

    return node;
  }

  private setToNodeMap(node: RGANode): void {
    let sidSet = this.nodeMap.get(node.id.sid);
    if (sidSet === undefined) {
      sidSet = new Map();
      this.nodeMap.set(node.id.sid, sidSet);
    }
    sidSet.set(node.id.sum, node);
  }

  /**
   * Finds a RGANode at the given position
   * @param position The position of the node
   * @returns [RGANode, offset]
   */
  public findNodePosOffset(position: number): [RGANode, number] {
    let count = 0;
    let cursor: RGANode | null = this.head;
    while (count < position && cursor.next !== null) {
      cursor = cursor.next;
      if (!cursor.tombstone) {
        count += cursor.content.length;
      }
    }

    if (cursor === null) {
      throw new Error(
        "Couldn't find node at position '" +
          position +
          "'. Is something out of sync?",
      );
    }

    const startPos = count - cursor.content.length;
    return [cursor, cursor.offset + (position - startPos)];
  }

  /**
   * Finds a RGANode at the given position
   * @param position The position of the node
   */
  public findNodePos(position: number): RGANode {
    let count = 0;
    let cursor: RGANode | null = this.head;
    while (count < position && cursor.next !== null) {
      cursor = cursor.next;
      if (!cursor.tombstone) {
        count += cursor.content.length;
      }
    }

    if (cursor === null) {
      throw new Error(
        "Couldn't find node at position '" +
          position +
          "'. Is something out of sync?",
      );
    }

    return cursor;
  }

  /**
   * Finds the (non-tombstoned) index of the given RGAIdentifier
   * @param The id to find
   * @return The zero-based index of the given identifier
   */
  public findPos(id: RGAIdentifier, offset = 0): number {
    let position = 0;
    let cursor: RGANode | null = this.head;
    while (cursor !== null) {
      if (
        !cursor.tombstone &&
        cursor.id.compareTo(id) === 0 &&
        cursor.offset + cursor.content.length > offset
      ) {
        return position + offset - cursor.offset;
      } else if (!cursor.tombstone) {
        position += cursor.content.length;
      }

      cursor = cursor.next;
    }

    return -1;
  }

  /**
   * Creates an insertion the given position with the given content
   * @param position The position of which to create the insertion
   * @param content The content to insert. Should be a single charcater with length 1
   */
  public createInsertPos(position: number, content: string): RGAInsert {
    const [node, offset] = this.findNodePosOffset(position);
    return this.createInsert(node.id, content, offset);
  }

  /**
   * Creates an insertion to the right of the given reference with the given content
   * @param reference The identifier of the reference node.
   * The insertion will be to the right of the reference noded
   * @param content The content to insert. Should be a single character with length 1
   */
  public createInsert(
    reference: RGAIdentifier,
    content: string,
    offset = 0,
  ): RGAInsert {
    return new RGAInsert(
      reference,
      new RGAIdentifier(this.sid, this.clock),
      content,
      offset,
    );
  }

  /**
   * Creates a removal at the given position, zero based indexing
   * @param position The position of the node to remove
   */
  public createRemovePos(position: number): RGARemove {
    const [node, offset] = this.findNodePosOffset(position + 1);
    return this.createRemove(node.id, offset - 1);
  }

  /**
   * Creates a removal at the given identifier
   * @param id Creates a removal of the given id
   */
  public createRemove(id: RGAIdentifier, offset = 0): RGARemove {
    return new RGARemove(id, offset);
  }

  private split(node: RGANode, offset: number): void {
    const length = offset - node.offset;
    if (length > 0) {
      const splitNode = new RGANode(
        node.id,
        node.content.substr(length),
        offset,
      );
      node.content = node.content.substr(0, offset - node.offset);
      splitNode.next = node.next;
      splitNode.split = node.split;
      node.next = splitNode;
      node.split = splitNode;
    }
  }

  /**
   * Applies an insert operation
   * @param insertion The insertion to apply
   */
  public insert(insertion: RGAInsert): RGAInsert {
    let target: RGANode | null =
      this.findOffset(insertion.reference, insertion.offset) || null;

    if (!target) {
      throw new Error(
        'Could not find reference node. Has operations been delivered out of order?',
      );
    }

    const isEnd = target.content.length + target.offset === insertion.offset;
    while (isEnd && target.next && target.next.id.compareTo(insertion.id) > 0) {
      target = target.next;
    }

    if (!target) {
      throw new Error('Whoops, this should never happen! My bad.');
    }

    if (target.offset + target.content.length > insertion.offset) {
      this.split(target, insertion.offset);
    }

    const node = new RGANode(insertion.id, insertion.content);
    const next = target.next;
    target.next = node;
    node.next = next;

    this.setToNodeMap(node);

    this.clock++;

    return insertion;
  }

  /**
   * Applies the remove operation
   * @param removal The removal to apply
   */
  remove(removal: RGARemove): RGARemove {
    let node = this.findOffset(removal.reference, removal.offset, false);
    if (node === null) {
      throw new Error(
        'Could not find reference node. Has operations been delivered out of order?',
      );
    }

    if (node.content.length > 1) {
      const isStart = removal.offset === node.offset;
      const isEnd = removal.offset === node.offset + node.content.length - 1;
      const isMiddle = !(isStart || isEnd);
      if (isStart) {
        this.split(node, 1);
      } else if (isEnd) {
        this.split(node, removal.offset);
        node = node.split as RGANode;
      } else if (isMiddle) {
        this.split(node, removal.offset);
        node = node.split as RGANode;
        this.split(node, removal.offset + 1);
      }
    }

    node.tombstone = true;

    return removal;
  }

  /**
   * Applies either an insert or a remove to the RGA
   * @param op operation to perform
   */
  public applyOperation(op: RGAInsert | RGARemove): void {
    if (op instanceof RGAInsert) {
      this.insert(op);
    } else {
      this.remove(op);
    }
  }

  /**
   * Converts the RGA to a plain old string
   */
  public toString(): string {
    let str = '';
    let cursor = this.head.next;
    while (cursor !== null) {
      if (!cursor.tombstone) {
        str += cursor.content;
      }
      cursor = cursor.next;
    }
    return str;
  }

  /**
   * Converts a string into an RGA
   * @param s string to convert
   */
  public static fromString(s: string): RGA {
    const rga: RGA = new RGA();
    rga.insert(rga.createInsertPos(0, s));
    return rga;
  }

  public static fromRGAJSON(rgaJSON: RGAJSON): RGA {
    const newRga = new RGA();
    for (let i = rgaJSON.nodes.length - 1; i >= 0; i--) {
      const node = rgaJSON.nodes[i];
      node.next = newRga.head.next;
      node.id = new RGAIdentifier(node.id.sid, node.id.sum);
      newRga.head.next = node;

      const lastSplit = newRga.getFromNodeMap(node.id);
      if (lastSplit !== null) {
        node.split = lastSplit;
        let cursor = node;
        while (cursor.split !== null) {
          // Update offsets
          cursor.split.offset = cursor.offset + cursor.content.length;
          cursor = cursor.split;
        }
      }

      newRga.setToNodeMap(node);
    }
    newRga.clock = rgaJSON.nodes.length;
    return newRga;
  }

  public toRGAJSON(): RGAJSON {
    const nodes: RGANode[] = [];
    let cursor = this.head.next;
    while (cursor !== null) {
      const node = cursor.copy();
      nodes.push(node);
      cursor = cursor.next;
    }
    return { nodes };
  }
}
