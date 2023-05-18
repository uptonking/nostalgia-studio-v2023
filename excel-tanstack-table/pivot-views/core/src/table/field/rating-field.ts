import { isNumber } from 'lodash-es';
import { None, type Option, Some } from 'oxide.ts';
import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import type { TableCompositeSpecificaiton } from '../specifications/interface';
import { BaseField } from './field.base';
import type { IRatingField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type {
  IRatingFilter,
  IRatingFilterOperator,
} from './filter/rating.filter';
import { RatingFieldValue } from './rating-field-value';
import type {
  ICreateRatingFieldInput,
  ICreateRatingFieldValue,
  IUpdateRatingFieldInput,
  RatingFieldType,
} from './rating-field.type';
import { WithRatingMax } from './specifications/rating-field.specification';

export class RatingField extends BaseField<IRatingField> {
  type: RatingFieldType = 'rating';

  override get primitive() {
    return true;
  }

  public get max(): number {
    return this.props.max ?? 5;
  }

  public set max(max: number) {
    this.props.max = max;
  }

  override get isNumeric() {
    return true;
  }

  static create(input: Omit<ICreateRatingFieldInput, 'type'>): RatingField {
    return new RatingField({ ...super.createBase(input), max: input.max });
  }

  static unsafeCreate(input: ICreateRatingFieldInput): RatingField {
    return new RatingField({
      ...super.unsafeCreateBase(input),
      max: input.max,
    });
  }

  createValue(value: ICreateRatingFieldValue): RatingFieldValue {
    return new RatingFieldValue(value);
  }

  createFilter(
    operator: IRatingFilterOperator,
    value: number | null,
  ): IRatingFilter {
    return { operator, value, path: this.id.value, type: 'rating' };
  }

  private updateMax(
    input: IUpdateRatingFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    if (isNumber(input.max)) {
      return Some(new WithRatingMax(this, input.max));
    }

    return None;
  }

  public update(
    input: IUpdateRatingFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    return andOptions(super.updateBase(input), this.updateMax(input));
  }

  accept(visitor: IFieldVisitor): void {
    visitor.rating(this);
  }

  get valueSchema() {
    const rating = z.number().nonnegative().max(this.max);
    return this.required ? rating : rating.nullable();
  }
}
