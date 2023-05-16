import { ValueObject } from '@datalking/pivot-entity';

export class DateFormat extends ValueObject<string> {
  static fromString(format: string) {
    return new this({ value: format });
  }
}
