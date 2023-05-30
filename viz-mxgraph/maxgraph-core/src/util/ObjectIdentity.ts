import { type IdentityFunction, type IdentityObject } from '../types';
import { IDENTITY_FIELD_NAME } from './Constants';
import { getFunctionName } from './StringUtils';

/**
 * @class
 *
 * Identity for JavaScript objects and functions. This is implemented using
 * a simple incrementing counter which is stored in each object under
 * {@link FIELD_NAME}.
 *
 * The identity for an object does not change during its lifecycle.
 */
export class ObjectIdentity {
  /**
   * Name of the field to be used to store the object ID. Default is
   * <code>mxObjectId</code>.
   */
  static FIELD_NAME = IDENTITY_FIELD_NAME;

  /**
   * Current counter.
   */
  static counter = 0;

  /**
   * Returns the ID for the given object or function.
   */
  static get(obj: IdentityObject | IdentityFunction | null) {
    if (obj) {
      if (
        obj[IDENTITY_FIELD_NAME] === null ||
        obj[IDENTITY_FIELD_NAME] === undefined
      ) {
        if (typeof obj === 'object') {
          const ctor = getFunctionName(obj.constructor);
          obj[IDENTITY_FIELD_NAME] = `${ctor}#${ObjectIdentity.counter++}`;
        } else if (typeof obj === 'function') {
          obj[IDENTITY_FIELD_NAME] = `Function#${ObjectIdentity.counter++}`;
        }
      }
      return obj[IDENTITY_FIELD_NAME] as string;
    }
    return null;
  }

  /**
   * Deletes the ID from the given object or function.
   */
  static clear(obj: IdentityObject | IdentityFunction) {
    delete obj[IDENTITY_FIELD_NAME];
  }
}

export default ObjectIdentity;
