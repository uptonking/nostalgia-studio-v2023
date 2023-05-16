import * as z from 'zod';

import { ValueObject } from '@datalking/pivot-entity';

export const tableNameSchema = z.string().trim().min(2);

export class TableName extends ValueObject<string> {
  private constructor(name: string) {
    super({
      value: name,
    });
  }

  static create(name: string): TableName {
    return new this(tableNameSchema.parse(name));
  }

  static unsafeCreate(name: string): TableName {
    return new this(name);
  }

  get value(): string {
    return this.props.value;
  }
}
