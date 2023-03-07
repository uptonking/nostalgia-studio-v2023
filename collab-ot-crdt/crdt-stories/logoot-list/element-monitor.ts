export class TextareaMonitor {
  el: any;
  callback: any;
  valLast: string;

  constructor(el, callback) {
    this.el = el;
    this.callback = callback;
    this.resync();
  }

  /** read dom value to this.valLast */
  resync() {
    this.valLast = this.el.value;
  }

  /** listen to `input` event on textarea */
  monitor() {
    this.el.addEventListener(
      'input',
      function (event) {
        const valNext = this.el.value;
        const ctx = {
          insert: function (pos, str) {
            for (var idx = 0; idx < str.length; idx++) {
              this.callback(['ins', pos + idx, str.slice(idx, idx + 1)]);
            }
          }.bind(this),
          remove: function (pos, len) {
            for (var idx = len - 1; idx >= 0; idx--) {
              this.callback(['del', pos + idx + 1]);
            }
          }.bind(this),
        };
        applyChange(this.valLast, valNext, ctx);
        this.resync();
      }.bind(this),
    );
  }
}

/**
 * given old and new string, find the del+insert op for the change
 * - https://github.com/josephg/ShareJS/blob/master/lib/client/textarea.js#L26
 */
function applyChange(oldval, newval, ctx) {
  if (oldval === newval) return;

  let commonStart = 0;
  // find the position when two differs
  while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
    commonStart++;
  }

  let commonEnd = 0;
  while (
    oldval.charAt(oldval.length - 1 - commonEnd) ===
      newval.charAt(newval.length - 1 - commonEnd) &&
    commonEnd + commonStart < oldval.length &&
    commonEnd + commonStart < newval.length
  ) {
    commonEnd++;
  }

  if (oldval.length !== commonStart + commonEnd) {
    ctx.remove(commonStart, oldval.length - commonStart - commonEnd);
  }
  if (newval.length !== commonStart + commonEnd) {
    ctx.insert(
      commonStart,
      newval.slice(commonStart, newval.length - commonEnd),
    );
  }
}
