import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';
import type { ITableSpecVisitor } from '../../specifications/index';
import type { Table } from '../../table';
import type { ViewFieldsOrder } from '../view-fields-order.vo';
import type { View } from '../view';
import { BaseViewSpecification } from './base-view-specification';

export class WithViewFieldsOrder extends BaseViewSpecification {
  constructor(
    public readonly viewFieldsOrder: ViewFieldsOrder,
    public readonly view: View,
  ) {
    super(view);
  }

  isSatisfiedBy(): boolean {
    return this.viewFieldsOrder.equals(this.view.fieldsOrder);
  }

  mutate(t: Table): Result<Table, string> {
    this.view.fieldsOrder = this.viewFieldsOrder;
    return Ok(t);
  }

  accept(v: ITableSpecVisitor): Result<void, string> {
    v.fieldsOrder(this);
    return Ok(undefined);
  }
}
