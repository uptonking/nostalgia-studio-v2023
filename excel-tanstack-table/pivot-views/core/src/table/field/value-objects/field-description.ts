import { z } from 'zod';

import { ValueObject } from '@datalking/pivot-entity';

export const fieldDescriptionSchema = z.string();

export class FieldDescription extends ValueObject<string> {
  public get value(): string {
    return this.props.value;
  }
}
