import { type TFunction } from 'i18next';

declare const TERMINAL_BRAND: unique symbol;

export declare class BrandedTerminal {
  private [TERMINAL_BRAND]?;
}

declare type IsAny<T> = unknown extends T
  ? [keyof T] extends [never]
    ? false
    : true
  : false;

declare type TerminalType =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | any[]
  | Map<any, any>
  | Set<any>
  | Date
  | RegExp
  | AbortController
  | BrandedTerminal
  | ((...args: any) => any);

export declare type RecursiveKeyOf<
  T,
  Prefix extends string = never,
> = T extends TerminalType
  ? never
  : IsAny<T> extends true
    ? never
    : {
        [K in keyof T & string]: [Prefix] extends [never]
          ? K | RecursiveKeyOf<T[K], K>
          : `${Prefix}.${K}` | RecursiveKeyOf<T[K], `${Prefix}.${K}`>;
      }[keyof T & string];

export declare type TypeIfUndefined<C, T, T2> = [C] extends [undefined]
  ? T
  : T2;
export declare type TypeIfNever<C, T> = [C] extends [never] ? T : C;
export declare type AnyIfNever<C> = TypeIfNever<C, any>;

export declare type DeepPropertyType<
  T,
  P extends RecursiveKeyOf<T>,
  TT = Exclude<T, undefined>,
> = P extends `${infer Prefix}.${infer Rest}`
  ? Prefix extends keyof TT
    ? Rest extends RecursiveKeyOf<TT[Prefix]>
      ? DeepPropertyType<TT[Prefix], Rest>
      : never
    : never
  : P extends keyof TT
    ? TT[P]
    : never;
export {};

export declare type StringIfNever<C> = TypeIfNever<C, string>;

export interface ClsStore {
  [key: symbol]: any;
  t: TFunction;
  requestId: string;
  lang: 'en' | 'zh-CN';
  user: {
    userId: string;
  };
}

export interface IClsService {
  getId(): string;
  get(): ClsStore;
  get<
    R = undefined,
    T extends RecursiveKeyOf<ClsStore> = any,
    P = DeepPropertyType<ClsStore, T>,
  >(
    key?: StringIfNever<T> | keyof ClsStore,
  ): TypeIfUndefined<
    R,
    TypeIfUndefined<typeof key, ClsStore, AnyIfNever<P>>,
    R
  >;
}
