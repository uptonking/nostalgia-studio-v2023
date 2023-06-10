import { type Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { CompositeSpecification } from '@datalking/pivot-entity';

import { type Record } from '../record';
import { type IRecordDisplayValues } from '../record.type';
import { RecordDisplayValues } from '../value-objects/record-display-values.vo';
import { type IRecordVisitor } from './interface';

export class WithDisplayValues extends CompositeSpecification<
  Record,
  IRecordVisitor
> {
  constructor(public readonly values: RecordDisplayValues) {
    super();
  }

  static from(values: IRecordDisplayValues): WithDisplayValues {
    return new this(new RecordDisplayValues(values));
  }

  isSatisfiedBy(t: Record): boolean {
    throw new Error('[WithDisplayValues.isSatisfiedBy] not implemented');
  }

  mutate(r: Record): Result<Record, string> {
    r.displayValues = this.values;
    return Ok(r);
  }

  accept(v: IRecordVisitor): Result<void, string> {
    return Ok(undefined);
  }
}
