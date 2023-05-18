import { ValueObject } from '@datalking/pivot-entity';

import { optionNameSchema } from './option.schema';

export class OptionName extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  public get value() {
    return this.props.value;
  }

  static create(value: string): OptionName {
    return new this(optionNameSchema.parse(value));
  }

  static unsafeCreate(value: string): OptionName {
    return new this(value);
  }
}
