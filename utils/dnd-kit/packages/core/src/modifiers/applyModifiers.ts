import { type FirstArgument, type Transform } from '@dnd-kit/utilities';

import { type Modifiers, type Modifier } from './types';

export function applyModifiers(
  modifiers: Modifiers | undefined,
  { transform, ...args }: FirstArgument<Modifier>,
): Transform {
  return modifiers?.length
    ? modifiers.reduce<Transform>((accumulator, modifier) => {
        return modifier({
          transform: accumulator,
          ...args,
        });
      }, transform)
    : transform;
}
