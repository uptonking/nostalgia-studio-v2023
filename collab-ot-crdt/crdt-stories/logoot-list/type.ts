/**
 * a string is represented as an array of TextAtom, as 4-tuple.
 * - id,siteId
 * - clock
 * - character value
 * - siteId
 */
export type TextAtom = [[number, number], number | null, string, number];
