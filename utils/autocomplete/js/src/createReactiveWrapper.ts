/** value factory function */
type ReactiveValue<TValue> = () => TValue;

export type Reactive<TValue> = {
  /** as both getter and setter */
  value: TValue;
  /**
   * @private
   */
  _fn: ReactiveValue<TValue>;
  /**
   * @private
   */
  _ref: {
    current: TValue;
  };
};

type ReactiveWrapper = {
  /** create a reactive object for value fn, and close over it */
  reactive: <TValue>(value: ReactiveValue<TValue>) => Reactive<TValue>;
  /** update all reactive values */
  runReactives: () => void;
};

/**
 * reactive values store and update
 */
export function createReactiveWrapper(): ReactiveWrapper {
  const reactives: Array<Reactive<any>> = [];

  return {
    reactive<TValue>(value: ReactiveValue<TValue>) {
      const current = value();
      const reactiveClosure: Reactive<TValue> = {
        _fn: value,
        _ref: { current },
        get value() {
          return this._ref.current;
        },
        set value(value) {
          this._ref.current = value;
        },
      };

      reactives.push(reactiveClosure);

      return reactiveClosure;
    },
    runReactives() {
      reactives.forEach((value) => {
        value._ref.current = value._fn();
      });
    },
  };
}
