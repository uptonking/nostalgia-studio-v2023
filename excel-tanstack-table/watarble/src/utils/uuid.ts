import { nanoid } from 'nanoid';

export class UuidGenerator {
  uuidv4(): string {
    return nanoid();
  }
}
