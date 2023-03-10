/**
 * Represents an identifier for a RGA node
 */
export class RGAIdentifier {
  public sid: number;
  public sum: number;

  constructor(sid: number, sum: number) {
    this.sid = sid;
    this.sum = sum;
  }

  compareTo(other: RGAIdentifier): number {
    if (this.sum !== other.sum) {
      return this.sum - other.sum;
    } else {
      return this.sid - other.sid;
    }
  }

  public static NullIdentifier = new RGAIdentifier(-1, -1);
}
