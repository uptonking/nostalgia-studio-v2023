import { RGAIdentifier } from './RGAIdentifier';

/**
 * Represents a node in the linked RGA structure
 */
export class RGANode {
  public id: RGAIdentifier;
  public content: string;
  public tombstone: boolean;
  public offset: number;

  public split: RGANode | null = null;
  public next: RGANode | null = null;

  constructor(id: RGAIdentifier, content: string, offset = 0) {
    this.id = id;
    this.content = content;
    this.tombstone = false;
    this.offset = offset;
  }

  /**
   * Creates a new RGANode with next as null
   */
  public copy(): RGANode {
    const id = new RGAIdentifier(this.id.sid, this.id.sum);
    const node = new RGANode(id, this.content, this.offset);
    node.tombstone = this.tombstone;
    return node;
  }
}
