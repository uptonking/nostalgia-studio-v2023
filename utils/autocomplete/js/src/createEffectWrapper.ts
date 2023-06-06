type Effect = () => void;
type EffectFn = () => Effect;
type CleanupFn = () => void;
type EffectWrapper = {
  /** register effect fn, run effect immediately, then keep cleanup fn */
  runEffect(fn: EffectFn): void;
  cleanupEffects(): void;
  /** run all effects */
  runEffects(): void;
};

export function createEffectWrapper(): EffectWrapper {
  let effects: EffectFn[] = [];
  let cleanups: CleanupFn[] = [];

  function runEffect(fn: EffectFn) {
    effects.push(fn);
    const effectCleanup = fn();
    cleanups.push(effectCleanup);
  }

  return {
    runEffect,
    cleanupEffects() {
      const currentCleanups = cleanups;
      cleanups = [];
      currentCleanups.forEach((cleanup) => {
        cleanup();
      });
    },
    runEffects() {
      const currentEffects = effects;
      effects = [];
      currentEffects.forEach((effect) => {
        runEffect(effect);
      });
    },
  };
}
