import equal from 'fast-deep-equal';

export type Primitives = string | number | boolean | null;
/** wrap domain object in `value` property */
export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

/**
 * valueObject and plainJsObject conversion
 */
export abstract class ValueObject<T = any> {
  protected readonly props: ValueObjectProps<T>;

  constructor(props: ValueObjectProps<T>) {
    this.props = props;
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return equal(this, vo);
  }

  unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    const propsCopy = convertPropsToObject(this.props);

    return Object.freeze(propsCopy);
  }

  private isDomainPrimitive(
    obj: any,
  ): obj is DomainPrimitive<T & (Primitives | Date)> {
    if (Object.hasOwn(obj, 'value')) {
      return true;
    }
    return false;
  }

  static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }
}

export function convertPropsToObject(props: any): any {
  const propsCopy = { ...props };

  // eslint-disable-next-line guard-for-in
  for (const prop in propsCopy) {
    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
        return convertToPlainObject(item);
      });
    }

    propsCopy[prop] = convertToPlainObject(propsCopy[prop]);
  }

  return propsCopy;
}

function convertToPlainObject(item: any): any {
  if (ValueObject.isValueObject(item)) {
    return item.unpack();
  }
  return item;
}
