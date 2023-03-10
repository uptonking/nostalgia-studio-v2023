import { RGAIdentifier } from './RGAIdentifier';

/**
 * Represents a remove operation in the RGA
 */
export class RGARemove {
  public reference: RGAIdentifier;
  public offset: number;

  public constructor(reference: RGAIdentifier, offset = 0) {
    this.reference = reference;
    this.offset = offset;
  }
}
