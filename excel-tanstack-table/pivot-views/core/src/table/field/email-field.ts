import { z } from 'zod';

import { EmailFieldValue } from './email-field-value';
import {
  type EmailFieldType,
  type ICreateEmailFieldInput,
  type ICreateEmailFieldValue,
} from './email-field.type';
import { BaseField } from './field.base';
import { type IEmailField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import {
  type IEmailFilter,
  type IEmailFilterOperator,
} from './filter/email.filter';

export class EmailField extends BaseField<IEmailField> {
  type: EmailFieldType = 'email';

  override get primitive() {
    return true;
  }

  static create(input: Omit<ICreateEmailFieldInput, 'type'>): EmailField {
    return new EmailField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateEmailFieldInput): EmailField {
    return new EmailField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateEmailFieldValue): EmailFieldValue {
    return new EmailFieldValue(value);
  }

  createFilter(
    operator: IEmailFilterOperator,
    value: string | null,
  ): IEmailFilter {
    return { operator, value, path: this.id.value, type: 'email' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.email(this);
  }

  get valueSchema() {
    const email = z.string().email();
    return this.required ? email : email.nullable();
  }
}
