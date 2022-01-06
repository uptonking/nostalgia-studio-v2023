import { useEffect, useLayoutEffect } from 'react';

/** 若`window`存在，则使用useLayoutEffect，否则使用useEffect */
const useSsrLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useSsrLayoutEffect;
