import type { Node } from 'prosemirror-model';
import type { Step } from 'prosemirror-transform';

/** a central authority which determines in which order changes are applied.
 * - If two editors make changes concurrently, they will both go to this authority with their changes.
 * - The authority will accept the changes from one of them, and broadcast these changes to all editors.
 */
export class Authority {
  /** 当前文档实例 */
  doc: Node;
  /** 将所有编辑操作steps放在内存，注意内存溢出
   * - steps.length作为当前doc的版本
   */
  steps: Step[];
  stepClientIDs: any[];
  onNewSteps: (() => void)[];

  constructor(doc: Node) {
    this.doc = doc;
    this.steps = [];
    this.stepClientIDs = [];
    this.onNewSteps = [];
  }

  /** When an editor client wants to try and submit their changes to the authority, they can call receiveSteps on it,
   * passing the last version number they received, along with the new changes they added,
   * and their client ID (which is a way for them to later recognize which changes came from them).
   * - you could also have receiveSteps return a status, and immediately confirm the sent steps, as an optimization.
   */
  receiveSteps(version: number, steps: Step[], clientID) {
    if (version !== this.steps.length) {
      return false;
    }

    // Apply and accumulate new steps
    steps.forEach((step) => {
      this.doc = step.apply(this.doc).doc;
      this.steps.push(step);
      this.stepClientIDs.push(clientID);
    });
    // Signal listeners
    this.onNewSteps.forEach((f) => f());
    return this.doc;
  }

  stepsSince(version: number) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version),
    };
  }
}
