import { z } from 'zod';

import { ColorFieldValue } from './color-field-value';
import {
  type ColorFieldType,
  type ICreateColorFieldInput,
  type ICreateColorFieldValue,
} from './color-field.type';
import { BaseField } from './field.base';
import { type IColorField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import {
  type IColorFilter,
  type IColorFilterOperator,
} from './filter/color.filter';

export class ColorField extends BaseField<IColorField> {
  type: ColorFieldType = 'color';

  override get primitive() {
    return true;
  }

  static create(input: Omit<ICreateColorFieldInput, 'type'>): ColorField {
    return new ColorField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateColorFieldInput): ColorField {
    return new ColorField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateColorFieldValue): ColorFieldValue {
    return new ColorFieldValue(value);
  }

  createFilter(
    operator: IColorFilterOperator,
    value: string | null,
  ): IColorFilter {
    return { operator, value, path: this.id.value, type: 'color' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.color(this);
  }

  get valueSchema() {
    const color = z.string().min(4).max(9).regex(/^#/);
    return this.required ? color : color.nullable();
  }
}
