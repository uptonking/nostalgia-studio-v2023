import { LoadState } from '../constant';
import { GetCurrentContextByState, GetNextContextByState } from '../context';
import { AnyRecord } from '../utility';

/** 抽象类：持有全局context作为实例属性，还声明了统一执行的main()方法 */
export abstract class Atom<
  LoadAfter extends LoadState = LoadState,
  Options extends AnyRecord = AnyRecord,
  CurrentContext extends AnyRecord = GetCurrentContextByState<LoadAfter>,
  NextContext extends AnyRecord = GetNextContextByState<LoadAfter>,
> {
  /** identifier of current atom. It must have no conflict with other atoms. */
  abstract readonly id: string;
  /** The timing that current atom need to be loaded. */
  abstract readonly loadAfter: LoadAfter;
  /** A method that will be executed when current atom is loaded */
  abstract main(): void;

  readonly options: Options;
  /** get the current context of the editor */
  context!: Readonly<CurrentContext>;
  /** update the context of the editor. */
  updateContext!: (next: Partial<NextContext>) => void;

  constructor(options = {} as Options) {
    this.options = options;
  }

  /** 只执行简单的赋值 */
  injectContext(
    context: CurrentContext,
    updateContext: (next: Partial<NextContext>) => void,
  ) {
    this.context = context;
    this.updateContext = updateContext;
  }
}
