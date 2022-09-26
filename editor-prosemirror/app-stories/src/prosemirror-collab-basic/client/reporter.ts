/** fail/delay的消息通知 */
export class Reporter {
  state: string;
  /** 会添加到body元素之下 */
  node: HTMLElement;
  /** Date.now()对应的日期数字 */
  setAt: number;

  constructor() {
    this.state = null;
    this.node = null;
    this.setAt = 0;
  }

  /** 将this.state/node/setAt都置空 */
  clearState() {
    if (this.state) {
      document.body.removeChild(this.node);
      this.state = null;
      this.node = null;
      this.setAt = 0;
    }
  }

  failure(err) {
    this.show('fail', err.toString());
  }

  delay(err) {
    if (this.state === 'fail') return;
    this.show('delay', err.toString());
  }

  show(type: string, message: string) {
    this.clearState();
    this.state = type;
    this.setAt = Date.now();
    this.node = document.body.appendChild(document.createElement('div'));
    this.node.className = 'ProseMirror-report ProseMirror-report-' + type;
    this.node.textContent = message;
  }

  success() {
    if (this.state === 'fail' && this.setAt > Date.now() - 1000 * 10) {
      setTimeout(() => this.success(), 5000);
    } else {
      this.clearState();
    }
  }
}
