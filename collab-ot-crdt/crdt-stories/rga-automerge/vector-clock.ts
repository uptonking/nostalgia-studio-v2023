export type SerializedVectorClock = { [key: number]: number };

export class VectorClock {
  #vector = new Map<number, number>();

  static from(vc: VectorClock) {
    const newVc = new VectorClock();
    newVc.#vector = new Map(vc.#vector);
    return newVc;
  }
  static fromSerializable(entries: SerializedVectorClock) {
    const newVc = new VectorClock();
    newVc.#vector = new Map(Object.entries(entries)) as unknown as Map<
      number,
      number
    >;
    return newVc;
  }
  toSerializable(): SerializedVectorClock {
    return Object.fromEntries(this.#vector);
  }

  get(sid: number) {
    return this.#vector.get(sid);
  }

  set(sid: number, clock: number): void {
    this.#vector.set(sid, clock);
  }
  update(sid: number) {
    const newClock = (this.#vector.get(sid) ?? 0) + 1;
    this.#vector.set(sid, newClock);
  }

  merge(vc: VectorClock) {
    for (let [sid, clock] of vc.#vector.entries()) {
      const currentClock = this.#vector.get(sid);
      if (currentClock === undefined || currentClock < clock) {
        this.#vector.set(sid, clock);
      }
    }
  }

  get sum() {
    let sum = 0;
    for (const clock of this.#vector.values()) {
      sum += clock;
    }
    return sum;
  }
}
