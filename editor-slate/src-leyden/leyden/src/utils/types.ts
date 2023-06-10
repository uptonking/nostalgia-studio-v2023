import { type Editor, type Operation } from 'slate';

import { type Coordinates } from '../interfaces/Coordinates';
import { type Cell, type CellType } from '../interfaces/Cell';
import {
  type ValidationFuncs,
  type ValidatorIsExtended,
} from '../interfaces/Validator';

/**
 * Distribute a type over its union.
 */

export type Distribute<T> = T extends T ? T : never;

/**
 * Produce a keys union of a record indexed by strings.
 */

export type Keys<T extends Record<string, unknown>> = Distribute<keyof T>;

/**
 * A function fired when a Slate operation is applied
 */

export type OperationSubscriber = (op: Operation) => void;

/**
 * A function fired when a cell's value changes.
 */

export type CellSubscriber<T extends CellType> = (cell: Cell<T>) => void;

/**
 * A function fired when the coordinates of the currently selected cell changes.
 */

export type SelectedCoordinatesSubscriber = (
  coords: Coordinates | null,
) => void;

/**
 * A function which will end a subscription
 */

export type Unsubscriber = () => void;

/**
 * An option representing a leyden editor passed during editor initialization
 */

export interface EditorOption<T extends Editor> {
  editor: T;
}

/**
 * An option representing a validator set passed during editor initialization
 */

export interface ValidatorsOption {
  validators: ValidationFuncs;
}

/**
 * Initialization options passed to `withLeyden`
 */

export type WithLeydenOptions<T extends Editor> =
  ValidatorIsExtended extends true
    ? EditorOption<T> & ValidatorsOption
    : EditorOption<T> & Partial<ValidatorsOption>;
