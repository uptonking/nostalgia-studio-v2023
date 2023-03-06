export let loggingEnabled = false;
export const log = console.log.bind(console);

/**
 * WStringOperations are generated when a user modifies their copy of a document
 * and received from other clients to be applied to our WString.
 */
export const WOperationType = {
  insert: 'INSERT',
  delete: 'DELETE',
} as const;

function compareNumbers(first: number, second: number) {
  if (first < second) return -1;
  if (first > second) return 1;
  return 0;
}

/**
 * In our algorithm, every character in a document gets a unique id that it
 * keeps forever. The id has two parts: the clientId of the siteNumber where it
 * was generated, and a 'opNumber' that increments every time a client generates
 * a new character.
 */
export class WCharId {
  private _stringVal: string = '';
  _siteNumber: number;
  _opNumber: number;

  constructor(_siteNumber: number, _opNumber: number) {
    this._siteNumber = _siteNumber;
    this._opNumber = _opNumber;
  }

  siteNumber(): number {
    return this._siteNumber;
  }

  opNumber(): number {
    return this._opNumber;
  }

  // Returns -1 for less than, 0 for equal, 1 for greater than
  compare(other: WCharId): number {
    if (this._siteNumber === other._siteNumber) {
      // Sites are the same, compare by opNumber
      return compareNumbers(this._opNumber, other._opNumber);
    }
    return compareNumbers(this._siteNumber, other._siteNumber);
  }

  toJSON(): any {
    return {
      siteNumber: this._siteNumber,
      opNumber: this._opNumber,
    };
  }

  toString(): string {
    if (!this._stringVal) {
      this._stringVal = this._siteNumber + '/' + this._opNumber;
    }
    // Cached because this gets called a lot and it was showing up
    // in the Chrome profiler.
    return this._stringVal;
  }

  static fromJSON(jsonChar: any): WCharId {
    return new WCharId(jsonChar.siteNumber, jsonChar.opNumber);
  }
}

/**
 * This represents a character in our WString class.
 */
class WChar {
  /** false if this character has been 'deleted' from the document */
  private _visible: boolean = true;

  constructor(
    /** The id assigned at creation-time that this character keeps forever */
    private _id: WCharId,

    /** The user-visible character that this WChar represents */
    private _character: string,

    /** As per the algorithm outlines in the document, each character specifies
     * which two characters it belongs between. These are the ids of the chars
     * that must go somewhere before and somewhere after this character respectively.
     */
    private _previous: WCharId,
    /** next char */
    private _next: WCharId,
  ) {}

  id(): WCharId {
    return this._id;
  }

  character(): string {
    return this._character;
  }

  previous(): WCharId {
    return this._previous;
  }

  next(): WCharId {
    return this._next;
  }

  visible(): boolean {
    return this._visible;
  }

  setVisible(visible: boolean): void {
    this._visible = visible;
  }

  debug(): string {
    return JSON.stringify({
      id: this._id.toString(),
      visible: this._visible,
      character: this._character,
    });
  }

  toJSON(): any {
    return {
      id: this._id,
      previous: this._previous.toJSON(),
      next: this._next.toJSON(),
      character: this._character,
      visible: this._visible,
    };
  }

  static fromJSON(jsonChar: any): WChar {
    const id = WCharId.fromJSON(jsonChar.id);
    const previous = WCharId.fromJSON(jsonChar.previous);
    const next = WCharId.fromJSON(jsonChar.next);
    const char = new WChar(id, jsonChar.character, previous, next);
    char._visible = jsonChar.visible;
    return char;
  }

  static begin(): WChar {
    const id = new WCharId(-1, 0);
    return new WChar(id, '', id, id);
  }

  static end(): WChar {
    const id = new WCharId(-1, 1);
    return new WChar(id, '', id, id);
  }
}

/**
 * operation type and char
 */
export class WStringOperation {
  constructor(
    private _opType: typeof WOperationType[keyof typeof WOperationType],
    private _char: WChar,
  ) {}

  opType(): typeof WOperationType[keyof typeof WOperationType] {
    return this._opType;
  }

  char(): WChar {
    return this._char;
  }

  toJSON(): any {
    return {
      opType: this._opType,
      char: this._char.toJSON(),
    };
  }

  static fromJSON(operation: any): WStringOperation {
    const opType = operation.opType;
    const char = WChar.fromJSON(operation.char);
    return new WStringOperation(opType, char);
  }
}

export interface InsertTimingStats {
  numInsertOpsGenerated: number;
  timeSpentEach: Array<number>;
  whileLoopIterationsEach: Array<number>;
  totalGroupLoopIterationsEach: Array<number>;
  totalWalkLoopIterationsEach: Array<number>;
}

/**
 * Collaborative string type.
 */
export class WString {
  /** List of all WChars that comprise our string */
  _chars: Array<WChar> = [];
  /** { charId: Wchar } */
  _charById: { [charId: string]: WChar } = {};

  constructor(
    /** Function that generates WCharIds for a particular siteNumber */
    private _idGenerator: () => WCharId,
  ) {
    const begin = WChar.begin();
    const end = WChar.end();
    this._chars.push(begin);
    this._chars.push(end);
    this._charById[begin.id().toString()] = begin;
    this._charById[end.id().toString()] = end;
  }

  /**
   * generateInsertOperation and generateDeleteOperation create and integrate an
   * operation for a text change in this WString. For example, if you string is
   * WString("abc") and you call .generateInsertOperation("x", 0) the string will
   * become WString("axbc").
   *
   * Returns the operation that made the modification.
   */
  generateInsertOperation(
    char: string,
    position: number,
    stats: InsertTimingStats,
  ): WStringOperation {
    const nextId = this._idGenerator();
    const previous = this._ithVisible(position);
    const next = this._ithVisible(position + 1);
    const newChar = new WChar(nextId, char, previous.id(), next.id());
    stats.numInsertOpsGenerated += 1;
    this.integrateInsertion(newChar, stats);
    return new WStringOperation(WOperationType.insert, newChar);
  }

  generateDeleteOperation(char: string, position: number): WStringOperation {
    const charToDelete = this._ithVisible(position + 1);
    this.integrateDeletion(charToDelete);
    return new WStringOperation(WOperationType.delete, charToDelete);
  }

  /** Returns `true` if a character with the id param is in this string (visible or not)
   */
  contains(id: WCharId): boolean {
    return id.toString() in this._charById;
  }

  isExecutable(op: WStringOperation) {
    switch (op.opType()) {
      case WOperationType.insert:
        return (
          this.contains(op.char().previous()) && this.contains(op.char().next())
        );

      case WOperationType.delete:
        return this.contains(op.char().id());
    }
  }

  /** concat chars to string. Call this to get a string to show to the user */
  stringForDisplay() {
    let result = '';
    for (let i = 0; i < this._chars.length; i++) {
      const char: WChar = this._chars[i];
      if (!char.visible()) {
        continue;
      }

      result += char.character();
    }
    return result;
  }

  integrateInsertion(newChar: WChar, stats: InsertTimingStats) {
    log('[integrateInsertion] begin');
    this._integrateInsertionHelper(
      newChar,
      newChar.previous(),
      newChar.next(),
      stats,
    );
  }

  integrateDeletion(charToDelete: WChar) {
    const char = this._charById[charToDelete.id().toString()];
    char.setVisible(false);
  }

  /** This function is an iterative version of the logic in the code block at the top
   * of page 11 in the paper. We were hitting maximum call stack issues with the recursive
   * version.
   */
  private _integrateInsertionHelper(
    newChar: WChar,
    previousId: WCharId,
    nextId: WCharId,
    stats: InsertTimingStats,
  ) {
    const startMs = performance.now();
    let whileLoopIterations = 0;
    let groupLoopIterations = 0;
    let walkLoopIterations = 0;

    log('_integrateInsertionHelper] begin with chars', this._chars);
    /**
     * Consider the following scenario:
     *
     * 1. Type 2000 chars
     * 2. Delete the chars
     * 3. Paste them back in
     *
     * This operation hangs the UI for 4/5 seconds. When profiled, most of the work
     * is done in this method calling into indexOfCharWithId which is O(n) for n
     * the number of chars in the string. So we optimize these calls by iterating
     * once over the string at the beginning of the method and building up a map
     * of WCharId -> location in _chars.
     */
    const indexById: { [id: string]: number } = {};
    for (var i = 0; i < this._chars.length; i++) {
      const char: WChar = this._chars[i];
      indexById[char.id().toString()] = i;
    }

    while (true) {
      whileLoopIterations += 1;
      if (!(previousId.toString() in indexById)) {
        throw Error(
          '[_integrateInsertionHelper] Previous index not present in string!',
        );
      }
      const previousIndex: number = indexById[previousId.toString()];

      if (!(nextId.toString() in indexById)) {
        throw Error(
          '[_integrateInsertionHelper] Next index not present in string!',
        );
      }
      const nextIndex: number = indexById[nextId.toString()];

      if (nextIndex <= previousIndex) {
        throw Error(
          '[_integrateInsertionHelper] nextIndex must be greater than previousIndex',
        );
      }

      if (nextIndex === previousIndex + 1) {
        // We only have one place for newChar to go. This is easy.
        // splice pushes the element at nextIndex to the right.
        this._chars.splice(nextIndex, 0, newChar);
        this._charById[newChar.id().toString()] = newChar;
        log(
          "[_integrateInsertionHelper] We're done. Here are the new chars:",
          this._chars,
        );
        stats.timeSpentEach.push(performance.now() - startMs);
        stats.whileLoopIterationsEach.push(whileLoopIterations);
        stats.totalGroupLoopIterationsEach.push(groupLoopIterations);
        stats.totalWalkLoopIterationsEach.push(walkLoopIterations);
        return;
      }

      // these logs are expensive, shortcut early if logging is disabled
      loggingEnabled &&
        log(
          'Previous index is ',
          previousIndex,
          ' which is character ',
          this._chars[previousIndex].debug(),
        );
      loggingEnabled &&
        log(
          'Next index is ',
          nextIndex,
          ' which is character ',
          this._chars[nextIndex].debug(),
        );

      // lChars is 'L' from page 11 of the paper and dChar is d_0, d_1, ... from
      // the same page
      const lChars: Array<WChar> = [];
      lChars.push(this._chars[previousIndex]);
      for (var i = previousIndex + 1; i < nextIndex; i++) {
        const dChar = this._chars[i];
        if (!(dChar.previous().toString() in indexById)) {
          throw Error('dChar.previous missing from indexById');
        }
        const dCharIndexOfPrevious = indexById[dChar.previous().toString()];

        if (!(dChar.next().toString() in indexById)) {
          throw Error('dChar.next missing from indexById');
        }
        const dCharIndexOfNext = indexById[dChar.next().toString()];

        if (
          dCharIndexOfPrevious <= previousIndex &&
          dCharIndexOfNext >= nextIndex
        ) {
          lChars.push(dChar);
        }
        groupLoopIterations += 1;
      }
      lChars.push(this._chars[nextIndex]);

      // newChar belongs somewhere between previousIndex and nextIndex, but we don't
      // know where. See page 11 of the paper for more info on what we're about to do.

      log('Walking along the chars list!');
      var i = 1;
      while (
        i < lChars.length - 1 &&
        lChars[i].id().compare(newChar.id()) < 0
      ) {
        i += 1;
        walkLoopIterations += 1;
      }

      log("We're done and we decided to insert at index ", i);
      log('This is lChars', lChars);
      loggingEnabled &&
        log(
          'This is between ',
          lChars[i - 1].debug(),
          ' and ',
          lChars[i].debug(),
        );
      previousId = lChars[i - 1].id();
      nextId = lChars[i].id();
    }

    throw Error('We never get here');
  }

  /**
   * Returns the ith visible character in this string. WChar.begin and WChar.end
   * are both visible. TODO(ryan): this could be more efficient if we keep an
   * additional list of only-visible chars.
   */
  private _ithVisible(position: number): WChar {
    log('[ithVisible] position ', position);
    let foundSoFar = -1;
    for (let i = 0; i < this._chars.length; i++) {
      const char = this._chars[i];
      if (char.visible()) {
        foundSoFar += 1;
        if (foundSoFar === position) {
          return this._chars[i];
        }
      }
    }
    throw Error('There is no ' + position + 'th visible char!');
  }
}
