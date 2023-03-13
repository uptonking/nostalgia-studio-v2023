import randomColor from 'randomcolor';

import { faker } from '@faker-js/faker';

import { CursorData } from './types';

const {
  name: { firstName, lastName },
} = faker;

const textColors = [
  '#BF616A',
  '#D08770',
  '#EBCB8B',
  '#A3BE8C',
  '#B48EAD',
  '#8FBCBB',
  '#88C0D0',
  '#81A1C1',
  '#5E81AC',
];

export function randomCursorData(): CursorData {
  return {
    color: randomColor({
      luminosity: 'dark',
      alpha: 1,
      format: 'hex',
    }),
    // color: textColors[Math.floor(Math.random() * 10)],
    bgColor: '#ECEFF4',
    name: `${firstName()} ${lastName()}`,
  };
}

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return hexColor + normalized.toString(16).toUpperCase();
}
