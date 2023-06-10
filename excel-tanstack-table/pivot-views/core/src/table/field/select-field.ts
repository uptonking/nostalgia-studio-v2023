import { isArray } from 'lodash-es';
import { type Option } from 'oxide.ts';
import { z } from 'zod';

import { and } from '@datalking/pivot-entity';

import {
  type ICreateOptionSchema,
  type IUpdateOptionSchema,
} from '../option/index';
import { OptionKey } from '../option/index';
import { Options } from '../option/options';
import { type TableCompositeSpecificaiton } from '../specifications/interface';
import { BaseField } from './field.base';
import { type ISelectField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import { type ISelectFilterOperator } from './filter/operators';
import {
  type ISelectFilter,
  type ISelectFilterValue,
} from './filter/select.filter';
import { SelectFieldValue } from './select-field-value';
import {
  type ICreateSelectFieldSchema,
  type ICreateSelectFieldValue,
  type IUpdateSelectFieldInput,
  type SelectFieldType,
} from './select-field.type';
import {
  WithNewOption,
  WithOption,
  WithOptions,
  WithoutOption,
} from './specifications/select-field.specification';

export class SelectField extends BaseField<ISelectField> {
  type: SelectFieldType = 'select';

  get options() {
    return this.props.options;
  }

  set options(options: Options) {
    this.props.options = options;
  }

  override get primitive() {
    return true;
  }

  reorder(from: string, to: string): WithOptions {
    const options = this.options.reorder(from, to);
    return new WithOptions(this, options);
  }

  createOption(input: ICreateOptionSchema): WithNewOption {
    const option = this.options.createOption(input);
    return new WithNewOption(this, option);
  }

  updateOption(id: string, input: IUpdateOptionSchema): WithOption {
    const option = this.options.getById(id).unwrap();

    return new WithOption(this, option.updateOption(input));
  }

  removeOption(id: string): WithoutOption {
    const optionKey = OptionKey.fromString(id);
    return new WithoutOption(this, optionKey);
  }

  static create(input: Omit<ICreateSelectFieldSchema, 'type'>): SelectField {
    return new SelectField({
      ...super.createBase(input),
      options: Options.create(input.options),
    });
  }

  static unsafeCreate(input: ICreateSelectFieldSchema): SelectField {
    return new SelectField({
      ...super.unsafeCreateBase(input),
      options: Options.unsafeCreate(input.options),
    });
  }

  public override update(
    input: IUpdateSelectFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    const specs: TableCompositeSpecificaiton[] = [];
    const spec = super.updateBase(input);
    if (spec.isSome()) {
      specs.push(spec.unwrap());
    }

    if (isArray(input.options)) {
      const options = Options.create(input.options);
      specs.push(new WithOptions(this, options));
    }

    return and(...specs);
  }

  createFilter(
    operator: ISelectFilterOperator,
    value: ISelectFilterValue,
  ): ISelectFilter {
    return { operator, value, path: this.id.value, type: 'select' };
  }

  createValue(value: ICreateSelectFieldValue): SelectFieldValue {
    if (value === null) {
      return new SelectFieldValue(null);
    }

    const option = this.options.getById(value).unwrap();

    return SelectFieldValue.fromOption(option);
  }

  accept(visitor: IFieldVisitor): void {
    visitor.select(this);
  }

  get valueSchema() {
    return this.required ? z.string() : z.string().nullable();
  }
}
