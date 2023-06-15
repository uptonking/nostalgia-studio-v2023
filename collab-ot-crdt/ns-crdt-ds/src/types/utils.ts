export type Assert<T1 extends T2, T2> = T1;
export type Values<T extends Record<string, unknown>> = T[keyof T];
export type Inner<T> = T extends Array<infer U> ? U : never;
export type DistributiveOmit<O, K extends keyof O> = O extends unknown
  ? Omit<O, K>
  : never;
