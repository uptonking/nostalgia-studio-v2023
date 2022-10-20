import { TextOperation } from '../src/text-operation';

/** A random test generates random data to check some invariants. To increase
 * confidence in a random test, it is run repeatedly.
 */
export function randomTest(func: () => any, n: number = 5) {
  return function () {
    while (n--) {
      func();
    }
  };
}

export function randomInt(n: number) {
  return Math.floor(Math.random() * n);
}

export function randomString(n: number) {
  let str = '';
  while (n--) {
    if (Math.random() < 0.15) {
      str += '\n';
    } else {
      const chr = randomInt(26) + 97;
      str += String.fromCharCode(chr);
    }
  }
  return str;
}

export function last(arr: any[]) {
  return arr[arr.length - 1];
}

export function randomOperation(str: string, useAttributes?: boolean) {
  const operation = new TextOperation();
  let remainingLen: number;
  while (true) {
    remainingLen = str.length - operation.baseLength;
    if (remainingLen === 0) {
      break;
    }
    const r = Math.random();
    const l = 1 + randomInt(Math.min(remainingLen - 1, 20));
    if (r < 0.2) {
      operation.insert(randomString(l));
    } else if (r < 0.4) {
      operation.delete(l);
    } else {
      operation.retain(l);
    }
  }

  if (Math.random() < 0.3) {
    // 最后可能在末尾添加一个随机字符串
    operation.insert(1 + randomString(10));
  }
  return operation;
}
