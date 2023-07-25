/* eslint-disable */

!(function () {
  function t(t) {
    this.content = t;
  }
  function e(t, n, r) {
    for (let o = 0; ; o++) {
      if (o == t.childCount || o == n.childCount)
        return t.childCount == n.childCount ? null : r;
      const i = t.child(o);
      const s = n.child(o);
      if (i != s) {
        if (!i.sameMarkup(s)) return r;
        if (i.isText && i.text != s.text) {
          for (let a = 0; i.text[a] == s.text[a]; a++) r++;
          return r;
        }
        if (i.content.size || s.content.size) {
          const c = e(i.content, s.content, r + 1);
          if (null != c) return c;
        }
        r += i.nodeSize;
      } else r += i.nodeSize;
    }
  }
  function n(t, e, r, o) {
    for (let i = t.childCount, s = e.childCount; ; ) {
      if (i == 0 || s == 0) return i == s ? null : { a: r, b: o };
      const a = t.child(--i);
      const c = e.child(--s);
      const l = a.nodeSize;
      if (a != c) {
        if (!a.sameMarkup(c)) return { a: r, b: o };
        if (a.isText && a.text != c.text) {
          for (
            let p = 0, h = Math.min(a.text.length, c.text.length);
            p < h &&
            a.text[a.text.length - p - 1] == c.text[c.text.length - p - 1];

          )
            p++, r--, o--;
          return { a: r, b: o };
        }
        if (a.content.size || c.content.size) {
          const u = n(a.content, c.content, r - 1, o - 1);
          if (u) return u;
        }
        (r -= l), (o -= l);
      } else (r -= l), (o -= l);
    }
  }
  (t.prototype = {
    constructor: t,
    find: function (t) {
      for (let e = 0; e < this.content.length; e += 2)
        if (this.content[e] === t) return e;
      return -1;
    },
    get: function (t) {
      const e = this.find(t);
      return e == -1 ? void 0 : this.content[e + 1];
    },
    update: function (e, n, r) {
      const o = r && r != e ? this.remove(r) : this;
      const i = o.find(e);
      const s = o.content.slice();
      return (
        i == -1 ? s.push(r || e, n) : ((s[i + 1] = n), r && (s[i] = r)),
        new t(s)
      );
    },
    remove: function (e) {
      const n = this.find(e);
      if (n == -1) return this;
      const r = this.content.slice();
      return r.splice(n, 2), new t(r);
    },
    addToStart: function (e, n) {
      return new t([e, n].concat(this.remove(e).content));
    },
    addToEnd: function (e, n) {
      const r = this.remove(e).content.slice();
      return r.push(e, n), new t(r);
    },
    addBefore: function (e, n, r) {
      const o = this.remove(n);
      const i = o.content.slice();
      const s = o.find(e);
      return i.splice(s == -1 ? i.length : s, 0, n, r), new t(i);
    },
    forEach: function (t) {
      for (let e = 0; e < this.content.length; e += 2)
        t(this.content[e], this.content[e + 1]);
    },
    prepend: function (e) {
      return (e = t.from(e)).size
        ? new t(e.content.concat(this.subtract(e).content))
        : this;
    },
    append: function (e) {
      return (e = t.from(e)).size
        ? new t(this.subtract(e).content.concat(e.content))
        : this;
    },
    subtract: function (e) {
      let n = this;
      e = t.from(e);
      for (let r = 0; r < e.content.length; r += 2) n = n.remove(e.content[r]);
      return n;
    },
    get size() {
      return this.content.length >> 1;
    },
  }),
    (t.from = function (e) {
      if (e instanceof t) return e;
      const n = [];
      if (e) for (const r in e) n.push(r, e[r]);
      return new t(n);
    });
  const r = function (t, e) {
    if (((this.content = t), (this.size = e || 0), e == null))
      for (let n = 0; n < t.length; n++) this.size += t[n].nodeSize;
  };
  const o = {
    firstChild: { configurable: !0 },
    lastChild: { configurable: !0 },
    childCount: { configurable: !0 },
  };
  (r.prototype.nodesBetween = function (t, e, n, r, o) {
    void 0 === r && (r = 0);
    for (let i = 0, s = 0; s < e; i++) {
      const a = this.content[i];
      const c = s + a.nodeSize;
      if (c > t && !1 !== n(a, r + s, o || null, i) && a.content.size) {
        const l = s + 1;
        a.nodesBetween(
          Math.max(0, t - l),
          Math.min(a.content.size, e - l),
          n,
          r + l,
        );
      }
      s = c;
    }
  }),
    (r.prototype.descendants = function (t) {
      this.nodesBetween(0, this.size, t);
    }),
    (r.prototype.textBetween = function (t, e, n, r) {
      let o = '';
      let i = !0;
      return (
        this.nodesBetween(
          t,
          e,
          function (s, a) {
            s.isText
              ? ((o += s.text.slice(Math.max(t, a) - a, e - a)), (i = !n))
              : s.isLeaf
              ? (r
                  ? (o += typeof r === 'function' ? r(s) : r)
                  : s.type.spec.leafText && (o += s.type.spec.leafText(s)),
                (i = !n))
              : !i && s.isBlock && ((o += n), (i = !0));
          },
          0,
        ),
        o
      );
    }),
    (r.prototype.append = function (t) {
      if (!t.size) return this;
      if (!this.size) return t;
      const e = this.lastChild;
      const n = t.firstChild;
      const o = this.content.slice();
      let i = 0;
      for (
        e.isText &&
        e.sameMarkup(n) &&
        ((o[o.length - 1] = e.withText(e.text + n.text)), (i = 1));
        i < t.content.length;
        i++
      )
        o.push(t.content[i]);
      return new r(o, this.size + t.size);
    }),
    (r.prototype.cut = function (t, e) {
      if ((void 0 === e && (e = this.size), t == 0 && e == this.size))
        return this;
      const n = [];
      let o = 0;
      if (e > t)
        for (let i = 0, s = 0; s < e; i++) {
          let a = this.content[i];
          const c = s + a.nodeSize;
          c > t &&
            ((s < t || c > e) &&
              (a = a.isText
                ? a.cut(Math.max(0, t - s), Math.min(a.text.length, e - s))
                : a.cut(
                    Math.max(0, t - s - 1),
                    Math.min(a.content.size, e - s - 1),
                  )),
            n.push(a),
            (o += a.nodeSize)),
            (s = c);
        }
      return new r(n, o);
    }),
    (r.prototype.cutByIndex = function (t, e) {
      return t == e
        ? r.empty
        : t == 0 && e == this.content.length
        ? this
        : new r(this.content.slice(t, e));
    }),
    (r.prototype.replaceChild = function (t, e) {
      const n = this.content[t];
      if (n == e) return this;
      const o = this.content.slice();
      const i = this.size + e.nodeSize - n.nodeSize;
      return (o[t] = e), new r(o, i);
    }),
    (r.prototype.addToStart = function (t) {
      return new r([t].concat(this.content), this.size + t.nodeSize);
    }),
    (r.prototype.addToEnd = function (t) {
      return new r(this.content.concat(t), this.size + t.nodeSize);
    }),
    (r.prototype.eq = function (t) {
      if (this.content.length != t.content.length) return !1;
      for (let e = 0; e < this.content.length; e++)
        if (!this.content[e].eq(t.content[e])) return !1;
      return !0;
    }),
    (o.firstChild.get = function () {
      return this.content.length ? this.content[0] : null;
    }),
    (o.lastChild.get = function () {
      return this.content.length ? this.content[this.content.length - 1] : null;
    }),
    (o.childCount.get = function () {
      return this.content.length;
    }),
    (r.prototype.child = function (t) {
      const e = this.content[t];
      if (!e) throw new RangeError('Index ' + t + ' out of range for ' + this);
      return e;
    }),
    (r.prototype.maybeChild = function (t) {
      return this.content[t] || null;
    }),
    (r.prototype.forEach = function (t) {
      for (let e = 0, n = 0; e < this.content.length; e++) {
        const r = this.content[e];
        t(r, n, e), (n += r.nodeSize);
      }
    }),
    (r.prototype.findDiffStart = function (t, n) {
      return void 0 === n && (n = 0), e(this, t, n);
    }),
    (r.prototype.findDiffEnd = function (t, e, r) {
      return (
        void 0 === e && (e = this.size),
        void 0 === r && (r = t.size),
        n(this, t, e, r)
      );
    }),
    (r.prototype.findIndex = function (t, e) {
      if ((void 0 === e && (e = -1), t == 0)) return s(0, t);
      if (t == this.size) return s(this.content.length, t);
      if (t > this.size || t < 0)
        throw new RangeError(
          'Position ' + t + ' outside of fragment (' + this + ')',
        );
      for (let n = 0, r = 0; ; n++) {
        const o = r + this.child(n).nodeSize;
        if (o >= t) return o == t || e > 0 ? s(n + 1, o) : s(n, r);
        r = o;
      }
    }),
    (r.prototype.toString = function () {
      return '<' + this.toStringInner() + '>';
    }),
    (r.prototype.toStringInner = function () {
      return this.content.join(', ');
    }),
    (r.prototype.toJSON = function () {
      return this.content.length
        ? this.content.map(function (t) {
            return t.toJSON();
          })
        : null;
    }),
    (r.fromJSON = function (t, e) {
      if (!e) return r.empty;
      if (!Array.isArray(e))
        throw new RangeError('Invalid input for Fragment.fromJSON');
      return new r(e.map(t.nodeFromJSON));
    }),
    (r.fromArray = function (t) {
      if (!t.length) return r.empty;
      for (var e, n = 0, o = 0; o < t.length; o++) {
        const i = t[o];
        (n += i.nodeSize),
          o && i.isText && t[o - 1].sameMarkup(i)
            ? (e || (e = t.slice(0, o)),
              (e[e.length - 1] = i.withText(e[e.length - 1].text + i.text)))
            : e && e.push(i);
      }
      return new r(e || t, n);
    }),
    (r.from = function (t) {
      if (!t) return r.empty;
      if (t instanceof r) return t;
      if (Array.isArray(t)) return this.fromArray(t);
      if (t.attrs) return new r([t], t.nodeSize);
      throw new RangeError(
        'Can not convert ' +
          t +
          ' to a Fragment' +
          (t.nodesBetween
            ? ' (looks like multiple versions of prosemirror-model were loaded)'
            : ''),
      );
    }),
    Object.defineProperties(r.prototype, o),
    (r.empty = new r([], 0));
  const i = { index: 0, offset: 0 };
  function s(t, e) {
    return (i.index = t), (i.offset = e), i;
  }
  function a(t, e) {
    if (t === e) return !0;
    if (!t || 'object' !== typeof t || !e || 'object' !== typeof e) return !1;
    const n = Array.isArray(t);
    if (Array.isArray(e) != n) return !1;
    if (n) {
      if (t.length != e.length) return !1;
      for (let r = 0; r < t.length; r++) if (!a(t[r], e[r])) return !1;
    } else {
      for (const o in t) if (!(o in e) || !a(t[o], e[o])) return !1;
      for (const i in e) if (!(i in t)) return !1;
    }
    return !0;
  }
  const c = function (t, e) {
    (this.type = t), (this.attrs = e);
  };
  (c.prototype.addToSet = function (t) {
    for (var e, n = !1, r = 0; r < t.length; r++) {
      const o = t[r];
      if (this.eq(o)) return t;
      if (this.type.excludes(o.type)) e || (e = t.slice(0, r));
      else {
        if (o.type.excludes(this.type)) return t;
        !n &&
          o.type.rank > this.type.rank &&
          (e || (e = t.slice(0, r)), e.push(this), (n = !0)),
          e && e.push(o);
      }
    }
    return e || (e = t.slice()), n || e.push(this), e;
  }),
    (c.prototype.removeFromSet = function (t) {
      for (let e = 0; e < t.length; e++)
        if (this.eq(t[e])) return t.slice(0, e).concat(t.slice(e + 1));
      return t;
    }),
    (c.prototype.isInSet = function (t) {
      for (let e = 0; e < t.length; e++) if (this.eq(t[e])) return !0;
      return !1;
    }),
    (c.prototype.eq = function (t) {
      return this == t || (this.type == t.type && a(this.attrs, t.attrs));
    }),
    (c.prototype.toJSON = function () {
      const t = { type: this.type.name };
      for (const e in this.attrs) {
        t.attrs = this.attrs;
        break;
      }
      return t;
    }),
    (c.fromJSON = function (t, e) {
      if (!e) throw new RangeError('Invalid input for Mark.fromJSON');
      const n = t.marks[e.type];
      if (!n)
        throw new RangeError(
          'There is no mark type ' + e.type + ' in this schema',
        );
      return n.create(e.attrs);
    }),
    (c.sameSet = function (t, e) {
      if (t == e) return !0;
      if (t.length != e.length) return !1;
      for (let n = 0; n < t.length; n++) if (!t[n].eq(e[n])) return !1;
      return !0;
    }),
    (c.setFrom = function (t) {
      if (!t || (Array.isArray(t) && t.length == 0)) return c.none;
      if (t instanceof c) return [t];
      const e = t.slice();
      return (
        e.sort(function (t, e) {
          return t.type.rank - e.type.rank;
        }),
        e
      );
    }),
    (c.none = []);
  const l = (function (t) {
    function e() {
      t.apply(this, arguments);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      e
    );
  })(Error);
  const p = function (t, e, n) {
    (this.content = t), (this.openStart = e), (this.openEnd = n);
  };
  const h = { size: { configurable: !0 } };
  function u(t, e, n) {
    const r = t.findIndex(e);
    const o = r.index;
    const i = r.offset;
    const s = t.maybeChild(o);
    const a = t.findIndex(n);
    const c = a.index;
    const l = a.offset;
    if (i == e || s.isText) {
      if (l != n && !t.child(c).isText)
        throw new RangeError('Removing non-flat range');
      return t.cut(0, e).append(t.cut(n));
    }
    if (o != c) throw new RangeError('Removing non-flat range');
    return t.replaceChild(o, s.copy(u(s.content, e - i - 1, n - i - 1)));
  }
  function f(t, e, n, r) {
    const o = t.findIndex(e);
    const i = o.index;
    const s = o.offset;
    const a = t.maybeChild(i);
    if (s == e || a.isText)
      return r && !r.canReplace(i, i, n)
        ? null
        : t.cut(0, e).append(n).append(t.cut(e));
    const c = f(a.content, e - s - 1, n);
    return c && t.replaceChild(i, a.copy(c));
  }
  function d(t, e, n) {
    if (n.openStart > t.depth)
      throw new l('Inserted content deeper than insertion position');
    if (t.depth - n.openStart != e.depth - n.openEnd)
      throw new l('Inconsistent open depths');
    return m(t, e, n, 0);
  }
  function m(t, e, n, o) {
    const i = t.index(o);
    const s = t.node(o);
    if (i == e.index(o) && o < t.depth - n.openStart) {
      const a = m(t, e, n, o + 1);
      return s.copy(s.content.replaceChild(i, a));
    }
    if (n.content.size) {
      if (n.openStart || n.openEnd || t.depth != o || e.depth != o) {
        const c = (function (t, e) {
          for (
            var n = e.depth - t.openStart,
              o = e.node(n).copy(t.content),
              i = n - 1;
            i >= 0;
            i--
          )
            o = e.node(i).copy(r.from(o));
          return {
            start: o.resolveNoCache(t.openStart + n),
            end: o.resolveNoCache(o.content.size - t.openEnd - n),
          };
        })(n, t);
        return b(s, k(t, c.start, c.end, e, o));
      }
      const l = t.parent;
      const p = l.content;
      return b(
        l,
        p
          .cut(0, t.parentOffset)
          .append(n.content)
          .append(p.cut(e.parentOffset)),
      );
    }
    return b(s, x(t, e, o));
  }
  function v(t, e) {
    if (!e.type.compatibleContent(t.type))
      throw new l('Cannot join ' + e.type.name + ' onto ' + t.type.name);
  }
  function g(t, e, n) {
    const r = t.node(n);
    return v(r, e.node(n)), r;
  }
  function y(t, e) {
    const n = e.length - 1;
    n >= 0 && t.isText && t.sameMarkup(e[n])
      ? (e[n] = t.withText(e[n].text + t.text))
      : e.push(t);
  }
  function w(t, e, n, r) {
    const o = (e || t).node(n);
    let i = 0;
    const s = e ? e.index(n) : o.childCount;
    t &&
      ((i = t.index(n)),
      t.depth > n ? i++ : t.textOffset && (y(t.nodeAfter, r), i++));
    for (let a = i; a < s; a++) y(o.child(a), r);
    e && e.depth == n && e.textOffset && y(e.nodeBefore, r);
  }
  function b(t, e) {
    if (!t.type.validContent(e))
      throw new l('Invalid content for node ' + t.type.name);
    return t.copy(e);
  }
  function k(t, e, n, o, i) {
    const s = t.depth > i && g(t, e, i + 1);
    const a = o.depth > i && g(n, o, i + 1);
    const c = [];
    return (
      w(null, t, i, c),
      s && a && e.index(i) == n.index(i)
        ? (v(s, a), y(b(s, k(t, e, n, o, i + 1)), c))
        : (s && y(b(s, x(t, e, i + 1)), c),
          w(e, n, i, c),
          a && y(b(a, x(n, o, i + 1)), c)),
      w(o, null, i, c),
      new r(c)
    );
  }
  function x(t, e, n) {
    const o = [];
    (w(null, t, n, o), t.depth > n) && y(b(g(t, e, n + 1), x(t, e, n + 1)), o);
    return w(e, null, n, o), new r(o);
  }
  (h.size.get = function () {
    return this.content.size - this.openStart - this.openEnd;
  }),
    (p.prototype.insertAt = function (t, e) {
      const n = f(this.content, t + this.openStart, e);
      return n && new p(n, this.openStart, this.openEnd);
    }),
    (p.prototype.removeBetween = function (t, e) {
      return new p(
        u(this.content, t + this.openStart, e + this.openStart),
        this.openStart,
        this.openEnd,
      );
    }),
    (p.prototype.eq = function (t) {
      return (
        this.content.eq(t.content) &&
        this.openStart == t.openStart &&
        this.openEnd == t.openEnd
      );
    }),
    (p.prototype.toString = function () {
      return this.content + '(' + this.openStart + ',' + this.openEnd + ')';
    }),
    (p.prototype.toJSON = function () {
      if (!this.content.size) return null;
      const t = { content: this.content.toJSON() };
      return (
        this.openStart > 0 && (t.openStart = this.openStart),
        this.openEnd > 0 && (t.openEnd = this.openEnd),
        t
      );
    }),
    (p.fromJSON = function (t, e) {
      if (!e) return p.empty;
      const n = e.openStart || 0;
      const o = e.openEnd || 0;
      if ('number' !== typeof n || 'number' !== typeof o)
        throw new RangeError('Invalid input for Slice.fromJSON');
      return new p(r.fromJSON(t, e.content), n, o);
    }),
    (p.maxOpen = function (t, e) {
      void 0 === e && (e = !0);
      for (
        var n = 0, r = 0, o = t.firstChild;
        o && !o.isLeaf && (e || !o.type.spec.isolating);
        o = o.firstChild
      )
        n++;
      for (
        let i = t.lastChild;
        i && !i.isLeaf && (e || !i.type.spec.isolating);
        i = i.lastChild
      )
        r++;
      return new p(t, n, r);
    }),
    Object.defineProperties(p.prototype, h),
    (p.empty = new p(r.empty, 0, 0));
  const S = function (t, e, n) {
    (this.pos = t),
      (this.path = e),
      (this.parentOffset = n),
      (this.depth = e.length / 3 - 1);
  };
  const M = {
    parent: { configurable: !0 },
    doc: { configurable: !0 },
    textOffset: { configurable: !0 },
    nodeAfter: { configurable: !0 },
    nodeBefore: { configurable: !0 },
  };
  (S.prototype.resolveDepth = function (t) {
    return t == null ? this.depth : t < 0 ? this.depth + t : t;
  }),
    (M.parent.get = function () {
      return this.node(this.depth);
    }),
    (M.doc.get = function () {
      return this.node(0);
    }),
    (S.prototype.node = function (t) {
      return this.path[3 * this.resolveDepth(t)];
    }),
    (S.prototype.index = function (t) {
      return this.path[3 * this.resolveDepth(t) + 1];
    }),
    (S.prototype.indexAfter = function (t) {
      return (
        (t = this.resolveDepth(t)),
        this.index(t) + (t != this.depth || this.textOffset ? 1 : 0)
      );
    }),
    (S.prototype.start = function (t) {
      return (t = this.resolveDepth(t)) == 0 ? 0 : this.path[3 * t - 1] + 1;
    }),
    (S.prototype.end = function (t) {
      return (
        (t = this.resolveDepth(t)), this.start(t) + this.node(t).content.size
      );
    }),
    (S.prototype.before = function (t) {
      if (!(t = this.resolveDepth(t)))
        throw new RangeError('There is no position before the top-level node');
      return t == this.depth + 1 ? this.pos : this.path[3 * t - 1];
    }),
    (S.prototype.after = function (t) {
      if (!(t = this.resolveDepth(t)))
        throw new RangeError('There is no position after the top-level node');
      return t == this.depth + 1
        ? this.pos
        : this.path[3 * t - 1] + this.path[3 * t].nodeSize;
    }),
    (M.textOffset.get = function () {
      return this.pos - this.path[this.path.length - 1];
    }),
    (M.nodeAfter.get = function () {
      const t = this.parent;
      const e = this.index(this.depth);
      if (e == t.childCount) return null;
      const n = this.pos - this.path[this.path.length - 1];
      const r = t.child(e);
      return n ? t.child(e).cut(n) : r;
    }),
    (M.nodeBefore.get = function () {
      const t = this.index(this.depth);
      const e = this.pos - this.path[this.path.length - 1];
      return e
        ? this.parent.child(t).cut(0, e)
        : t == 0
        ? null
        : this.parent.child(t - 1);
    }),
    (S.prototype.posAtIndex = function (t, e) {
      e = this.resolveDepth(e);
      for (
        var n = this.path[3 * e],
          r = e == 0 ? 0 : this.path[3 * e - 1] + 1,
          o = 0;
        o < t;
        o++
      )
        r += n.child(o).nodeSize;
      return r;
    }),
    (S.prototype.marks = function () {
      const t = this.parent;
      const e = this.index();
      if (t.content.size == 0) return c.none;
      if (this.textOffset) return t.child(e).marks;
      let n = t.maybeChild(e - 1);
      let r = t.maybeChild(e);
      if (!n) {
        const o = n;
        (n = r), (r = o);
      }
      for (var i = n.marks, s = 0; s < i.length; s++)
        !1 !== i[s].type.spec.inclusive ||
          (r && i[s].isInSet(r.marks)) ||
          (i = i[s--].removeFromSet(i));
      return i;
    }),
    (S.prototype.marksAcross = function (t) {
      const e = this.parent.maybeChild(this.index());
      if (!e || !e.isInline) return null;
      for (
        var n = e.marks, r = t.parent.maybeChild(t.index()), o = 0;
        o < n.length;
        o++
      )
        !1 !== n[o].type.spec.inclusive ||
          (r && n[o].isInSet(r.marks)) ||
          (n = n[o--].removeFromSet(n));
      return n;
    }),
    (S.prototype.sharedDepth = function (t) {
      for (let e = this.depth; e > 0; e--)
        if (this.start(e) <= t && this.end(e) >= t) return e;
      return 0;
    }),
    (S.prototype.blockRange = function (t, e) {
      if ((void 0 === t && (t = this), t.pos < this.pos))
        return t.blockRange(this);
      for (
        let n =
          this.depth - (this.parent.inlineContent || this.pos == t.pos ? 1 : 0);
        n >= 0;
        n--
      )
        if (t.pos <= this.end(n) && (!e || e(this.node(n))))
          return new D(this, t, n);
      return null;
    }),
    (S.prototype.sameParent = function (t) {
      return this.pos - this.parentOffset == t.pos - t.parentOffset;
    }),
    (S.prototype.max = function (t) {
      return t.pos > this.pos ? t : this;
    }),
    (S.prototype.min = function (t) {
      return t.pos < this.pos ? t : this;
    }),
    (S.prototype.toString = function () {
      for (var t = '', e = 1; e <= this.depth; e++)
        t += (t ? '/' : '') + this.node(e).type.name + '_' + this.index(e - 1);
      return t + ':' + this.parentOffset;
    }),
    (S.resolve = function (t, e) {
      if (!(e >= 0 && e <= t.content.size))
        throw new RangeError('Position ' + e + ' out of range');
      for (var n = [], r = 0, o = e, i = t; ; ) {
        const s = i.content.findIndex(o);
        const a = s.index;
        const c = s.offset;
        const l = o - c;
        if ((n.push(i, a, r + c), !l)) break;
        if ((i = i.child(a)).isText) break;
        (o = l - 1), (r += c + 1);
      }
      return new S(e, n, o);
    }),
    (S.resolveCached = function (t, e) {
      for (let n = 0; n < C.length; n++) {
        const r = C[n];
        if (r.pos == e && r.doc == t) return r;
      }
      const o = (C[O] = S.resolve(t, e));
      return (O = (O + 1) % N), o;
    }),
    Object.defineProperties(S.prototype, M);
  var C = [];
  var O = 0;
  var N = 12;
  var D = function (t, e, n) {
    (this.$from = t), (this.$to = e), (this.depth = n);
  };
  const T = {
    start: { configurable: !0 },
    end: { configurable: !0 },
    parent: { configurable: !0 },
    startIndex: { configurable: !0 },
    endIndex: { configurable: !0 },
  };
  (T.start.get = function () {
    return this.$from.before(this.depth + 1);
  }),
    (T.end.get = function () {
      return this.$to.after(this.depth + 1);
    }),
    (T.parent.get = function () {
      return this.$from.node(this.depth);
    }),
    (T.startIndex.get = function () {
      return this.$from.index(this.depth);
    }),
    (T.endIndex.get = function () {
      return this.$to.indexAfter(this.depth);
    }),
    Object.defineProperties(D.prototype, T);
  const A = Object.create(null);
  const E = function (t, e, n, o) {
    void 0 === o && (o = c.none),
      (this.type = t),
      (this.attrs = e),
      (this.marks = o),
      (this.content = n || r.empty);
  };
  const I = {
    nodeSize: { configurable: !0 },
    childCount: { configurable: !0 },
    textContent: { configurable: !0 },
    firstChild: { configurable: !0 },
    lastChild: { configurable: !0 },
    isBlock: { configurable: !0 },
    isTextblock: { configurable: !0 },
    inlineContent: { configurable: !0 },
    isInline: { configurable: !0 },
    isText: { configurable: !0 },
    isLeaf: { configurable: !0 },
    isAtom: { configurable: !0 },
  };
  (I.nodeSize.get = function () {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }),
    (I.childCount.get = function () {
      return this.content.childCount;
    }),
    (E.prototype.child = function (t) {
      return this.content.child(t);
    }),
    (E.prototype.maybeChild = function (t) {
      return this.content.maybeChild(t);
    }),
    (E.prototype.forEach = function (t) {
      this.content.forEach(t);
    }),
    (E.prototype.nodesBetween = function (t, e, n, r) {
      void 0 === r && (r = 0), this.content.nodesBetween(t, e, n, r, this);
    }),
    (E.prototype.descendants = function (t) {
      this.nodesBetween(0, this.content.size, t);
    }),
    (I.textContent.get = function () {
      return this.isLeaf && this.type.spec.leafText
        ? this.type.spec.leafText(this)
        : this.textBetween(0, this.content.size, '');
    }),
    (E.prototype.textBetween = function (t, e, n, r) {
      return this.content.textBetween(t, e, n, r);
    }),
    (I.firstChild.get = function () {
      return this.content.firstChild;
    }),
    (I.lastChild.get = function () {
      return this.content.lastChild;
    }),
    (E.prototype.eq = function (t) {
      return this == t || (this.sameMarkup(t) && this.content.eq(t.content));
    }),
    (E.prototype.sameMarkup = function (t) {
      return this.hasMarkup(t.type, t.attrs, t.marks);
    }),
    (E.prototype.hasMarkup = function (t, e, n) {
      return (
        this.type == t &&
        a(this.attrs, e || t.defaultAttrs || A) &&
        c.sameSet(this.marks, n || c.none)
      );
    }),
    (E.prototype.copy = function (t) {
      return (
        void 0 === t && (t = null),
        t == this.content ? this : new E(this.type, this.attrs, t, this.marks)
      );
    }),
    (E.prototype.mark = function (t) {
      return t == this.marks
        ? this
        : new E(this.type, this.attrs, this.content, t);
    }),
    (E.prototype.cut = function (t, e) {
      return (
        void 0 === e && (e = this.content.size),
        t == 0 && e == this.content.size
          ? this
          : this.copy(this.content.cut(t, e))
      );
    }),
    (E.prototype.slice = function (t, e, n) {
      if (
        (void 0 === e && (e = this.content.size),
        void 0 === n && (n = !1),
        t == e)
      )
        return p.empty;
      const r = this.resolve(t);
      const o = this.resolve(e);
      const i = n ? 0 : r.sharedDepth(e);
      const s = r.start(i);
      const a = r.node(i).content.cut(r.pos - s, o.pos - s);
      return new p(a, r.depth - i, o.depth - i);
    }),
    (E.prototype.replace = function (t, e, n) {
      return d(this.resolve(t), this.resolve(e), n);
    }),
    (E.prototype.nodeAt = function (t) {
      for (let e = this; ; ) {
        const n = e.content.findIndex(t);
        const r = n.index;
        const o = n.offset;
        if (!(e = e.maybeChild(r))) return null;
        if (o == t || e.isText) return e;
        t -= o + 1;
      }
    }),
    (E.prototype.childAfter = function (t) {
      const e = this.content.findIndex(t);
      const n = e.index;
      const r = e.offset;
      return { node: this.content.maybeChild(n), index: n, offset: r };
    }),
    (E.prototype.childBefore = function (t) {
      if (t == 0) return { node: null, index: 0, offset: 0 };
      const e = this.content.findIndex(t);
      const n = e.index;
      const r = e.offset;
      if (r < t) return { node: this.content.child(n), index: n, offset: r };
      const o = this.content.child(n - 1);
      return { node: o, index: n - 1, offset: r - o.nodeSize };
    }),
    (E.prototype.resolve = function (t) {
      return S.resolveCached(this, t);
    }),
    (E.prototype.resolveNoCache = function (t) {
      return S.resolve(this, t);
    }),
    (E.prototype.rangeHasMark = function (t, e, n) {
      let r = !1;
      return (
        e > t &&
          this.nodesBetween(t, e, function (t) {
            return n.isInSet(t.marks) && (r = !0), !r;
          }),
        r
      );
    }),
    (I.isBlock.get = function () {
      return this.type.isBlock;
    }),
    (I.isTextblock.get = function () {
      return this.type.isTextblock;
    }),
    (I.inlineContent.get = function () {
      return this.type.inlineContent;
    }),
    (I.isInline.get = function () {
      return this.type.isInline;
    }),
    (I.isText.get = function () {
      return this.type.isText;
    }),
    (I.isLeaf.get = function () {
      return this.type.isLeaf;
    }),
    (I.isAtom.get = function () {
      return this.type.isAtom;
    }),
    (E.prototype.toString = function () {
      if (this.type.spec.toDebugString)
        return this.type.spec.toDebugString(this);
      let t = this.type.name;
      return (
        this.content.size && (t += '(' + this.content.toStringInner() + ')'),
        z(this.marks, t)
      );
    }),
    (E.prototype.contentMatchAt = function (t) {
      const e = this.type.contentMatch.matchFragment(this.content, 0, t);
      if (!e)
        throw new Error('Called contentMatchAt on a node with invalid content');
      return e;
    }),
    (E.prototype.canReplace = function (t, e, n, o, i) {
      void 0 === n && (n = r.empty),
        void 0 === o && (o = 0),
        void 0 === i && (i = n.childCount);
      const s = this.contentMatchAt(t).matchFragment(n, o, i);
      const a = s && s.matchFragment(this.content, e);
      if (!a || !a.validEnd) return !1;
      for (let c = o; c < i; c++)
        if (!this.type.allowsMarks(n.child(c).marks)) return !1;
      return !0;
    }),
    (E.prototype.canReplaceWith = function (t, e, n, r) {
      if (r && !this.type.allowsMarks(r)) return !1;
      const o = this.contentMatchAt(t).matchType(n);
      const i = o && o.matchFragment(this.content, e);
      return !!i && i.validEnd;
    }),
    (E.prototype.canAppend = function (t) {
      return t.content.size
        ? this.canReplace(this.childCount, this.childCount, t.content)
        : this.type.compatibleContent(t.type);
    }),
    (E.prototype.check = function () {
      if (!this.type.validContent(this.content))
        throw new RangeError(
          'Invalid content for node ' +
            this.type.name +
            ': ' +
            this.content.toString().slice(0, 50),
        );
      for (var t = c.none, e = 0; e < this.marks.length; e++)
        t = this.marks[e].addToSet(t);
      if (!c.sameSet(t, this.marks))
        throw new RangeError(
          'Invalid collection of marks for node ' +
            this.type.name +
            ': ' +
            this.marks.map(function (t) {
              return t.type.name;
            }),
        );
      this.content.forEach(function (t) {
        return t.check();
      });
    }),
    (E.prototype.toJSON = function () {
      const t = { type: this.type.name };
      for (const e in this.attrs) {
        t.attrs = this.attrs;
        break;
      }
      return (
        this.content.size && (t.content = this.content.toJSON()),
        this.marks.length &&
          (t.marks = this.marks.map(function (t) {
            return t.toJSON();
          })),
        t
      );
    }),
    (E.fromJSON = function (t, e) {
      if (!e) throw new RangeError('Invalid input for Node.fromJSON');
      let n = null;
      if (e.marks) {
        if (!Array.isArray(e.marks))
          throw new RangeError('Invalid mark data for Node.fromJSON');
        n = e.marks.map(t.markFromJSON);
      }
      if (e.type == 'text') {
        if ('string' !== typeof e.text)
          throw new RangeError('Invalid text node in JSON');
        return t.text(e.text, n);
      }
      const o = r.fromJSON(t, e.content);
      return t.nodeType(e.type).create(e.attrs, o, n);
    }),
    Object.defineProperties(E.prototype, I),
    (E.prototype.text = void 0);
  const R = (function (t) {
    function e(e, n, r, o) {
      if ((t.call(this, e, n, null, o), !r))
        throw new RangeError('Empty text nodes are not allowed');
      this.text = r;
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = {
      textContent: { configurable: !0 },
      nodeSize: { configurable: !0 },
    };
    return (
      (e.prototype.toString = function () {
        return this.type.spec.toDebugString
          ? this.type.spec.toDebugString(this)
          : z(this.marks, JSON.stringify(this.text));
      }),
      (n.textContent.get = function () {
        return this.text;
      }),
      (e.prototype.textBetween = function (t, e) {
        return this.text.slice(t, e);
      }),
      (n.nodeSize.get = function () {
        return this.text.length;
      }),
      (e.prototype.mark = function (t) {
        return t == this.marks
          ? this
          : new e(this.type, this.attrs, this.text, t);
      }),
      (e.prototype.withText = function (t) {
        return t == this.text
          ? this
          : new e(this.type, this.attrs, t, this.marks);
      }),
      (e.prototype.cut = function (t, e) {
        return (
          void 0 === t && (t = 0),
          void 0 === e && (e = this.text.length),
          t == 0 && e == this.text.length
            ? this
            : this.withText(this.text.slice(t, e))
        );
      }),
      (e.prototype.eq = function (t) {
        return this.sameMarkup(t) && this.text == t.text;
      }),
      (e.prototype.toJSON = function () {
        const e = t.prototype.toJSON.call(this);
        return (e.text = this.text), e;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(E);
  function z(t, e) {
    for (let n = t.length - 1; n >= 0; n--) e = t[n].type.name + '(' + e + ')';
    return e;
  }
  const P = function (t) {
    (this.validEnd = t), (this.next = []), (this.wrapCache = []);
  };
  const B = {
    inlineContent: { configurable: !0 },
    defaultType: { configurable: !0 },
    edgeCount: { configurable: !0 },
  };
  (P.parse = function (t, e) {
    const n = new _(t, e);
    if (n.next == null) return P.empty;
    const r = F(n);
    n.next && n.err('Unexpected trailing text');
    const o = (function (t) {
      const e = Object.create(null);
      return n(W(t, 0));
      function n(r) {
        const o = [];
        r.forEach(function (e) {
          t[e].forEach(function (e) {
            const n = e.term;
            const r = e.to;
            if (n) {
              for (var i, s = 0; s < o.length; s++)
                o[s][0] == n && (i = o[s][1]);
              W(t, r).forEach(function (t) {
                i || o.push([n, (i = [])]), i.indexOf(t) == -1 && i.push(t);
              });
            }
          });
        });
        for (
          var i = (e[r.join(',')] = new P(r.indexOf(t.length - 1) > -1)), s = 0;
          s < o.length;
          s++
        ) {
          const a = o[s][1].sort(J);
          i.next.push({ type: o[s][0], next: e[a.join(',')] || n(a) });
        }
        return i;
      }
    })(
      (function (t) {
        const e = [[]];
        return o(i(t, 0), n()), e;
        function n() {
          return e.push([]) - 1;
        }
        function r(t, n, r) {
          const o = { term: r, to: n };
          return e[t].push(o), o;
        }
        function o(t, e) {
          t.forEach(function (t) {
            return (t.to = e);
          });
        }
        function i(t, e) {
          if (t.type == 'choice')
            return t.exprs.reduce(function (t, n) {
              return t.concat(i(n, e));
            }, []);
          if ('seq' != t.type) {
            if (t.type == 'star') {
              const s = n();
              return r(e, s), o(i(t.expr, s), s), [r(s)];
            }
            if (t.type == 'plus') {
              const a = n();
              return o(i(t.expr, e), a), o(i(t.expr, a), a), [r(a)];
            }
            if (t.type == 'opt') return [r(e)].concat(i(t.expr, e));
            if (t.type == 'range') {
              for (var c = e, l = 0; l < t.min; l++) {
                const p = n();
                o(i(t.expr, c), p), (c = p);
              }
              if (t.max == -1) o(i(t.expr, c), c);
              else
                for (let h = t.min; h < t.max; h++) {
                  const u = n();
                  r(c, u), o(i(t.expr, c), u), (c = u);
                }
              return [r(c)];
            }
            if (t.type == 'name') return [r(e, void 0, t.value)];
            throw new Error('Unknown expr type');
          }
          for (let f = 0; ; f++) {
            const d = i(t.exprs[f], e);
            if (f == t.exprs.length - 1) return d;
            o(d, (e = n()));
          }
        }
      })(r),
    );
    return (
      (function (t, e) {
        for (let n = 0, r = [t]; n < r.length; n++) {
          for (
            var o = r[n], i = !o.validEnd, s = [], a = 0;
            a < o.next.length;
            a++
          ) {
            const c = o.next[a];
            const l = c.type;
            const p = c.next;
            s.push(l.name),
              !i || l.isText || l.hasRequiredAttrs() || (i = !1),
              r.indexOf(p) == -1 && r.push(p);
          }
          i &&
            e.err(
              'Only non-generatable nodes (' +
                s.join(', ') +
                ') in a required position (see https://prosemirror.net/docs/guide/#generatable)',
            );
        }
      })(o, n),
      o
    );
  }),
    (P.prototype.matchType = function (t) {
      for (let e = 0; e < this.next.length; e++)
        if (this.next[e].type == t) return this.next[e].next;
      return null;
    }),
    (P.prototype.matchFragment = function (t, e, n) {
      void 0 === e && (e = 0), void 0 === n && (n = t.childCount);
      for (var r = this, o = e; r && o < n; o++)
        r = r.matchType(t.child(o).type);
      return r;
    }),
    (B.inlineContent.get = function () {
      return this.next.length && this.next[0].type.isInline;
    }),
    (B.defaultType.get = function () {
      for (let t = 0; t < this.next.length; t++) {
        const e = this.next[t].type;
        if (!e.isText && !e.hasRequiredAttrs()) return e;
      }
      return null;
    }),
    (P.prototype.compatible = function (t) {
      for (let e = 0; e < this.next.length; e++)
        for (let n = 0; n < t.next.length; n++)
          if (this.next[e].type == t.next[n].type) return !0;
      return !1;
    }),
    (P.prototype.fillBefore = function (t, e, n) {
      void 0 === e && (e = !1), void 0 === n && (n = 0);
      const o = [this];
      return (function i(s, a) {
        const c = s.matchFragment(t, n);
        if (c && (!e || c.validEnd))
          return r.from(
            a.map(function (t) {
              return t.createAndFill();
            }),
          );
        for (let l = 0; l < s.next.length; l++) {
          const p = s.next[l];
          const h = p.type;
          const u = p.next;
          if (!h.isText && !h.hasRequiredAttrs() && o.indexOf(u) == -1) {
            o.push(u);
            const f = i(u, a.concat(h));
            if (f) return f;
          }
        }
        return null;
      })(this, []);
    }),
    (P.prototype.findWrapping = function (t) {
      for (let e = 0; e < this.wrapCache.length; e += 2)
        if (this.wrapCache[e] == t) return this.wrapCache[e + 1];
      const n = this.computeWrapping(t);
      return this.wrapCache.push(t, n), n;
    }),
    (P.prototype.computeWrapping = function (t) {
      for (
        let e = Object.create(null),
          n = [{ match: this, type: null, via: null }];
        n.length;

      ) {
        const r = n.shift();
        const o = r.match;
        if (o.matchType(t)) {
          for (var i = [], s = r; s.type; s = s.via) i.push(s.type);
          return i.reverse();
        }
        for (let a = 0; a < o.next.length; a++) {
          const c = o.next[a];
          const l = c.type;
          const p = c.next;
          l.isLeaf ||
            l.hasRequiredAttrs() ||
            l.name in e ||
            (r.type && !p.validEnd) ||
            (n.push({ match: l.contentMatch, type: l, via: r }),
            (e[l.name] = !0));
        }
      }
      return null;
    }),
    (B.edgeCount.get = function () {
      return this.next.length;
    }),
    (P.prototype.edge = function (t) {
      if (t >= this.next.length)
        throw new RangeError(
          "There's no " + t + 'th edge in this content match',
        );
      return this.next[t];
    }),
    (P.prototype.toString = function () {
      const t = [];
      return (
        (function e(n) {
          t.push(n);
          for (let r = 0; r < n.next.length; r++)
            t.indexOf(n.next[r].next) == -1 && e(n.next[r].next);
        })(this),
        t
          .map(function (e, n) {
            for (
              var r = n + (e.validEnd ? '*' : ' ') + ' ', o = 0;
              o < e.next.length;
              o++
            )
              r +=
                (o ? ', ' : '') +
                e.next[o].type.name +
                '->' +
                t.indexOf(e.next[o].next);
            return r;
          })
          .join('\n')
      );
    }),
    Object.defineProperties(P.prototype, B),
    (P.empty = new P(!0));
  var _ = function (t, e) {
    (this.string = t),
      (this.nodeTypes = e),
      (this.inline = null),
      (this.pos = 0),
      (this.tokens = t.split(/\s*(?=\b|\W|$)/)),
      this.tokens[this.tokens.length - 1] == '' && this.tokens.pop(),
      this.tokens[0] == '' && this.tokens.shift();
  };
  const V = { next: { configurable: !0 } };
  function F(t) {
    const e = [];
    do {
      e.push($(t));
    } while (t.eat('|'));
    return e.length == 1 ? e[0] : { type: 'choice', exprs: e };
  }
  function $(t) {
    const e = [];
    do {
      e.push(q(t));
    } while (t.next && ')' != t.next && '|' != t.next);
    return e.length == 1 ? e[0] : { type: 'seq', exprs: e };
  }
  function q(t) {
    for (
      var e = (function (t) {
        if (t.eat('(')) {
          const e = F(t);
          return t.eat(')') || t.err('Missing closing paren'), e;
        }
        if (!/\W/.test(t.next)) {
          const n = (function (t, e) {
            const n = t.nodeTypes;
            const r = n[e];
            if (r) return [r];
            const o = [];
            for (const i in n) {
              const s = n[i];
              s.groups.indexOf(e) > -1 && o.push(s);
            }
            o.length == 0 && t.err("No node type or group '" + e + "' found");
            return o;
          })(t, t.next).map(function (e) {
            return (
              t.inline == null
                ? (t.inline = e.isInline)
                : t.inline != e.isInline &&
                  t.err('Mixing inline and block content'),
              { type: 'name', value: e }
            );
          });
          return t.pos++, n.length == 1 ? n[0] : { type: 'choice', exprs: n };
        }
        t.err("Unexpected token '" + t.next + "'");
      })(t);
      ;

    )
      if (t.eat('+')) e = { type: 'plus', expr: e };
      else if (t.eat('*')) e = { type: 'star', expr: e };
      else if (t.eat('?')) e = { type: 'opt', expr: e };
      else {
        if (!t.eat('{')) break;
        e = j(t, e);
      }
    return e;
  }
  function L(t) {
    /\D/.test(t.next) && t.err("Expected number, got '" + t.next + "'");
    const e = Number(t.next);
    return t.pos++, e;
  }
  function j(t, e) {
    const n = L(t);
    let r = n;
    return (
      t.eat(',') && (r = '}' != t.next ? L(t) : -1),
      t.eat('}') || t.err('Unclosed braced range'),
      { type: 'range', min: n, max: r, expr: e }
    );
  }
  function J(t, e) {
    return e - t;
  }
  function W(t, e) {
    const n = [];
    return (
      (function e(r) {
        const o = t[r];
        if (o.length == 1 && !o[0].term) return e(o[0].to);
        n.push(r);
        for (let i = 0; i < o.length; i++) {
          const s = o[i];
          const a = s.term;
          const c = s.to;
          a || -1 != n.indexOf(c) || e(c);
        }
      })(e),
      n.sort(J)
    );
  }
  function K(t) {
    const e = Object.create(null);
    for (const n in t) {
      const r = t[n];
      if (!r.hasDefault) return null;
      e[n] = r.default;
    }
    return e;
  }
  function H(t, e) {
    const n = Object.create(null);
    for (const r in t) {
      let o = e && e[r];
      if (void 0 === o) {
        const i = t[r];
        if (!i.hasDefault)
          throw new RangeError('No value supplied for attribute ' + r);
        o = i.default;
      }
      n[r] = o;
    }
    return n;
  }
  function U(t) {
    const e = Object.create(null);
    if (t) for (const n in t) e[n] = new X(t[n]);
    return e;
  }
  (V.next.get = function () {
    return this.tokens[this.pos];
  }),
    (_.prototype.eat = function (t) {
      return this.next == t && (this.pos++ || !0);
    }),
    (_.prototype.err = function (t) {
      throw new SyntaxError(
        t + " (in content expression '" + this.string + "')",
      );
    }),
    Object.defineProperties(_.prototype, V);
  const G = function (t, e, n) {
    (this.name = t),
      (this.schema = e),
      (this.spec = n),
      (this.markSet = null),
      (this.groups = n.group ? n.group.split(' ') : []),
      (this.attrs = U(n.attrs)),
      (this.defaultAttrs = K(this.attrs)),
      (this.contentMatch = null),
      (this.inlineContent = null),
      (this.isBlock = !(n.inline || t == 'text')),
      (this.isText = t == 'text');
  };
  const Q = {
    isInline: { configurable: !0 },
    isTextblock: { configurable: !0 },
    isLeaf: { configurable: !0 },
    isAtom: { configurable: !0 },
    whitespace: { configurable: !0 },
  };
  (Q.isInline.get = function () {
    return !this.isBlock;
  }),
    (Q.isTextblock.get = function () {
      return this.isBlock && this.inlineContent;
    }),
    (Q.isLeaf.get = function () {
      return this.contentMatch == P.empty;
    }),
    (Q.isAtom.get = function () {
      return this.isLeaf || !!this.spec.atom;
    }),
    (Q.whitespace.get = function () {
      return this.spec.whitespace || (this.spec.code ? 'pre' : 'normal');
    }),
    (G.prototype.hasRequiredAttrs = function () {
      for (const t in this.attrs) if (this.attrs[t].isRequired) return !0;
      return !1;
    }),
    (G.prototype.compatibleContent = function (t) {
      return this == t || this.contentMatch.compatible(t.contentMatch);
    }),
    (G.prototype.computeAttrs = function (t) {
      return !t && this.defaultAttrs ? this.defaultAttrs : H(this.attrs, t);
    }),
    (G.prototype.create = function (t, e, n) {
      if ((void 0 === t && (t = null), this.isText))
        throw new Error("NodeType.create can't construct text nodes");
      return new E(this, this.computeAttrs(t), r.from(e), c.setFrom(n));
    }),
    (G.prototype.createChecked = function (t, e, n) {
      if ((void 0 === t && (t = null), (e = r.from(e)), !this.validContent(e)))
        throw new RangeError('Invalid content for node ' + this.name);
      return new E(this, this.computeAttrs(t), e, c.setFrom(n));
    }),
    (G.prototype.createAndFill = function (t, e, n) {
      if (
        (void 0 === t && (t = null),
        (t = this.computeAttrs(t)),
        (e = r.from(e)).size)
      ) {
        const o = this.contentMatch.fillBefore(e);
        if (!o) return null;
        e = o.append(e);
      }
      const i = this.contentMatch.matchFragment(e);
      const s = i && i.fillBefore(r.empty, !0);
      return s ? new E(this, t, e.append(s), c.setFrom(n)) : null;
    }),
    (G.prototype.validContent = function (t) {
      const e = this.contentMatch.matchFragment(t);
      if (!e || !e.validEnd) return !1;
      for (let n = 0; n < t.childCount; n++)
        if (!this.allowsMarks(t.child(n).marks)) return !1;
      return !0;
    }),
    (G.prototype.allowsMarkType = function (t) {
      return this.markSet == null || this.markSet.indexOf(t) > -1;
    }),
    (G.prototype.allowsMarks = function (t) {
      if (this.markSet == null) return !0;
      for (let e = 0; e < t.length; e++)
        if (!this.allowsMarkType(t[e].type)) return !1;
      return !0;
    }),
    (G.prototype.allowedMarks = function (t) {
      if (this.markSet == null) return t;
      for (var e, n = 0; n < t.length; n++)
        this.allowsMarkType(t[n].type)
          ? e && e.push(t[n])
          : e || (e = t.slice(0, n));
      return e ? (e.length ? e : c.none) : t;
    }),
    (G.compile = function (t, e) {
      const n = Object.create(null);
      t.forEach(function (t, r) {
        return (n[t] = new G(t, e, r));
      });
      const r = e.spec.topNode || 'doc';
      if (!n[r])
        throw new RangeError(
          "Schema is missing its top node type ('" + r + "')",
        );
      if (!n.text) throw new RangeError("Every schema needs a 'text' type");
      for (const o in n.text.attrs)
        throw new RangeError('The text node type should not have attributes');
      return n;
    }),
    Object.defineProperties(G.prototype, Q);
  var X = function (t) {
    (this.hasDefault = Object.hasOwn(t, 'default')), (this.default = t.default);
  };
  const Y = { isRequired: { configurable: !0 } };
  (Y.isRequired.get = function () {
    return !this.hasDefault;
  }),
    Object.defineProperties(X.prototype, Y);
  const Z = function (t, e, n, r) {
    (this.name = t),
      (this.rank = e),
      (this.schema = n),
      (this.spec = r),
      (this.attrs = U(r.attrs)),
      (this.excluded = null);
    const o = K(this.attrs);
    this.instance = o ? new c(this, o) : null;
  };
  (Z.prototype.create = function (t) {
    return (
      void 0 === t && (t = null),
      !t && this.instance ? this.instance : new c(this, H(this.attrs, t))
    );
  }),
    (Z.compile = function (t, e) {
      const n = Object.create(null);
      let r = 0;
      return (
        t.forEach(function (t, o) {
          return (n[t] = new Z(t, r++, e, o));
        }),
        n
      );
    }),
    (Z.prototype.removeFromSet = function (t) {
      for (let e = 0; e < t.length; e++)
        t[e].type == this && ((t = t.slice(0, e).concat(t.slice(e + 1))), e--);
      return t;
    }),
    (Z.prototype.isInSet = function (t) {
      for (let e = 0; e < t.length; e++) if (t[e].type == this) return t[e];
    }),
    (Z.prototype.excludes = function (t) {
      return this.excluded.indexOf(t) > -1;
    });
  const tt = function (e) {
    (this.cached = Object.create(null)),
      (this.spec = {
        nodes: t.from(e.nodes),
        marks: t.from(e.marks || {}),
        topNode: e.topNode,
      }),
      (this.nodes = G.compile(this.spec.nodes, this)),
      (this.marks = Z.compile(this.spec.marks, this));
    const n = Object.create(null);
    for (const r in this.nodes) {
      if (r in this.marks)
        throw new RangeError(r + ' can not be both a node and a mark');
      const o = this.nodes[r];
      const i = o.spec.content || '';
      const s = o.spec.marks;
      (o.contentMatch = n[i] || (n[i] = P.parse(i, this.nodes))),
        (o.inlineContent = o.contentMatch.inlineContent),
        (o.markSet =
          s == '_'
            ? null
            : s
            ? et(this, s.split(' '))
            : '' != s && o.inlineContent
            ? null
            : []);
    }
    for (const a in this.marks) {
      const c = this.marks[a];
      const l = c.spec.excludes;
      c.excluded = l == null ? [c] : l == '' ? [] : et(this, l.split(' '));
    }
    (this.nodeFromJSON = this.nodeFromJSON.bind(this)),
      (this.markFromJSON = this.markFromJSON.bind(this)),
      (this.topNodeType = this.nodes[this.spec.topNode || 'doc']),
      (this.cached.wrappings = Object.create(null));
  };
  function et(t, e) {
    for (var n = [], r = 0; r < e.length; r++) {
      const o = e[r];
      const i = t.marks[o];
      let s = i;
      if (i) n.push(i);
      else
        for (const a in t.marks) {
          const c = t.marks[a];
          (o == '_' ||
            (c.spec.group && c.spec.group.split(' ').indexOf(o) > -1)) &&
            n.push((s = c));
        }
      if (!s) throw new SyntaxError("Unknown mark type: '" + e[r] + "'");
    }
    return n;
  }
  (tt.prototype.node = function (t, e, n, r) {
    if ((void 0 === e && (e = null), typeof t === 'string'))
      t = this.nodeType(t);
    else {
      if (!(t instanceof G)) throw new RangeError('Invalid node type: ' + t);
      if (t.schema != this)
        throw new RangeError(
          'Node type from different schema used (' + t.name + ')',
        );
    }
    return t.createChecked(e, n, r);
  }),
    (tt.prototype.text = function (t, e) {
      const n = this.nodes.text;
      return new R(n, n.defaultAttrs, t, c.setFrom(e));
    }),
    (tt.prototype.mark = function (t, e) {
      return typeof t === 'string' && (t = this.marks[t]), t.create(e);
    }),
    (tt.prototype.nodeFromJSON = function (t) {
      return E.fromJSON(this, t);
    }),
    (tt.prototype.markFromJSON = function (t) {
      return c.fromJSON(this, t);
    }),
    (tt.prototype.nodeType = function (t) {
      const e = this.nodes[t];
      if (!e) throw new RangeError('Unknown node type: ' + t);
      return e;
    });
  const nt = function (t, e) {
    const n = this;
    (this.schema = t),
      (this.rules = e),
      (this.tags = []),
      (this.styles = []),
      e.forEach(function (t) {
        t.tag ? n.tags.push(t) : t.style && n.styles.push(t);
      }),
      (this.normalizeLists = !this.tags.some(function (e) {
        if (!/^(ul|ol)\b/.test(e.tag) || !e.node) return !1;
        const n = t.nodes[e.node];
        return n.contentMatch.matchType(n);
      }));
  };
  (nt.prototype.parse = function (t, e) {
    void 0 === e && (e = {});
    const n = new ct(this, e, !1);
    return n.addAll(t, e.from, e.to), n.finish();
  }),
    (nt.prototype.parseSlice = function (t, e) {
      void 0 === e && (e = {});
      const n = new ct(this, e, !0);
      return n.addAll(t, e.from, e.to), p.maxOpen(n.finish());
    }),
    (nt.prototype.matchTag = function (t, e, n) {
      for (
        let r = n ? this.tags.indexOf(n) + 1 : 0;
        r < this.tags.length;
        r++
      ) {
        const o = this.tags[r];
        if (
          pt(t, o.tag) &&
          (void 0 === o.namespace || t.namespaceURI == o.namespace) &&
          (!o.context || e.matchesContext(o.context))
        ) {
          if (o.getAttrs) {
            const i = o.getAttrs(t);
            if (!1 === i) continue;
            o.attrs = i || void 0;
          }
          return o;
        }
      }
    }),
    (nt.prototype.matchStyle = function (t, e, n, r) {
      for (
        let o = r ? this.styles.indexOf(r) + 1 : 0;
        o < this.styles.length;
        o++
      ) {
        const i = this.styles[o];
        const s = i.style;
        if (
          !(
            0 != s.indexOf(t) ||
            (i.context && !n.matchesContext(i.context)) ||
            (s.length > t.length &&
              (61 != s.charCodeAt(t.length) || s.slice(t.length + 1) != e))
          )
        ) {
          if (i.getAttrs) {
            const a = i.getAttrs(e);
            if (!1 === a) continue;
            i.attrs = a || void 0;
          }
          return i;
        }
      }
    }),
    (nt.schemaRules = function (t) {
      const e = [];
      function n(t) {
        for (
          var n = t.priority == null ? 50 : t.priority, r = 0;
          r < e.length;
          r++
        ) {
          const o = e[r];
          if ((o.priority == null ? 50 : o.priority) < n) break;
        }
        e.splice(r, 0, t);
      }
      const r = function (e) {
        const r = t.marks[e].spec.parseDOM;
        r &&
          r.forEach(function (t) {
            n((t = ht(t))), (t.mark = e);
          });
      };
      for (const o in t.marks) r(o);
      let i;
      for (var s in t.nodes)
        (i = void 0),
          (i = t.nodes[s].spec.parseDOM) &&
            i.forEach(function (t) {
              n((t = ht(t))), (t.node = s);
            });
      return e;
    }),
    (nt.fromSchema = function (t) {
      return (
        t.cached.domParser ||
        (t.cached.domParser = new nt(t, nt.schemaRules(t)))
      );
    });
  const rt = {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    canvas: !0,
    dd: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    figcaption: !0,
    figure: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    li: !0,
    noscript: !0,
    ol: !0,
    output: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    tfoot: !0,
    ul: !0,
  };
  const ot = {
    head: !0,
    noscript: !0,
    object: !0,
    script: !0,
    style: !0,
    title: !0,
  };
  const it = { ol: !0, ul: !0 };
  function st(t, e, n) {
    return null != e
      ? (e ? 1 : 0) | (e === 'full' ? 2 : 0)
      : t && t.whitespace == 'pre'
      ? 3
      : -5 & n;
  }
  const at = function (t, e, n, r, o, i, s) {
    (this.type = t),
      (this.attrs = e),
      (this.marks = n),
      (this.pendingMarks = r),
      (this.solid = o),
      (this.options = s),
      (this.content = []),
      (this.activeMarks = c.none),
      (this.stashMarks = []),
      (this.match = i || (4 & s ? null : t.contentMatch));
  };
  (at.prototype.findWrapping = function (t) {
    if (!this.match) {
      if (!this.type) return [];
      const e = this.type.contentMatch.fillBefore(r.from(t));
      if (!e) {
        let n;
        const o = this.type.contentMatch;
        return (n = o.findWrapping(t.type)) ? ((this.match = o), n) : null;
      }
      this.match = this.type.contentMatch.matchFragment(e);
    }
    return this.match.findWrapping(t.type);
  }),
    (at.prototype.finish = function (t) {
      if (!(1 & this.options)) {
        let e;
        const n = this.content[this.content.length - 1];
        if (n && n.isText && (e = /[ \t\r\n\u000c]+$/.exec(n.text))) {
          const o = n;
          n.text.length == e[0].length
            ? this.content.pop()
            : (this.content[this.content.length - 1] = o.withText(
                o.text.slice(0, o.text.length - e[0].length),
              ));
        }
      }
      let i = r.from(this.content);
      return (
        !t && this.match && (i = i.append(this.match.fillBefore(r.empty, !0))),
        this.type ? this.type.create(this.attrs, i, this.marks) : i
      );
    }),
    (at.prototype.popFromStashMark = function (t) {
      for (let e = this.stashMarks.length - 1; e >= 0; e--)
        if (t.eq(this.stashMarks[e])) return this.stashMarks.splice(e, 1)[0];
    }),
    (at.prototype.applyPending = function (t) {
      for (let e = 0, n = this.pendingMarks; e < n.length; e++) {
        const r = n[e];
        (this.type ? this.type.allowsMarkType(r.type) : ut(r.type, t)) &&
          !r.isInSet(this.activeMarks) &&
          ((this.activeMarks = r.addToSet(this.activeMarks)),
          (this.pendingMarks = r.removeFromSet(this.pendingMarks)));
      }
    }),
    (at.prototype.inlineContext = function (t) {
      return this.type
        ? this.type.inlineContent
        : this.content.length
        ? this.content[0].isInline
        : t.parentNode &&
          !rt.hasOwnProperty(t.parentNode.nodeName.toLowerCase());
    });
  var ct = function (t, e, n) {
    (this.parser = t), (this.options = e), (this.isOpen = n), (this.open = 0);
    let r;
    const o = e.topNode;
    const i = st(null, e.preserveWhitespace, 0) | (n ? 4 : 0);
    (r = o
      ? new at(
          o.type,
          o.attrs,
          c.none,
          c.none,
          !0,
          e.topMatch || o.type.contentMatch,
          i,
        )
      : new at(
          n ? null : t.schema.topNodeType,
          null,
          c.none,
          c.none,
          !0,
          null,
          i,
        )),
      (this.nodes = [r]),
      (this.find = e.findPositions),
      (this.needsBlock = !1);
  };
  const lt = { top: { configurable: !0 }, currentPos: { configurable: !0 } };
  function pt(t, e) {
    return (
      t.matches ||
      t.msMatchesSelector ||
      t.webkitMatchesSelector ||
      t.mozMatchesSelector
    ).call(t, e);
  }
  function ht(t) {
    const e = {};
    for (const n in t) e[n] = t[n];
    return e;
  }
  function ut(t, e) {
    const n = e.schema.nodes;
    const r = function (r) {
      const o = n[r];
      if (o.allowsMarkType(t)) {
        const i = [];
        var s = function (t) {
          i.push(t);
          for (let n = 0; n < t.edgeCount; n++) {
            const r = t.edge(n);
            const o = r.type;
            const a = r.next;
            if (o == e) return !0;
            if (i.indexOf(a) < 0 && s(a)) return !0;
          }
        };
        return s(o.contentMatch) ? { v: !0 } : void 0;
      }
    };
    for (const o in n) {
      const i = r(o);
      if (i) return i.v;
    }
  }
  (lt.top.get = function () {
    return this.nodes[this.open];
  }),
    (ct.prototype.addDOM = function (t) {
      if (t.nodeType == 3) this.addTextNode(t);
      else if (t.nodeType == 1) {
        const e = t.getAttribute('style');
        const n = e
          ? this.readStyles(
              (function (t) {
                let e;
                const n = /\s*([\w-]+)\s*:\s*([^;]+)/g;
                const r = [];
                for (; (e = n.exec(t)); ) r.push(e[1], e[2].trim());
                return r;
              })(e),
            )
          : null;
        const r = this.top;
        if (null != n)
          for (let o = 0; o < n.length; o++) this.addPendingMark(n[o]);
        if ((this.addElement(t), null != n))
          for (let i = 0; i < n.length; i++) this.removePendingMark(n[i], r);
      }
    }),
    (ct.prototype.addTextNode = function (t) {
      let e = t.nodeValue;
      const n = this.top;
      if (2 & n.options || n.inlineContext(t) || /[^ \t\r\n\u000c]/.test(e)) {
        if (1 & n.options)
          e =
            2 & n.options
              ? e.replace(/\r\n?/g, '\n')
              : e.replace(/\r?\n|\r/g, ' ');
        else if (
          ((e = e.replace(/[ \t\r\n\u000c]+/g, ' ')),
          /^[ \t\r\n\u000c]/.test(e) && this.open == this.nodes.length - 1)
        ) {
          const r = n.content[n.content.length - 1];
          const o = t.previousSibling;
          (!r ||
            (o && o.nodeName == 'BR') ||
            (r.isText && /[ \t\r\n\u000c]$/.test(r.text))) &&
            (e = e.slice(1));
        }
        e && this.insertNode(this.parser.schema.text(e)), this.findInText(t);
      } else this.findInside(t);
    }),
    (ct.prototype.addElement = function (t, e) {
      let n;
      const r = t.nodeName.toLowerCase();
      it.hasOwnProperty(r) &&
        this.parser.normalizeLists &&
        (function (t) {
          for (let e = t.firstChild, n = null; e; e = e.nextSibling) {
            const r = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
            r && it.hasOwnProperty(r) && n
              ? (n.appendChild(e), (e = n))
              : r == 'li'
              ? (n = e)
              : r && (n = null);
          }
        })(t);
      const o =
        (this.options.ruleFromNode && this.options.ruleFromNode(t)) ||
        (n = this.parser.matchTag(t, this, e));
      if (o ? o.ignore : ot.hasOwnProperty(r))
        this.findInside(t), this.ignoreFallback(t);
      else if (!o || o.skip || o.closeParent) {
        o && o.closeParent
          ? (this.open = Math.max(0, this.open - 1))
          : o && o.skip.nodeType && (t = o.skip);
        let i;
        const s = this.top;
        const a = this.needsBlock;
        if (rt.hasOwnProperty(r)) (i = !0), s.type || (this.needsBlock = !0);
        else if (!t.firstChild) return void this.leafFallback(t);
        this.addAll(t), i && this.sync(s), (this.needsBlock = a);
      } else this.addElementByRule(t, o, !1 === o.consuming ? n : void 0);
    }),
    (ct.prototype.leafFallback = function (t) {
      t.nodeName == 'BR' &&
        this.top.type &&
        this.top.type.inlineContent &&
        this.addTextNode(t.ownerDocument.createTextNode('\n'));
    }),
    (ct.prototype.ignoreFallback = function (t) {
      'BR' != t.nodeName ||
        (this.top.type && this.top.type.inlineContent) ||
        this.findPlace(this.parser.schema.text('-'));
    }),
    (ct.prototype.readStyles = function (t) {
      let e = c.none;
      t: for (let n = 0; n < t.length; n += 2)
        for (let r = void 0; ; ) {
          const o = this.parser.matchStyle(t[n], t[n + 1], this, r);
          if (!o) continue t;
          if (o.ignore) return null;
          if (
            ((e = this.parser.schema.marks[o.mark].create(o.attrs).addToSet(e)),
            !1 !== o.consuming)
          )
            break;
          r = o;
        }
      return e;
    }),
    (ct.prototype.addElementByRule = function (t, e, n) {
      let r;
      let o;
      let i;
      const s = this;
      e.node
        ? (o = this.parser.schema.nodes[e.node]).isLeaf
          ? this.insertNode(o.create(e.attrs)) || this.leafFallback(t)
          : (r = this.enter(o, e.attrs || null, e.preserveWhitespace))
        : ((i = this.parser.schema.marks[e.mark].create(e.attrs)),
          this.addPendingMark(i));
      const a = this.top;
      if (o && o.isLeaf) this.findInside(t);
      else if (n) this.addElement(t, n);
      else if (e.getContent)
        this.findInside(t),
          e.getContent(t, this.parser.schema).forEach(function (t) {
            return s.insertNode(t);
          });
      else {
        let c = t;
        typeof e.contentElement === 'string'
          ? (c = t.querySelector(e.contentElement))
          : typeof e.contentElement === 'function'
          ? (c = e.contentElement(t))
          : e.contentElement && (c = e.contentElement),
          this.findAround(t, c, !0),
          this.addAll(c);
      }
      r && this.sync(a) && this.open--, i && this.removePendingMark(i, a);
    }),
    (ct.prototype.addAll = function (t, e, n) {
      for (
        var r = e || 0,
          o = e ? t.childNodes[e] : t.firstChild,
          i = n == null ? null : t.childNodes[n];
        o != i;
        o = o.nextSibling, ++r
      )
        this.findAtPoint(t, r), this.addDOM(o);
      this.findAtPoint(t, r);
    }),
    (ct.prototype.findPlace = function (t) {
      for (var e, n, r = this.open; r >= 0; r--) {
        const o = this.nodes[r];
        const i = o.findWrapping(t);
        if (i && (!e || e.length > i.length) && ((e = i), (n = o), !i.length))
          break;
        if (o.solid) break;
      }
      if (!e) return !1;
      this.sync(n);
      for (let s = 0; s < e.length; s++) this.enterInner(e[s], null, !1);
      return !0;
    }),
    (ct.prototype.insertNode = function (t) {
      if (t.isInline && this.needsBlock && !this.top.type) {
        const e = this.textblockFromContext();
        e && this.enterInner(e);
      }
      if (this.findPlace(t)) {
        this.closeExtra();
        const n = this.top;
        n.applyPending(t.type),
          n.match && (n.match = n.match.matchType(t.type));
        for (var r = n.activeMarks, o = 0; o < t.marks.length; o++)
          (n.type && !n.type.allowsMarkType(t.marks[o].type)) ||
            (r = t.marks[o].addToSet(r));
        return n.content.push(t.mark(r)), !0;
      }
      return !1;
    }),
    (ct.prototype.enter = function (t, e, n) {
      const r = this.findPlace(t.create(e));
      return r && this.enterInner(t, e, !0, n), r;
    }),
    (ct.prototype.enterInner = function (t, e, n, r) {
      void 0 === e && (e = null), void 0 === n && (n = !1), this.closeExtra();
      const o = this.top;
      o.applyPending(t), (o.match = o.match && o.match.matchType(t));
      let i = st(t, r, o.options);
      4 & o.options && o.content.length == 0 && (i |= 4),
        this.nodes.push(
          new at(t, e, o.activeMarks, o.pendingMarks, n, null, i),
        ),
        this.open++;
    }),
    (ct.prototype.closeExtra = function (t) {
      void 0 === t && (t = !1);
      let e = this.nodes.length - 1;
      if (e > this.open) {
        for (; e > this.open; e--)
          this.nodes[e - 1].content.push(this.nodes[e].finish(t));
        this.nodes.length = this.open + 1;
      }
    }),
    (ct.prototype.finish = function () {
      return (
        (this.open = 0),
        this.closeExtra(this.isOpen),
        this.nodes[0].finish(this.isOpen || this.options.topOpen)
      );
    }),
    (ct.prototype.sync = function (t) {
      for (let e = this.open; e >= 0; e--)
        if (this.nodes[e] == t) return (this.open = e), !0;
      return !1;
    }),
    (lt.currentPos.get = function () {
      this.closeExtra();
      for (var t = 0, e = this.open; e >= 0; e--) {
        for (let n = this.nodes[e].content, r = n.length - 1; r >= 0; r--)
          t += n[r].nodeSize;
        e && t++;
      }
      return t;
    }),
    (ct.prototype.findAtPoint = function (t, e) {
      if (this.find)
        for (let n = 0; n < this.find.length; n++)
          this.find[n].node == t &&
            this.find[n].offset == e &&
            (this.find[n].pos = this.currentPos);
    }),
    (ct.prototype.findInside = function (t) {
      if (this.find)
        for (let e = 0; e < this.find.length; e++)
          this.find[e].pos == null &&
            t.nodeType == 1 &&
            t.contains(this.find[e].node) &&
            (this.find[e].pos = this.currentPos);
    }),
    (ct.prototype.findAround = function (t, e, n) {
      if (t != e && this.find)
        for (let r = 0; r < this.find.length; r++) {
          if (
            this.find[r].pos == null &&
            t.nodeType == 1 &&
            t.contains(this.find[r].node)
          )
            e.compareDocumentPosition(this.find[r].node) & (n ? 2 : 4) &&
              (this.find[r].pos = this.currentPos);
        }
    }),
    (ct.prototype.findInText = function (t) {
      if (this.find)
        for (let e = 0; e < this.find.length; e++)
          this.find[e].node == t &&
            (this.find[e].pos =
              this.currentPos - (t.nodeValue.length - this.find[e].offset));
    }),
    (ct.prototype.matchesContext = function (t) {
      const e = this;
      if (t.indexOf('|') > -1)
        return t.split(/\s*\|\s*/).some(this.matchesContext, this);
      const n = t.split('/');
      const r = this.options.context;
      const o = !(this.isOpen || (r && r.parent.type != this.nodes[0].type));
      const i = -(r ? r.depth + 1 : 0) + (o ? 0 : 1);
      var s = function (t, a) {
        for (; t >= 0; t--) {
          const c = n[t];
          if (c == '') {
            if (t == n.length - 1 || t == 0) continue;
            for (; a >= i; a--) if (s(t - 1, a)) return !0;
            return !1;
          }
          const l =
            a > 0 || (a == 0 && o)
              ? e.nodes[a].type
              : r && a >= i
              ? r.node(a - i).type
              : null;
          if (!l || (l.name != c && l.groups.indexOf(c) == -1)) return !1;
          a--;
        }
        return !0;
      };
      return s(n.length - 1, this.open);
    }),
    (ct.prototype.textblockFromContext = function () {
      const t = this.options.context;
      if (t)
        for (let e = t.depth; e >= 0; e--) {
          const n = t.node(e).contentMatchAt(t.indexAfter(e)).defaultType;
          if (n && n.isTextblock && n.defaultAttrs) return n;
        }
      for (const r in this.parser.schema.nodes) {
        const o = this.parser.schema.nodes[r];
        if (o.isTextblock && o.defaultAttrs) return o;
      }
    }),
    (ct.prototype.addPendingMark = function (t) {
      const e = (function (t, e) {
        for (let n = 0; n < e.length; n++) if (t.eq(e[n])) return e[n];
      })(t, this.top.pendingMarks);
      e && this.top.stashMarks.push(e),
        (this.top.pendingMarks = t.addToSet(this.top.pendingMarks));
    }),
    (ct.prototype.removePendingMark = function (t, e) {
      for (let n = this.open; n >= 0; n--) {
        const r = this.nodes[n];
        if (r.pendingMarks.lastIndexOf(t) > -1)
          r.pendingMarks = t.removeFromSet(r.pendingMarks);
        else {
          r.activeMarks = t.removeFromSet(r.activeMarks);
          const o = r.popFromStashMark(t);
          o &&
            r.type &&
            r.type.allowsMarkType(o.type) &&
            (r.activeMarks = o.addToSet(r.activeMarks));
        }
        if (r == e) break;
      }
    }),
    Object.defineProperties(ct.prototype, lt);
  const ft = function (t, e) {
    (this.nodes = t), (this.marks = e);
  };
  function dt(t) {
    const e = {};
    for (const n in t) {
      const r = t[n].spec.toDOM;
      r && (e[n] = r);
    }
    return e;
  }
  function mt(t) {
    return t.document || window.document;
  }
  (ft.prototype.serializeFragment = function (t, e, n) {
    const r = this;
    void 0 === e && (e = {}), n || (n = mt(e).createDocumentFragment());
    let o = n;
    const i = [];
    return (
      t.forEach(function (t) {
        if (i.length || t.marks.length) {
          for (var n = 0, s = 0; n < i.length && s < t.marks.length; ) {
            const a = t.marks[s];
            if (r.marks[a.type.name]) {
              if (!a.eq(i[n][0]) || !1 === a.type.spec.spanning) break;
              n++, s++;
            } else s++;
          }
          for (; n < i.length; ) o = i.pop()[1];
          for (; s < t.marks.length; ) {
            const c = t.marks[s++];
            const l = r.serializeMark(c, t.isInline, e);
            l &&
              (i.push([c, o]),
              o.appendChild(l.dom),
              (o = l.contentDOM || l.dom));
          }
        }
        o.appendChild(r.serializeNodeInner(t, e));
      }),
      n
    );
  }),
    (ft.prototype.serializeNodeInner = function (t, e) {
      const n = ft.renderSpec(mt(e), this.nodes[t.type.name](t));
      const r = n.dom;
      const o = n.contentDOM;
      if (o) {
        if (t.isLeaf)
          throw new RangeError('Content hole not allowed in a leaf node spec');
        this.serializeFragment(t.content, e, o);
      }
      return r;
    }),
    (ft.prototype.serializeNode = function (t, e) {
      void 0 === e && (e = {});
      for (
        var n = this.serializeNodeInner(t, e), r = t.marks.length - 1;
        r >= 0;
        r--
      ) {
        const o = this.serializeMark(t.marks[r], t.isInline, e);
        o && ((o.contentDOM || o.dom).appendChild(n), (n = o.dom));
      }
      return n;
    }),
    (ft.prototype.serializeMark = function (t, e, n) {
      void 0 === n && (n = {});
      const r = this.marks[t.type.name];
      return r && ft.renderSpec(mt(n), r(t, e));
    }),
    (ft.renderSpec = function (t, e, n) {
      if ((void 0 === n && (n = null), typeof e === 'string'))
        return { dom: t.createTextNode(e) };
      if (null != e.nodeType) return { dom: e };
      if (e.dom && null != e.dom.nodeType) return e;
      let r;
      let o = e[0];
      const i = o.indexOf(' ');
      i > 0 && ((n = o.slice(0, i)), (o = o.slice(i + 1)));
      const s = n ? t.createElementNS(n, o) : t.createElement(o);
      const a = e[1];
      let c = 1;
      if (a && typeof a === 'object' && a.nodeType == null && !Array.isArray(a))
        for (const l in ((c = 2), a))
          if (null != a[l]) {
            const p = l.indexOf(' ');
            p > 0
              ? s.setAttributeNS(l.slice(0, p), l.slice(p + 1), a[l])
              : s.setAttribute(l, a[l]);
          }
      for (let h = c; h < e.length; h++) {
        const u = e[h];
        if (u === 0) {
          if (h < e.length - 1 || h > c)
            throw new RangeError(
              'Content hole must be the only child of its parent node',
            );
          return { dom: s, contentDOM: s };
        }
        const f = ft.renderSpec(t, u, n);
        const d = f.dom;
        const m = f.contentDOM;
        if ((s.appendChild(d), m)) {
          if (r) throw new RangeError('Multiple content holes');
          r = m;
        }
      }
      return { dom: s, contentDOM: r };
    }),
    (ft.fromSchema = function (t) {
      return (
        t.cached.domSerializer ||
        (t.cached.domSerializer = new ft(
          this.nodesFromSchema(t),
          this.marksFromSchema(t),
        ))
      );
    }),
    (ft.nodesFromSchema = function (t) {
      const e = dt(t.nodes);
      return (
        e.text ||
          (e.text = function (t) {
            return t.text;
          }),
        e
      );
    }),
    (ft.marksFromSchema = function (t) {
      return dt(t.marks);
    });
  const vt = Object.freeze({
    __proto__: null,
    ContentMatch: P,
    DOMParser: nt,
    DOMSerializer: ft,
    Fragment: r,
    Mark: c,
    MarkType: Z,
    Node: E,
    NodeRange: D,
    NodeType: G,
    ReplaceError: l,
    ResolvedPos: S,
    Schema: tt,
    Slice: p,
  });
  const gt = Math.pow(2, 16);
  function yt(t) {
    return 65535 & t;
  }
  const wt = function (t, e, n) {
    (this.pos = t), (this.delInfo = e), (this.recover = n);
  };
  const bt = {
    deleted: { configurable: !0 },
    deletedBefore: { configurable: !0 },
    deletedAfter: { configurable: !0 },
    deletedAcross: { configurable: !0 },
  };
  (bt.deleted.get = function () {
    return (8 & this.delInfo) > 0;
  }),
    (bt.deletedBefore.get = function () {
      return (5 & this.delInfo) > 0;
    }),
    (bt.deletedAfter.get = function () {
      return (6 & this.delInfo) > 0;
    }),
    (bt.deletedAcross.get = function () {
      return (4 & this.delInfo) > 0;
    }),
    Object.defineProperties(wt.prototype, bt);
  const kt = function t(e, n) {
    if (
      (void 0 === n && (n = !1),
      (this.ranges = e),
      (this.inverted = n),
      !e.length && t.empty)
    )
      return t.empty;
  };
  (kt.prototype.recover = function (t) {
    let e = 0;
    const n = yt(t);
    if (!this.inverted)
      for (let r = 0; r < n; r++)
        e += this.ranges[3 * r + 2] - this.ranges[3 * r + 1];
    return (
      this.ranges[3 * n] +
      e +
      (function (t) {
        return (t - (65535 & t)) / gt;
      })(t)
    );
  }),
    (kt.prototype.mapResult = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !1);
    }),
    (kt.prototype.map = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !0);
    }),
    (kt.prototype._map = function (t, e, n) {
      for (
        var r = 0, o = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2, s = 0;
        s < this.ranges.length;
        s += 3
      ) {
        const a = this.ranges[s] - (this.inverted ? r : 0);
        if (a > t) break;
        const c = this.ranges[s + o];
        const l = this.ranges[s + i];
        const p = a + c;
        if (t <= p) {
          const h =
            a + r + ((c ? (t == a ? -1 : t == p ? 1 : e) : e) < 0 ? 0 : l);
          if (n) return h;
          const u = t == (e < 0 ? a : p) ? null : s / 3 + (t - a) * gt;
          let f = t == a ? 2 : t == p ? 1 : 4;
          return (e < 0 ? t != a : t != p) && (f |= 8), new wt(h, f, u);
        }
        r += l - c;
      }
      return n ? t + r : new wt(t + r, 0, null);
    }),
    (kt.prototype.touches = function (t, e) {
      for (
        let n = 0,
          r = yt(e),
          o = this.inverted ? 2 : 1,
          i = this.inverted ? 1 : 2,
          s = 0;
        s < this.ranges.length;
        s += 3
      ) {
        const a = this.ranges[s] - (this.inverted ? n : 0);
        if (a > t) break;
        const c = this.ranges[s + o];
        if (t <= a + c && s == 3 * r) return !0;
        n += this.ranges[s + i] - c;
      }
      return !1;
    }),
    (kt.prototype.forEach = function (t) {
      for (
        let e = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2, r = 0, o = 0;
        r < this.ranges.length;
        r += 3
      ) {
        const i = this.ranges[r];
        const s = i - (this.inverted ? o : 0);
        const a = i + (this.inverted ? 0 : o);
        const c = this.ranges[r + e];
        const l = this.ranges[r + n];
        t(s, s + c, a, a + l), (o += l - c);
      }
    }),
    (kt.prototype.invert = function () {
      return new kt(this.ranges, !this.inverted);
    }),
    (kt.prototype.toString = function () {
      return (this.inverted ? '-' : '') + JSON.stringify(this.ranges);
    }),
    (kt.offset = function (t) {
      return t == 0 ? kt.empty : new kt(t < 0 ? [0, -t, 0] : [0, 0, t]);
    }),
    (kt.empty = new kt([]));
  const xt = function (t, e, n, r) {
    void 0 === t && (t = []),
      void 0 === n && (n = 0),
      void 0 === r && (r = t.length),
      (this.maps = t),
      (this.mirror = e),
      (this.from = n),
      (this.to = r);
  };
  (xt.prototype.slice = function (t, e) {
    return (
      void 0 === t && (t = 0),
      void 0 === e && (e = this.maps.length),
      new xt(this.maps, this.mirror, t, e)
    );
  }),
    (xt.prototype.copy = function () {
      return new xt(
        this.maps.slice(),
        this.mirror && this.mirror.slice(),
        this.from,
        this.to,
      );
    }),
    (xt.prototype.appendMap = function (t, e) {
      (this.to = this.maps.push(t)),
        null != e && this.setMirror(this.maps.length - 1, e);
    }),
    (xt.prototype.appendMapping = function (t) {
      for (let e = 0, n = this.maps.length; e < t.maps.length; e++) {
        const r = t.getMirror(e);
        this.appendMap(t.maps[e], null != r && r < e ? n + r : void 0);
      }
    }),
    (xt.prototype.getMirror = function (t) {
      if (this.mirror)
        for (let e = 0; e < this.mirror.length; e++)
          if (this.mirror[e] == t) return this.mirror[e + (e % 2 ? -1 : 1)];
    }),
    (xt.prototype.setMirror = function (t, e) {
      this.mirror || (this.mirror = []), this.mirror.push(t, e);
    }),
    (xt.prototype.appendMappingInverted = function (t) {
      for (
        let e = t.maps.length - 1, n = this.maps.length + t.maps.length;
        e >= 0;
        e--
      ) {
        const r = t.getMirror(e);
        this.appendMap(
          t.maps[e].invert(),
          null != r && r > e ? n - r - 1 : void 0,
        );
      }
    }),
    (xt.prototype.invert = function () {
      const t = new xt();
      return t.appendMappingInverted(this), t;
    }),
    (xt.prototype.map = function (t, e) {
      if ((void 0 === e && (e = 1), this.mirror)) return this._map(t, e, !0);
      for (let n = this.from; n < this.to; n++) t = this.maps[n].map(t, e);
      return t;
    }),
    (xt.prototype.mapResult = function (t, e) {
      return void 0 === e && (e = 1), this._map(t, e, !1);
    }),
    (xt.prototype._map = function (t, e, n) {
      for (var r = 0, o = this.from; o < this.to; o++) {
        const i = this.maps[o].mapResult(t, e);
        if (null != i.recover) {
          const s = this.getMirror(o);
          if (null != s && s > o && s < this.to) {
            (o = s), (t = this.maps[s].recover(i.recover));
            continue;
          }
        }
        (r |= i.delInfo), (t = i.pos);
      }
      return n ? t : new wt(t, r, null);
    });
  const St = Object.create(null);
  const Mt = function () {};
  (Mt.prototype.getMap = function () {
    return kt.empty;
  }),
    (Mt.prototype.merge = function (t) {
      return null;
    }),
    (Mt.fromJSON = function (t, e) {
      if (!e || !e.stepType)
        throw new RangeError('Invalid input for Step.fromJSON');
      const n = St[e.stepType];
      if (!n) throw new RangeError('No step type ' + e.stepType + ' defined');
      return n.fromJSON(t, e);
    }),
    (Mt.jsonID = function (t, e) {
      if (t in St) throw new RangeError('Duplicate use of step JSON ID ' + t);
      return (St[t] = e), (e.prototype.jsonID = t), e;
    });
  const Ct = function (t, e) {
    (this.doc = t), (this.failed = e);
  };
  function Ot(t, e, n) {
    for (var o = [], i = 0; i < t.childCount; i++) {
      let s = t.child(i);
      s.content.size && (s = s.copy(Ot(s.content, e, s))),
        s.isInline && (s = e(s, n, i)),
        o.push(s);
    }
    return r.fromArray(o);
  }
  (Ct.ok = function (t) {
    return new Ct(t, null);
  }),
    (Ct.fail = function (t) {
      return new Ct(null, t);
    }),
    (Ct.fromReplace = function (t, e, n, r) {
      try {
        return Ct.ok(t.replace(e, n, r));
      } catch (t) {
        if (t instanceof l) return Ct.fail(t.message);
        throw t;
      }
    });
  const Nt = (function (t) {
    function e(e, n, r) {
      t.call(this), (this.from = e), (this.to = n), (this.mark = r);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        const e = this;
        const n = t.slice(this.from, this.to);
        const r = t.resolve(this.from);
        const o = r.node(r.sharedDepth(this.to));
        const i = new p(
          Ot(
            n.content,
            function (t, n) {
              return t.isAtom && n.type.allowsMarkType(e.mark.type)
                ? t.mark(e.mark.addToSet(t.marks))
                : t;
            },
            o,
          ),
          n.openStart,
          n.openEnd,
        );
        return Ct.fromReplace(t, this.from, this.to, i);
      }),
      (e.prototype.invert = function () {
        return new Dt(this.from, this.to, this.mark);
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.from, 1);
        const r = t.mapResult(this.to, -1);
        return (n.deleted && r.deleted) || n.pos >= r.pos
          ? null
          : new e(n.pos, r.pos, this.mark);
      }),
      (e.prototype.merge = function (t) {
        return t instanceof e &&
          t.mark.eq(this.mark) &&
          this.from <= t.to &&
          this.to >= t.from
          ? new e(
              Math.min(this.from, t.from),
              Math.max(this.to, t.to),
              this.mark,
            )
          : null;
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'addMark',
          mark: this.mark.toJSON(),
          from: this.from,
          to: this.to,
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.from || 'number' !== typeof n.to)
          throw new RangeError('Invalid input for AddMarkStep.fromJSON');
        return new e(n.from, n.to, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Mt);
  Mt.jsonID('addMark', Nt);
  var Dt = (function (t) {
    function e(e, n, r) {
      t.call(this), (this.from = e), (this.to = n), (this.mark = r);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        const e = this;
        const n = t.slice(this.from, this.to);
        const r = new p(
          Ot(
            n.content,
            function (t) {
              return t.mark(e.mark.removeFromSet(t.marks));
            },
            t,
          ),
          n.openStart,
          n.openEnd,
        );
        return Ct.fromReplace(t, this.from, this.to, r);
      }),
      (e.prototype.invert = function () {
        return new Nt(this.from, this.to, this.mark);
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.from, 1);
        const r = t.mapResult(this.to, -1);
        return (n.deleted && r.deleted) || n.pos >= r.pos
          ? null
          : new e(n.pos, r.pos, this.mark);
      }),
      (e.prototype.merge = function (t) {
        return t instanceof e &&
          t.mark.eq(this.mark) &&
          this.from <= t.to &&
          this.to >= t.from
          ? new e(
              Math.min(this.from, t.from),
              Math.max(this.to, t.to),
              this.mark,
            )
          : null;
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'removeMark',
          mark: this.mark.toJSON(),
          from: this.from,
          to: this.to,
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.from || 'number' !== typeof n.to)
          throw new RangeError('Invalid input for RemoveMarkStep.fromJSON');
        return new e(n.from, n.to, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Mt);
  Mt.jsonID('removeMark', Dt);
  const Tt = (function (t) {
    function e(e, n) {
      t.call(this), (this.pos = e), (this.mark = n);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        const e = t.nodeAt(this.pos);
        if (!e) return Ct.fail("No node at mark step's position");
        const n = e.type.create(e.attrs, null, this.mark.addToSet(e.marks));
        return Ct.fromReplace(
          t,
          this.pos,
          this.pos + 1,
          new p(r.from(n), 0, e.isLeaf ? 0 : 1),
        );
      }),
      (e.prototype.invert = function (t) {
        const n = t.nodeAt(this.pos);
        if (n) {
          const r = this.mark.addToSet(n.marks);
          if (r.length == n.marks.length) {
            for (let o = 0; o < n.marks.length; o++)
              if (!n.marks[o].isInSet(r)) return new e(this.pos, n.marks[o]);
            return new e(this.pos, this.mark);
          }
        }
        return new At(this.pos, this.mark);
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.pos, 1);
        return n.deletedAfter ? null : new e(n.pos, this.mark);
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'addNodeMark',
          pos: this.pos,
          mark: this.mark.toJSON(),
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.pos)
          throw new RangeError('Invalid input for AddNodeMarkStep.fromJSON');
        return new e(n.pos, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Mt);
  Mt.jsonID('addNodeMark', Tt);
  var At = (function (t) {
    function e(e, n) {
      t.call(this), (this.pos = e), (this.mark = n);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        const e = t.nodeAt(this.pos);
        if (!e) return Ct.fail("No node at mark step's position");
        const n = e.type.create(
          e.attrs,
          null,
          this.mark.removeFromSet(e.marks),
        );
        return Ct.fromReplace(
          t,
          this.pos,
          this.pos + 1,
          new p(r.from(n), 0, e.isLeaf ? 0 : 1),
        );
      }),
      (e.prototype.invert = function (t) {
        const e = t.nodeAt(this.pos);
        return e && this.mark.isInSet(e.marks)
          ? new Tt(this.pos, this.mark)
          : this;
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.pos, 1);
        return n.deletedAfter ? null : new e(n.pos, this.mark);
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'removeNodeMark',
          pos: this.pos,
          mark: this.mark.toJSON(),
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.pos)
          throw new RangeError('Invalid input for RemoveNodeMarkStep.fromJSON');
        return new e(n.pos, t.markFromJSON(n.mark));
      }),
      e
    );
  })(Mt);
  Mt.jsonID('removeNodeMark', At);
  const Et = (function (t) {
    function e(e, n, r, o) {
      void 0 === o && (o = !1),
        t.call(this),
        (this.from = e),
        (this.to = n),
        (this.slice = r),
        (this.structure = o);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        return this.structure && Rt(t, this.from, this.to)
          ? Ct.fail('Structure replace would overwrite content')
          : Ct.fromReplace(t, this.from, this.to, this.slice);
      }),
      (e.prototype.getMap = function () {
        return new kt([this.from, this.to - this.from, this.slice.size]);
      }),
      (e.prototype.invert = function (t) {
        return new e(
          this.from,
          this.from + this.slice.size,
          t.slice(this.from, this.to),
        );
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.from, 1);
        const r = t.mapResult(this.to, -1);
        return n.deletedAcross && r.deletedAcross
          ? null
          : new e(n.pos, Math.max(n.pos, r.pos), this.slice);
      }),
      (e.prototype.merge = function (t) {
        if (!(t instanceof e) || t.structure || this.structure) return null;
        if (
          this.from + this.slice.size != t.from ||
          this.slice.openEnd ||
          t.slice.openStart
        ) {
          if (t.to != this.from || this.slice.openStart || t.slice.openEnd)
            return null;
          const n =
            this.slice.size + t.slice.size == 0
              ? p.empty
              : new p(
                  t.slice.content.append(this.slice.content),
                  t.slice.openStart,
                  this.slice.openEnd,
                );
          return new e(t.from, this.to, n, this.structure);
        }
        const r =
          this.slice.size + t.slice.size == 0
            ? p.empty
            : new p(
                this.slice.content.append(t.slice.content),
                this.slice.openStart,
                t.slice.openEnd,
              );
        return new e(this.from, this.to + (t.to - t.from), r, this.structure);
      }),
      (e.prototype.toJSON = function () {
        const t = { stepType: 'replace', from: this.from, to: this.to };
        return (
          this.slice.size && (t.slice = this.slice.toJSON()),
          this.structure && (t.structure = !0),
          t
        );
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.from || 'number' !== typeof n.to)
          throw new RangeError('Invalid input for ReplaceStep.fromJSON');
        return new e(n.from, n.to, p.fromJSON(t, n.slice), !!n.structure);
      }),
      e
    );
  })(Mt);
  Mt.jsonID('replace', Et);
  const It = (function (t) {
    function e(e, n, r, o, i, s, a) {
      void 0 === a && (a = !1),
        t.call(this),
        (this.from = e),
        (this.to = n),
        (this.gapFrom = r),
        (this.gapTo = o),
        (this.slice = i),
        (this.insert = s),
        (this.structure = a);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        if (
          this.structure &&
          (Rt(t, this.from, this.gapFrom) || Rt(t, this.gapTo, this.to))
        )
          return Ct.fail('Structure gap-replace would overwrite content');
        const e = t.slice(this.gapFrom, this.gapTo);
        if (e.openStart || e.openEnd) return Ct.fail('Gap is not a flat range');
        const n = this.slice.insertAt(this.insert, e.content);
        return n
          ? Ct.fromReplace(t, this.from, this.to, n)
          : Ct.fail('Content does not fit in gap');
      }),
      (e.prototype.getMap = function () {
        return new kt([
          this.from,
          this.gapFrom - this.from,
          this.insert,
          this.gapTo,
          this.to - this.gapTo,
          this.slice.size - this.insert,
        ]);
      }),
      (e.prototype.invert = function (t) {
        const n = this.gapTo - this.gapFrom;
        return new e(
          this.from,
          this.from + this.slice.size + n,
          this.from + this.insert,
          this.from + this.insert + n,
          t
            .slice(this.from, this.to)
            .removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
          this.gapFrom - this.from,
          this.structure,
        );
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.from, 1);
        const r = t.mapResult(this.to, -1);
        const o = t.map(this.gapFrom, -1);
        const i = t.map(this.gapTo, 1);
        return (n.deletedAcross && r.deletedAcross) || o < n.pos || i > r.pos
          ? null
          : new e(n.pos, r.pos, o, i, this.slice, this.insert, this.structure);
      }),
      (e.prototype.toJSON = function () {
        const t = {
          stepType: 'replaceAround',
          from: this.from,
          to: this.to,
          gapFrom: this.gapFrom,
          gapTo: this.gapTo,
          insert: this.insert,
        };
        return (
          this.slice.size && (t.slice = this.slice.toJSON()),
          this.structure && (t.structure = !0),
          t
        );
      }),
      (e.fromJSON = function (t, n) {
        if (
          'number' !== typeof n.from ||
          'number' !== typeof n.to ||
          'number' !== typeof n.gapFrom ||
          'number' !== typeof n.gapTo ||
          'number' !== typeof n.insert
        )
          throw new RangeError('Invalid input for ReplaceAroundStep.fromJSON');
        return new e(
          n.from,
          n.to,
          n.gapFrom,
          n.gapTo,
          p.fromJSON(t, n.slice),
          n.insert,
          !!n.structure,
        );
      }),
      e
    );
  })(Mt);
  function Rt(t, e, n) {
    for (
      var r = t.resolve(e), o = n - e, i = r.depth;
      o > 0 && i > 0 && r.indexAfter(i) == r.node(i).childCount;

    )
      i--, o--;
    if (o > 0)
      for (let s = r.node(i).maybeChild(r.indexAfter(i)); o > 0; ) {
        if (!s || s.isLeaf) return !0;
        (s = s.firstChild), o--;
      }
    return !1;
  }
  function zt(t, e, n) {
    return (
      (e == 0 || t.canReplace(e, t.childCount)) &&
      (n == t.childCount || t.canReplace(0, n))
    );
  }
  function Pt(t) {
    for (
      let e = t.parent.content.cutByIndex(t.startIndex, t.endIndex),
        n = t.depth;
      ;
      --n
    ) {
      const r = t.$from.node(n);
      const o = t.$from.index(n);
      const i = t.$to.indexAfter(n);
      if (n < t.depth && r.canReplace(o, i, e)) return n;
      if (n == 0 || r.type.spec.isolating || !zt(r, o, i)) break;
    }
    return null;
  }
  function Bt(t, e, n, r) {
    void 0 === n && (n = null), void 0 === r && (r = t);
    const o = (function (t, e) {
      const n = t.parent;
      const r = t.startIndex;
      const o = t.endIndex;
      const i = n.contentMatchAt(r).findWrapping(e);
      if (!i) return null;
      const s = i.length ? i[0] : e;
      return n.canReplaceWith(r, o, s) ? i : null;
    })(t, e);
    const i =
      o &&
      (function (t, e) {
        const n = t.parent;
        const r = t.startIndex;
        const o = t.endIndex;
        const i = n.child(r);
        const s = e.contentMatch.findWrapping(i.type);
        if (!s) return null;
        for (
          var a = (s.length ? s[s.length - 1] : e).contentMatch, c = r;
          a && c < o;
          c++
        )
          a = a.matchType(n.child(c).type);
        if (!a || !a.validEnd) return null;
        return s;
      })(r, e);
    return i ? o.map(_t).concat({ type: e, attrs: n }).concat(i.map(_t)) : null;
  }
  function _t(t) {
    return { type: t, attrs: null };
  }
  function Vt(t, e, n, r) {
    void 0 === n && (n = 1);
    const o = t.resolve(e);
    const i = o.depth - n;
    const s = (r && r[r.length - 1]) || o.parent;
    if (
      i < 0 ||
      o.parent.type.spec.isolating ||
      !o.parent.canReplace(o.index(), o.parent.childCount) ||
      !s.type.validContent(
        o.parent.content.cutByIndex(o.index(), o.parent.childCount),
      )
    )
      return !1;
    for (let a = o.depth - 1, c = n - 2; a > i; a--, c--) {
      const l = o.node(a);
      const p = o.index(a);
      if (l.type.spec.isolating) return !1;
      let h = l.content.cutByIndex(p, l.childCount);
      const u = (r && r[c]) || l;
      if (
        (u != l && (h = h.replaceChild(0, u.type.create(u.attrs))),
        !l.canReplace(p + 1, l.childCount) || !u.type.validContent(h))
      )
        return !1;
    }
    const f = o.indexAfter(i);
    const d = r && r[0];
    return o.node(i).canReplaceWith(f, f, d ? d.type : o.node(i + 1).type);
  }
  function Ft(t, e) {
    const n = t.resolve(e);
    const r = n.index();
    return $t(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
  }
  function $t(t, e) {
    return !(!t || !e || t.isLeaf || !t.canAppend(e));
  }
  function qt(t, e, n) {
    void 0 === n && (n = -1);
    for (let r = t.resolve(e), o = r.depth; ; o--) {
      let i = void 0;
      let s = void 0;
      let a = r.index(o);
      if (
        (o == r.depth
          ? ((i = r.nodeBefore), (s = r.nodeAfter))
          : n > 0
          ? ((i = r.node(o + 1)), a++, (s = r.node(o).maybeChild(a)))
          : ((i = r.node(o).maybeChild(a - 1)), (s = r.node(o + 1))),
        i && !i.isTextblock && $t(i, s) && r.node(o).canReplace(a, a + 1))
      )
        return e;
      if (o == 0) break;
      e = n < 0 ? r.before(o) : r.after(o);
    }
  }
  function Lt(t, e, n) {
    const r = t.resolve(e);
    if (r.parent.canReplaceWith(r.index(), r.index(), n)) return e;
    if (r.parentOffset == 0)
      for (let o = r.depth - 1; o >= 0; o--) {
        const i = r.index(o);
        if (r.node(o).canReplaceWith(i, i, n)) return r.before(o + 1);
        if (i > 0) return null;
      }
    if (r.parentOffset == r.parent.content.size)
      for (let s = r.depth - 1; s >= 0; s--) {
        const a = r.indexAfter(s);
        if (r.node(s).canReplaceWith(a, a, n)) return r.after(s + 1);
        if (a < r.node(s).childCount) return null;
      }
    return null;
  }
  function jt(t, e, n) {
    const r = t.resolve(e);
    if (!n.content.size) return e;
    for (var o = n.content, i = 0; i < n.openStart; i++)
      o = o.firstChild.content;
    for (let s = 1; s <= (n.openStart == 0 && n.size ? 2 : 1); s++)
      for (let a = r.depth; a >= 0; a--) {
        const c =
          a == r.depth
            ? 0
            : r.pos <= (r.start(a + 1) + r.end(a + 1)) / 2
            ? -1
            : 1;
        const l = r.index(a) + (c > 0 ? 1 : 0);
        const p = r.node(a);
        let h = !1;
        if (s == 1) h = p.canReplace(l, l, o);
        else {
          const u = p.contentMatchAt(l).findWrapping(o.firstChild.type);
          h = u && p.canReplaceWith(l, l, u[0]);
        }
        if (h) return c == 0 ? r.pos : c < 0 ? r.before(a + 1) : r.after(a + 1);
      }
    return null;
  }
  function Jt(t, e, n, r) {
    if (
      (void 0 === n && (n = e),
      void 0 === r && (r = p.empty),
      e == n && !r.size)
    )
      return null;
    const o = t.resolve(e);
    const i = t.resolve(n);
    return Wt(o, i, r) ? new Et(e, n, r) : new Kt(o, i, r).fit();
  }
  function Wt(t, e, n) {
    return (
      !n.openStart &&
      !n.openEnd &&
      t.start() == e.start() &&
      t.parent.canReplace(t.index(), e.index(), n.content)
    );
  }
  Mt.jsonID('replaceAround', It);
  var Kt = function (t, e, n) {
    (this.$from = t),
      (this.$to = e),
      (this.unplaced = n),
      (this.frontier = []),
      (this.placed = r.empty);
    for (let o = 0; o <= t.depth; o++) {
      const i = t.node(o);
      this.frontier.push({
        type: i.type,
        match: i.contentMatchAt(t.indexAfter(o)),
      });
    }
    for (let s = t.depth; s > 0; s--)
      this.placed = r.from(t.node(s).copy(this.placed));
  };
  const Ht = { depth: { configurable: !0 } };
  function Ut(t, e, n) {
    return e == 0
      ? t.cutByIndex(n, t.childCount)
      : t.replaceChild(
          0,
          t.firstChild.copy(Ut(t.firstChild.content, e - 1, n)),
        );
  }
  function Gt(t, e, n) {
    return e == 0
      ? t.append(n)
      : t.replaceChild(
          t.childCount - 1,
          t.lastChild.copy(Gt(t.lastChild.content, e - 1, n)),
        );
  }
  function Qt(t, e) {
    for (let n = 0; n < e; n++) t = t.firstChild.content;
    return t;
  }
  function Xt(t, e, n) {
    if (e <= 0) return t;
    let o = t.content;
    return (
      e > 1 &&
        (o = o.replaceChild(
          0,
          Xt(o.firstChild, e - 1, o.childCount == 1 ? n - 1 : 0),
        )),
      e > 0 &&
        ((o = t.type.contentMatch.fillBefore(o).append(o)),
        n <= 0 &&
          (o = o.append(
            t.type.contentMatch.matchFragment(o).fillBefore(r.empty, !0),
          ))),
      t.copy(o)
    );
  }
  function Yt(t, e, n, r, o) {
    const i = t.node(e);
    const s = o ? t.indexAfter(e) : t.index(e);
    if (s == i.childCount && !n.compatibleContent(i.type)) return null;
    const a = r.fillBefore(i.content, !0, s);
    return a &&
      !(function (t, e, n) {
        for (let r = n; r < e.childCount; r++)
          if (!t.allowsMarks(e.child(r).marks)) return !0;
        return !1;
      })(n, i.content, s)
      ? a
      : null;
  }
  function Zt(t) {
    return t.spec.defining || t.spec.definingForContent;
  }
  function te(t, e, n, o, i) {
    if (e < n) {
      const s = t.firstChild;
      t = t.replaceChild(0, s.copy(te(s.content, e + 1, n, o, s)));
    }
    if (e > o) {
      const a = i.contentMatchAt(0);
      const c = a.fillBefore(t).append(t);
      t = c.append(a.matchFragment(c).fillBefore(r.empty, !0));
    }
    return t;
  }
  function ee(t, e) {
    for (var n = [], r = Math.min(t.depth, e.depth); r >= 0; r--) {
      const o = t.start(r);
      if (
        o < t.pos - (t.depth - r) ||
        e.end(r) > e.pos + (e.depth - r) ||
        t.node(r).type.spec.isolating ||
        e.node(r).type.spec.isolating
      )
        break;
      (o == e.start(r) ||
        (r == t.depth &&
          r == e.depth &&
          t.parent.inlineContent &&
          e.parent.inlineContent &&
          r &&
          e.start(r - 1) == o - 1)) &&
        n.push(r);
    }
    return n;
  }
  (Ht.depth.get = function () {
    return this.frontier.length - 1;
  }),
    (Kt.prototype.fit = function () {
      for (; this.unplaced.size; ) {
        const t = this.findFittable();
        t ? this.placeNodes(t) : this.openMore() || this.dropNode();
      }
      const e = this.mustMoveInline();
      const n = this.placed.size - this.depth - this.$from.depth;
      const r = this.$from;
      const o = this.close(e < 0 ? this.$to : r.doc.resolve(e));
      if (!o) return null;
      for (
        var i = this.placed, s = r.depth, a = o.depth;
        s && a && i.childCount == 1;

      )
        (i = i.firstChild.content), s--, a--;
      const c = new p(i, s, a);
      return e > -1
        ? new It(r.pos, e, this.$to.pos, this.$to.end(), c, n)
        : c.size || r.pos != this.$to.pos
        ? new Et(r.pos, o.pos, c)
        : null;
    }),
    (Kt.prototype.findFittable = function () {
      for (let t = 1; t <= 2; t++)
        for (let e = this.unplaced.openStart; e >= 0; e--)
          for (
            let n = null,
              o = (
                e
                  ? (n = Qt(this.unplaced.content, e - 1).firstChild).content
                  : this.unplaced.content
              ).firstChild,
              i = this.depth;
            i >= 0;
            i--
          ) {
            const s = this.frontier[i];
            const a = s.type;
            const c = s.match;
            let l = void 0;
            let p = null;
            if (
              t == 1 &&
              (o
                ? c.matchType(o.type) || (p = c.fillBefore(r.from(o), !1))
                : n && a.compatibleContent(n.type))
            )
              return { sliceDepth: e, frontierDepth: i, parent: n, inject: p };
            if (t == 2 && o && (l = c.findWrapping(o.type)))
              return { sliceDepth: e, frontierDepth: i, parent: n, wrap: l };
            if (n && c.matchType(n.type)) break;
          }
    }),
    (Kt.prototype.openMore = function () {
      const t = this.unplaced;
      const e = t.content;
      const n = t.openStart;
      const r = t.openEnd;
      const o = Qt(e, n);
      return (
        !(!o.childCount || o.firstChild.isLeaf) &&
        ((this.unplaced = new p(
          e,
          n + 1,
          Math.max(r, o.size + n >= e.size - r ? n + 1 : 0),
        )),
        !0)
      );
    }),
    (Kt.prototype.dropNode = function () {
      const t = this.unplaced;
      const e = t.content;
      const n = t.openStart;
      const r = t.openEnd;
      const o = Qt(e, n);
      if (o.childCount <= 1 && n > 0) {
        const i = e.size - n <= n + o.size;
        this.unplaced = new p(Ut(e, n - 1, 1), n - 1, i ? n - 1 : r);
      } else this.unplaced = new p(Ut(e, n, 1), n, r);
    }),
    (Kt.prototype.placeNodes = function (t) {
      for (
        var e = t.sliceDepth,
          n = t.frontierDepth,
          o = t.parent,
          i = t.inject,
          s = t.wrap;
        this.depth > n;

      )
        this.closeFrontierNode();
      if (s) for (let a = 0; a < s.length; a++) this.openFrontierNode(s[a]);
      const c = this.unplaced;
      const l = o ? o.content : c.content;
      const h = c.openStart - e;
      let u = 0;
      const f = [];
      const d = this.frontier[n];
      let m = d.match;
      const v = d.type;
      if (i) {
        for (let g = 0; g < i.childCount; g++) f.push(i.child(g));
        m = m.matchFragment(i);
      }
      for (
        var y = l.size + e - (c.content.size - c.openEnd);
        u < l.childCount;

      ) {
        const w = l.child(u);
        const b = m.matchType(w.type);
        if (!b) break;
        (++u > 1 || h == 0 || w.content.size) &&
          ((m = b),
          f.push(
            Xt(
              w.mark(v.allowedMarks(w.marks)),
              u == 1 ? h : 0,
              u == l.childCount ? y : -1,
            ),
          ));
      }
      const k = u == l.childCount;
      k || (y = -1),
        (this.placed = Gt(this.placed, n, r.from(f))),
        (this.frontier[n].match = m),
        k &&
          y < 0 &&
          o &&
          o.type == this.frontier[this.depth].type &&
          this.frontier.length > 1 &&
          this.closeFrontierNode();
      for (let x = 0, S = l; x < y; x++) {
        const M = S.lastChild;
        this.frontier.push({
          type: M.type,
          match: M.contentMatchAt(M.childCount),
        }),
          (S = M.content);
      }
      this.unplaced = k
        ? e == 0
          ? p.empty
          : new p(Ut(c.content, e - 1, 1), e - 1, y < 0 ? c.openEnd : e - 1)
        : new p(Ut(c.content, e, u), c.openStart, c.openEnd);
    }),
    (Kt.prototype.mustMoveInline = function () {
      if (!this.$to.parent.isTextblock) return -1;
      let t;
      const e = this.frontier[this.depth];
      if (
        !e.type.isTextblock ||
        !Yt(this.$to, this.$to.depth, e.type, e.match, !1) ||
        (this.$to.depth == this.depth &&
          (t = this.findCloseLevel(this.$to)) &&
          t.depth == this.depth)
      )
        return -1;
      for (
        var n = this.$to.depth, r = this.$to.after(n);
        n > 1 && r == this.$to.end(--n);

      )
        ++r;
      return r;
    }),
    (Kt.prototype.findCloseLevel = function (t) {
      t: for (let e = Math.min(this.depth, t.depth); e >= 0; e--) {
        const n = this.frontier[e];
        const r = n.match;
        const o = n.type;
        const i = e < t.depth && t.end(e + 1) == t.pos + (t.depth - (e + 1));
        const s = Yt(t, e, o, r, i);
        if (s) {
          for (let a = e - 1; a >= 0; a--) {
            const c = this.frontier[a];
            const l = c.match;
            const p = Yt(t, a, c.type, l, !0);
            if (!p || p.childCount) continue t;
          }
          return {
            depth: e,
            fit: s,
            move: i ? t.doc.resolve(t.after(e + 1)) : t,
          };
        }
      }
    }),
    (Kt.prototype.close = function (t) {
      const e = this.findCloseLevel(t);
      if (!e) return null;
      for (; this.depth > e.depth; ) this.closeFrontierNode();
      e.fit.childCount && (this.placed = Gt(this.placed, e.depth, e.fit)),
        (t = e.move);
      for (let n = e.depth + 1; n <= t.depth; n++) {
        const r = t.node(n);
        const o = r.type.contentMatch.fillBefore(r.content, !0, t.index(n));
        this.openFrontierNode(r.type, r.attrs, o);
      }
      return t;
    }),
    (Kt.prototype.openFrontierNode = function (t, e, n) {
      void 0 === e && (e = null);
      const o = this.frontier[this.depth];
      (o.match = o.match.matchType(t)),
        (this.placed = Gt(this.placed, this.depth, r.from(t.create(e, n)))),
        this.frontier.push({ type: t, match: t.contentMatch });
    }),
    (Kt.prototype.closeFrontierNode = function () {
      const t = this.frontier.pop().match.fillBefore(r.empty, !0);
      t.childCount && (this.placed = Gt(this.placed, this.frontier.length, t));
    }),
    Object.defineProperties(Kt.prototype, Ht);
  const ne = (function (t) {
    function e(e, n, r) {
      t.call(this), (this.pos = e), (this.attr = n), (this.value = r);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.apply = function (t) {
        const e = t.nodeAt(this.pos);
        if (!e) return Ct.fail("No node at attribute step's position");
        const n = Object.create(null);
        for (const o in e.attrs) n[o] = e.attrs[o];
        n[this.attr] = this.value;
        const i = e.type.create(n, null, e.marks);
        return Ct.fromReplace(
          t,
          this.pos,
          this.pos + 1,
          new p(r.from(i), 0, e.isLeaf ? 0 : 1),
        );
      }),
      (e.prototype.getMap = function () {
        return kt.empty;
      }),
      (e.prototype.invert = function (t) {
        return new e(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
      }),
      (e.prototype.map = function (t) {
        const n = t.mapResult(this.pos, 1);
        return n.deletedAfter ? null : new e(n.pos, this.attr, this.value);
      }),
      (e.prototype.toJSON = function () {
        return {
          stepType: 'attr',
          pos: this.pos,
          attr: this.attr,
          value: this.value,
        };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.pos || 'string' !== typeof n.attr)
          throw new RangeError('Invalid input for AttrStep.fromJSON');
        return new e(n.pos, n.attr, n.value);
      }),
      e
    );
  })(Mt);
  Mt.jsonID('attr', ne);
  let re = Error;
  (((re = function t(e) {
    const n = Error.call(this, e);
    return (n.__proto__ = t.prototype), n;
  }).prototype = Object.create(Error.prototype)).constructor = re),
    (re.prototype.name = 'TransformError');
  const oe = function (t) {
    (this.doc = t),
      (this.steps = []),
      (this.docs = []),
      (this.mapping = new xt());
  };
  const ie = { before: { configurable: !0 }, docChanged: { configurable: !0 } };
  (ie.before.get = function () {
    return this.docs.length ? this.docs[0] : this.doc;
  }),
    (oe.prototype.step = function (t) {
      const e = this.maybeStep(t);
      if (e.failed) throw new re(e.failed);
      return this;
    }),
    (oe.prototype.maybeStep = function (t) {
      const e = t.apply(this.doc);
      return e.failed || this.addStep(t, e.doc), e;
    }),
    (ie.docChanged.get = function () {
      return this.steps.length > 0;
    }),
    (oe.prototype.addStep = function (t, e) {
      this.docs.push(this.doc),
        this.steps.push(t),
        this.mapping.appendMap(t.getMap()),
        (this.doc = e);
    }),
    (oe.prototype.replace = function (t, e, n) {
      void 0 === e && (e = t), void 0 === n && (n = p.empty);
      const r = Jt(this.doc, t, e, n);
      return r && this.step(r), this;
    }),
    (oe.prototype.replaceWith = function (t, e, n) {
      return this.replace(t, e, new p(r.from(n), 0, 0));
    }),
    (oe.prototype.delete = function (t, e) {
      return this.replace(t, e, p.empty);
    }),
    (oe.prototype.insert = function (t, e) {
      return this.replaceWith(t, t, e);
    }),
    (oe.prototype.replaceRange = function (t, e, n) {
      return (
        (function (t, e, n, r) {
          if (!r.size) return t.deleteRange(e, n);
          const o = t.doc.resolve(e);
          const i = t.doc.resolve(n);
          if (Wt(o, i, r)) return t.step(new Et(e, n, r));
          const s = ee(o, t.doc.resolve(n));
          s[s.length - 1] == 0 && s.pop();
          let a = -(o.depth + 1);
          s.unshift(a);
          for (let c = o.depth, l = o.pos - 1; c > 0; c--, l--) {
            const h = o.node(c).type.spec;
            if (h.defining || h.definingAsContext || h.isolating) break;
            s.indexOf(c) > -1
              ? (a = c)
              : o.before(c) == l && s.splice(1, 0, -c);
          }
          for (
            var u = s.indexOf(a), f = [], d = r.openStart, m = r.content, v = 0;
            ;
            v++
          ) {
            const g = m.firstChild;
            if ((f.push(g), v == r.openStart)) break;
            m = g.content;
          }
          for (let y = d - 1; y >= 0; y--) {
            const w = f[y].type;
            const b = Zt(w);
            if (b && o.node(u).type != w) d = y;
            else if (b || !w.isTextblock) break;
          }
          for (let k = r.openStart; k >= 0; k--) {
            const x = (k + d + 1) % (r.openStart + 1);
            const S = f[x];
            if (S)
              for (let M = 0; M < s.length; M++) {
                let C = s[(M + u) % s.length];
                let O = !0;
                C < 0 && ((O = !1), (C = -C));
                const N = o.node(C - 1);
                const D = o.index(C - 1);
                if (N.canReplaceWith(D, D, S.type, S.marks))
                  return t.replace(
                    o.before(C),
                    O ? i.after(C) : n,
                    new p(te(r.content, 0, r.openStart, x), x, r.openEnd),
                  );
              }
          }
          for (
            let T = t.steps.length, A = s.length - 1;
            A >= 0 && (t.replace(e, n, r), !(t.steps.length > T));
            A--
          ) {
            const E = s[A];
            E < 0 || ((e = o.before(E)), (n = i.after(E)));
          }
        })(this, t, e, n),
        this
      );
    }),
    (oe.prototype.replaceRangeWith = function (t, e, n) {
      return (
        (function (t, e, n, o) {
          if (!o.isInline && e == n && t.doc.resolve(e).parent.content.size) {
            const i = Lt(t.doc, e, o.type);
            null != i && (e = n = i);
          }
          t.replaceRange(e, n, new p(r.from(o), 0, 0));
        })(this, t, e, n),
        this
      );
    }),
    (oe.prototype.deleteRange = function (t, e) {
      return (
        (function (t, e, n) {
          for (
            var r = t.doc.resolve(e), o = t.doc.resolve(n), i = ee(r, o), s = 0;
            s < i.length;
            s++
          ) {
            const a = i[s];
            const c = s == i.length - 1;
            if ((c && a == 0) || r.node(a).type.contentMatch.validEnd)
              return t.delete(r.start(a), o.end(a));
            if (
              a > 0 &&
              (c ||
                r.node(a - 1).canReplace(r.index(a - 1), o.indexAfter(a - 1)))
            )
              return t.delete(r.before(a), o.after(a));
          }
          for (let l = 1; l <= r.depth && l <= o.depth; l++)
            if (
              e - r.start(l) == r.depth - l &&
              n > r.end(l) &&
              o.end(l) - n != o.depth - l
            )
              return t.delete(r.before(l), n);
          t.delete(e, n);
        })(this, t, e),
        this
      );
    }),
    (oe.prototype.lift = function (t, e) {
      return (
        (function (t, e, n) {
          for (
            var o = e.$from,
              i = e.$to,
              s = e.depth,
              a = o.before(s + 1),
              c = i.after(s + 1),
              l = a,
              h = c,
              u = r.empty,
              f = 0,
              d = s,
              m = !1;
            d > n;
            d--
          )
            m || o.index(d) > 0
              ? ((m = !0), (u = r.from(o.node(d).copy(u))), f++)
              : l--;
          for (var v = r.empty, g = 0, y = s, w = !1; y > n; y--)
            w || i.after(y + 1) < i.end(y)
              ? ((w = !0), (v = r.from(i.node(y).copy(v))), g++)
              : h++;
          t.step(new It(l, h, a, c, new p(u.append(v), f, g), u.size - f, !0));
        })(this, t, e),
        this
      );
    }),
    (oe.prototype.join = function (t, e) {
      return (
        void 0 === e && (e = 1),
        (function (t, e, n) {
          const r = new Et(e - n, e + n, p.empty, !0);
          t.step(r);
        })(this, t, e),
        this
      );
    }),
    (oe.prototype.wrap = function (t, e) {
      return (
        (function (t, e, n) {
          for (var o = r.empty, i = n.length - 1; i >= 0; i--) {
            if (o.size) {
              const s = n[i].type.contentMatch.matchFragment(o);
              if (!s || !s.validEnd)
                throw new RangeError(
                  'Wrapper type given to Transform.wrap does not form valid content of its parent wrapper',
                );
            }
            o = r.from(n[i].type.create(n[i].attrs, o));
          }
          const a = e.start;
          const c = e.end;
          t.step(new It(a, c, a, c, new p(o, 0, 0), n.length, !0));
        })(this, t, e),
        this
      );
    }),
    (oe.prototype.setBlockType = function (t, e, n, o) {
      return (
        void 0 === e && (e = t),
        void 0 === o && (o = null),
        (function (t, e, n, o, i) {
          if (!o.isTextblock)
            throw new RangeError(
              'Type given to setBlockType should be a textblock',
            );
          const s = t.steps.length;
          t.doc.nodesBetween(e, n, function (e, n) {
            if (
              e.isTextblock &&
              !e.hasMarkup(o, i) &&
              (function (t, e, n) {
                const r = t.resolve(e);
                const o = r.index();
                return r.parent.canReplaceWith(o, o + 1, n);
              })(t.doc, t.mapping.slice(s).map(n), o)
            ) {
              t.clearIncompatible(t.mapping.slice(s).map(n, 1), o);
              const a = t.mapping.slice(s);
              const c = a.map(n, 1);
              const l = a.map(n + e.nodeSize, 1);
              return (
                t.step(
                  new It(
                    c,
                    l,
                    c + 1,
                    l - 1,
                    new p(r.from(o.create(i, null, e.marks)), 0, 0),
                    1,
                    !0,
                  ),
                ),
                !1
              );
            }
          });
        })(this, t, e, n, o),
        this
      );
    }),
    (oe.prototype.setNodeMarkup = function (t, e, n, o) {
      return (
        void 0 === n && (n = null),
        void 0 === o && (o = []),
        (function (t, e, n, o, i) {
          const s = t.doc.nodeAt(e);
          if (!s) throw new RangeError('No node at given position');
          n || (n = s.type);
          const a = n.create(o, null, i || s.marks);
          if (s.isLeaf) return t.replaceWith(e, e + s.nodeSize, a);
          if (!n.validContent(s.content))
            throw new RangeError('Invalid content for node type ' + n.name);
          t.step(
            new It(
              e,
              e + s.nodeSize,
              e + 1,
              e + s.nodeSize - 1,
              new p(r.from(a), 0, 0),
              1,
              !0,
            ),
          );
        })(this, t, e, n, o),
        this
      );
    }),
    (oe.prototype.setNodeAttribute = function (t, e, n) {
      return this.step(new ne(t, e, n)), this;
    }),
    (oe.prototype.addNodeMark = function (t, e) {
      return this.step(new Tt(t, e)), this;
    }),
    (oe.prototype.removeNodeMark = function (t, e) {
      if (!(e instanceof c)) {
        const n = this.doc.nodeAt(t);
        if (!n) throw new RangeError('No node at position ' + t);
        if (!(e = e.isInSet(n.marks))) return this;
      }
      return this.step(new At(t, e)), this;
    }),
    (oe.prototype.split = function (t, e, n) {
      return (
        void 0 === e && (e = 1),
        (function (t, e, n, o) {
          void 0 === n && (n = 1);
          for (
            var i = t.doc.resolve(e),
              s = r.empty,
              a = r.empty,
              c = i.depth,
              l = i.depth - n,
              h = n - 1;
            c > l;
            c--, h--
          ) {
            s = r.from(i.node(c).copy(s));
            const u = o && o[h];
            a = r.from(u ? u.type.create(u.attrs, a) : i.node(c).copy(a));
          }
          t.step(new Et(e, e, new p(s.append(a), n, n), !0));
        })(this, t, e, n),
        this
      );
    }),
    (oe.prototype.addMark = function (t, e, n) {
      return (
        (function (t, e, n, r) {
          let o;
          let i;
          const s = [];
          const a = [];
          t.doc.nodesBetween(e, n, function (t, c, l) {
            if (t.isInline) {
              const p = t.marks;
              if (!r.isInSet(p) && l.type.allowsMarkType(r.type)) {
                for (
                  var h = Math.max(c, e),
                    u = Math.min(c + t.nodeSize, n),
                    f = r.addToSet(p),
                    d = 0;
                  d < p.length;
                  d++
                )
                  p[d].isInSet(f) ||
                    (o && o.to == h && o.mark.eq(p[d])
                      ? (o.to = u)
                      : s.push((o = new Dt(h, u, p[d]))));
                i && i.to == h ? (i.to = u) : a.push((i = new Nt(h, u, r)));
              }
            }
          }),
            s.forEach(function (e) {
              return t.step(e);
            }),
            a.forEach(function (e) {
              return t.step(e);
            });
        })(this, t, e, n),
        this
      );
    }),
    (oe.prototype.removeMark = function (t, e, n) {
      return (
        (function (t, e, n, r) {
          const o = [];
          let i = 0;
          t.doc.nodesBetween(e, n, function (t, s) {
            if (t.isInline) {
              i++;
              let a = null;
              if (r instanceof Z)
                for (var c, l = t.marks; (c = r.isInSet(l)); )
                  (a || (a = [])).push(c), (l = c.removeFromSet(l));
              else r ? r.isInSet(t.marks) && (a = [r]) : (a = t.marks);
              if (a && a.length)
                for (
                  let p = Math.min(s + t.nodeSize, n), h = 0;
                  h < a.length;
                  h++
                ) {
                  for (var u = a[h], f = void 0, d = 0; d < o.length; d++) {
                    const m = o[d];
                    m.step == i - 1 && u.eq(o[d].style) && (f = m);
                  }
                  f
                    ? ((f.to = p), (f.step = i))
                    : o.push({
                        style: u,
                        from: Math.max(s, e),
                        to: p,
                        step: i,
                      });
                }
            }
          }),
            o.forEach(function (e) {
              return t.step(new Dt(e.from, e.to, e.style));
            });
        })(this, t, e, n),
        this
      );
    }),
    (oe.prototype.clearIncompatible = function (t, e, n) {
      return (
        (function (t, e, n, o) {
          void 0 === o && (o = n.contentMatch);
          for (
            var i = t.doc.nodeAt(e), s = [], a = e + 1, c = 0;
            c < i.childCount;
            c++
          ) {
            const l = i.child(c);
            const h = a + l.nodeSize;
            const u = o.matchType(l.type);
            if (u) {
              o = u;
              for (let f = 0; f < l.marks.length; f++)
                n.allowsMarkType(l.marks[f].type) ||
                  t.step(new Dt(a, h, l.marks[f]));
            } else s.push(new Et(a, h, p.empty));
            a = h;
          }
          if (!o.validEnd) {
            const d = o.fillBefore(r.empty, !0);
            t.replace(a, a, new p(d, 0, 0));
          }
          for (let m = s.length - 1; m >= 0; m--) t.step(s[m]);
        })(this, t, e, n),
        this
      );
    }),
    Object.defineProperties(oe.prototype, ie);
  const se = Object.freeze({
    __proto__: null,
    AddMarkStep: Nt,
    AddNodeMarkStep: Tt,
    AttrStep: ne,
    MapResult: wt,
    Mapping: xt,
    RemoveMarkStep: Dt,
    RemoveNodeMarkStep: At,
    ReplaceAroundStep: It,
    ReplaceStep: Et,
    Step: Mt,
    StepMap: kt,
    StepResult: Ct,
    Transform: oe,
    get TransformError() {
      return re;
    },
    canJoin: Ft,
    canSplit: Vt,
    dropPoint: jt,
    findWrapping: Bt,
    insertPoint: Lt,
    joinPoint: qt,
    liftTarget: Pt,
    replaceStep: Jt,
  });
  const ae = Object.create(null);
  const ce = function (t, e, n) {
    (this.$anchor = t),
      (this.$head = e),
      (this.ranges = n || [new pe(t.min(e), t.max(e))]);
  };
  const le = {
    anchor: { configurable: !0 },
    head: { configurable: !0 },
    from: { configurable: !0 },
    to: { configurable: !0 },
    $from: { configurable: !0 },
    $to: { configurable: !0 },
    empty: { configurable: !0 },
  };
  (le.anchor.get = function () {
    return this.$anchor.pos;
  }),
    (le.head.get = function () {
      return this.$head.pos;
    }),
    (le.from.get = function () {
      return this.$from.pos;
    }),
    (le.to.get = function () {
      return this.$to.pos;
    }),
    (le.$from.get = function () {
      return this.ranges[0].$from;
    }),
    (le.$to.get = function () {
      return this.ranges[0].$to;
    }),
    (le.empty.get = function () {
      for (let t = this.ranges, e = 0; e < t.length; e++)
        if (t[e].$from.pos != t[e].$to.pos) return !1;
      return !0;
    }),
    (ce.prototype.content = function () {
      return this.$from.doc.slice(this.from, this.to, !0);
    }),
    (ce.prototype.replace = function (t, e) {
      void 0 === e && (e = p.empty);
      for (var n = e.content.lastChild, r = null, o = 0; o < e.openEnd; o++)
        (r = n), (n = n.lastChild);
      for (let i = t.steps.length, s = this.ranges, a = 0; a < s.length; a++) {
        const c = s[a];
        const l = c.$from;
        const h = c.$to;
        const u = t.mapping.slice(i);
        t.replaceRange(u.map(l.pos), u.map(h.pos), a ? p.empty : e),
          a == 0 && be(t, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
      }
    }),
    (ce.prototype.replaceWith = function (t, e) {
      for (let n = t.steps.length, r = this.ranges, o = 0; o < r.length; o++) {
        const i = r[o];
        const s = i.$from;
        const a = i.$to;
        const c = t.mapping.slice(n);
        const l = c.map(s.pos);
        const p = c.map(a.pos);
        o
          ? t.deleteRange(l, p)
          : (t.replaceRangeWith(l, p, e), be(t, n, e.isInline ? -1 : 1));
      }
    }),
    (ce.findFrom = function (t, e, n) {
      void 0 === n && (n = !1);
      const r = t.parent.inlineContent
        ? new fe(t)
        : we(t.node(0), t.parent, t.pos, t.index(), e, n);
      if (r) return r;
      for (let o = t.depth - 1; o >= 0; o--) {
        const i =
          e < 0
            ? we(t.node(0), t.node(o), t.before(o + 1), t.index(o), e, n)
            : we(t.node(0), t.node(o), t.after(o + 1), t.index(o) + 1, e, n);
        if (i) return i;
      }
      return null;
    }),
    (ce.near = function (t, e) {
      return (
        void 0 === e && (e = 1),
        this.findFrom(t, e) || this.findFrom(t, -e) || new ge(t.node(0))
      );
    }),
    (ce.atStart = function (t) {
      return we(t, t, 0, 0, 1) || new ge(t);
    }),
    (ce.atEnd = function (t) {
      return we(t, t, t.content.size, t.childCount, -1) || new ge(t);
    }),
    (ce.fromJSON = function (t, e) {
      if (!e || !e.type)
        throw new RangeError('Invalid input for Selection.fromJSON');
      const n = ae[e.type];
      if (!n) throw new RangeError('No selection type ' + e.type + ' defined');
      return n.fromJSON(t, e);
    }),
    (ce.jsonID = function (t, e) {
      if (t in ae)
        throw new RangeError('Duplicate use of selection JSON ID ' + t);
      return (ae[t] = e), (e.prototype.jsonID = t), e;
    }),
    (ce.prototype.getBookmark = function () {
      return fe.between(this.$anchor, this.$head).getBookmark();
    }),
    Object.defineProperties(ce.prototype, le),
    (ce.prototype.visible = !0);
  var pe = function (t, e) {
    (this.$from = t), (this.$to = e);
  };
  let he = !1;
  function ue(t) {
    he ||
      t.parent.inlineContent ||
      ((he = !0),
      console.warn(
        'TextSelection endpoint not pointing into a node with inline content (' +
          t.parent.type.name +
          ')',
      ));
  }
  var fe = (function (t) {
    function e(e, n) {
      void 0 === n && (n = e), ue(e), ue(n), t.call(this, e, n);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = { $cursor: { configurable: !0 } };
    return (
      (n.$cursor.get = function () {
        return this.$anchor.pos == this.$head.pos ? this.$head : null;
      }),
      (e.prototype.map = function (n, r) {
        const o = n.resolve(r.map(this.head));
        if (!o.parent.inlineContent) return t.near(o);
        const i = n.resolve(r.map(this.anchor));
        return new e(i.parent.inlineContent ? i : o, o);
      }),
      (e.prototype.replace = function (e, n) {
        if (
          (void 0 === n && (n = p.empty),
          t.prototype.replace.call(this, e, n),
          n == p.empty)
        ) {
          const r = this.$from.marksAcross(this.$to);
          r && e.ensureMarks(r);
        }
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e && t.anchor == this.anchor && t.head == this.head;
      }),
      (e.prototype.getBookmark = function () {
        return new de(this.anchor, this.head);
      }),
      (e.prototype.toJSON = function () {
        return { type: 'text', anchor: this.anchor, head: this.head };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.anchor || 'number' !== typeof n.head)
          throw new RangeError('Invalid input for TextSelection.fromJSON');
        return new e(t.resolve(n.anchor), t.resolve(n.head));
      }),
      (e.create = function (t, e, n) {
        void 0 === n && (n = e);
        const r = t.resolve(e);
        return new this(r, n == e ? r : t.resolve(n));
      }),
      (e.between = function (n, r, o) {
        const i = n.pos - r.pos;
        if (((o && !i) || (o = i >= 0 ? 1 : -1), !r.parent.inlineContent)) {
          const s = t.findFrom(r, o, !0) || t.findFrom(r, -o, !0);
          if (!s) return t.near(r, o);
          r = s.$head;
        }
        return (
          n.parent.inlineContent ||
            ((i == 0 ||
              (n = (t.findFrom(n, -o, !0) || t.findFrom(n, o, !0)).$anchor)
                .pos <
                r.pos !=
                i < 0) &&
              (n = r)),
          new e(n, r)
        );
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(ce);
  ce.jsonID('text', fe);
  var de = function (t, e) {
    (this.anchor = t), (this.head = e);
  };
  (de.prototype.map = function (t) {
    return new de(t.map(this.anchor), t.map(this.head));
  }),
    (de.prototype.resolve = function (t) {
      return fe.between(t.resolve(this.anchor), t.resolve(this.head));
    });
  const me = (function (t) {
    function e(e) {
      const n = e.nodeAfter;
      const r = e.node(0).resolve(e.pos + n.nodeSize);
      t.call(this, e, r), (this.node = n);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.map = function (n, r) {
        const o = r.mapResult(this.anchor);
        const i = o.deleted;
        const s = o.pos;
        const a = n.resolve(s);
        return i ? t.near(a) : new e(a);
      }),
      (e.prototype.content = function () {
        return new p(r.from(this.node), 0, 0);
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e && t.anchor == this.anchor;
      }),
      (e.prototype.toJSON = function () {
        return { type: 'node', anchor: this.anchor };
      }),
      (e.prototype.getBookmark = function () {
        return new ve(this.anchor);
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.anchor)
          throw new RangeError('Invalid input for NodeSelection.fromJSON');
        return new e(t.resolve(n.anchor));
      }),
      (e.create = function (t, n) {
        return new e(t.resolve(n));
      }),
      (e.isSelectable = function (t) {
        return !t.isText && !1 !== t.type.spec.selectable;
      }),
      e
    );
  })(ce);
  (me.prototype.visible = !1), ce.jsonID('node', me);
  var ve = function (t) {
    this.anchor = t;
  };
  (ve.prototype.map = function (t) {
    const e = t.mapResult(this.anchor);
    const n = e.deleted;
    const r = e.pos;
    return n ? new de(r, r) : new ve(r);
  }),
    (ve.prototype.resolve = function (t) {
      const e = t.resolve(this.anchor);
      const n = e.nodeAfter;
      return n && me.isSelectable(n) ? new me(e) : ce.near(e);
    });
  var ge = (function (t) {
    function e(e) {
      t.call(this, e.resolve(0), e.resolve(e.content.size));
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.replace = function (e, n) {
        if ((void 0 === n && (n = p.empty), n == p.empty)) {
          e.delete(0, e.doc.content.size);
          const r = t.atStart(e.doc);
          r.eq(e.selection) || e.setSelection(r);
        } else t.prototype.replace.call(this, e, n);
      }),
      (e.prototype.toJSON = function () {
        return { type: 'all' };
      }),
      (e.fromJSON = function (t) {
        return new e(t);
      }),
      (e.prototype.map = function (t) {
        return new e(t);
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e;
      }),
      (e.prototype.getBookmark = function () {
        return ye;
      }),
      e
    );
  })(ce);
  ce.jsonID('all', ge);
  var ye = {
    map: function () {
      return this;
    },
    resolve: function (t) {
      return new ge(t);
    },
  };
  function we(t, e, n, r, o, i) {
    if ((void 0 === i && (i = !1), e.inlineContent)) return fe.create(t, n);
    for (
      let s = r - (o > 0 ? 0 : 1);
      o > 0 ? s < e.childCount : s >= 0;
      s += o
    ) {
      const a = e.child(s);
      if (a.isAtom) {
        if (!i && me.isSelectable(a))
          return me.create(t, n - (o < 0 ? a.nodeSize : 0));
      } else {
        const c = we(t, a, n + o, o < 0 ? a.childCount : 0, o, i);
        if (c) return c;
      }
      n += a.nodeSize * o;
    }
    return null;
  }
  function be(t, e, n) {
    const r = t.steps.length - 1;
    if (!(r < e)) {
      let o;
      const i = t.steps[r];
      if (i instanceof Et || i instanceof It)
        t.mapping.maps[r].forEach(function (t, e, n, r) {
          o == null && (o = r);
        }),
          t.setSelection(ce.near(t.doc.resolve(o), n));
    }
  }
  const ke = (function (t) {
    function e(e) {
      t.call(this, e.doc),
        (this.curSelectionFor = 0),
        (this.updated = 0),
        (this.meta = Object.create(null)),
        (this.time = Date.now()),
        (this.curSelection = e.selection),
        (this.storedMarks = e.storedMarks);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = {
      selection: { configurable: !0 },
      selectionSet: { configurable: !0 },
      storedMarksSet: { configurable: !0 },
      isGeneric: { configurable: !0 },
      scrolledIntoView: { configurable: !0 },
    };
    return (
      (n.selection.get = function () {
        return (
          this.curSelectionFor < this.steps.length &&
            ((this.curSelection = this.curSelection.map(
              this.doc,
              this.mapping.slice(this.curSelectionFor),
            )),
            (this.curSelectionFor = this.steps.length)),
          this.curSelection
        );
      }),
      (e.prototype.setSelection = function (t) {
        if (t.$from.doc != this.doc)
          throw new RangeError(
            'Selection passed to setSelection must point at the current document',
          );
        return (
          (this.curSelection = t),
          (this.curSelectionFor = this.steps.length),
          (this.updated = -3 & (1 | this.updated)),
          (this.storedMarks = null),
          this
        );
      }),
      (n.selectionSet.get = function () {
        return (1 & this.updated) > 0;
      }),
      (e.prototype.setStoredMarks = function (t) {
        return (this.storedMarks = t), (this.updated |= 2), this;
      }),
      (e.prototype.ensureMarks = function (t) {
        return (
          c.sameSet(this.storedMarks || this.selection.$from.marks(), t) ||
            this.setStoredMarks(t),
          this
        );
      }),
      (e.prototype.addStoredMark = function (t) {
        return this.ensureMarks(
          t.addToSet(this.storedMarks || this.selection.$head.marks()),
        );
      }),
      (e.prototype.removeStoredMark = function (t) {
        return this.ensureMarks(
          t.removeFromSet(this.storedMarks || this.selection.$head.marks()),
        );
      }),
      (n.storedMarksSet.get = function () {
        return (2 & this.updated) > 0;
      }),
      (e.prototype.addStep = function (e, n) {
        t.prototype.addStep.call(this, e, n),
          (this.updated = -3 & this.updated),
          (this.storedMarks = null);
      }),
      (e.prototype.setTime = function (t) {
        return (this.time = t), this;
      }),
      (e.prototype.replaceSelection = function (t) {
        return this.selection.replace(this, t), this;
      }),
      (e.prototype.replaceSelectionWith = function (t, e) {
        void 0 === e && (e = !0);
        const n = this.selection;
        return (
          e &&
            (t = t.mark(
              this.storedMarks ||
                (n.empty
                  ? n.$from.marks()
                  : n.$from.marksAcross(n.$to) || c.none),
            )),
          n.replaceWith(this, t),
          this
        );
      }),
      (e.prototype.deleteSelection = function () {
        return this.selection.replace(this), this;
      }),
      (e.prototype.insertText = function (t, e, n) {
        const r = this.doc.type.schema;
        if (e == null)
          return t
            ? this.replaceSelectionWith(r.text(t), !0)
            : this.deleteSelection();
        if ((n == null && (n = e), (n = n == null ? e : n), !t))
          return this.deleteRange(e, n);
        let o = this.storedMarks;
        if (!o) {
          const i = this.doc.resolve(e);
          o = n == e ? i.marks() : i.marksAcross(this.doc.resolve(n));
        }
        return (
          this.replaceRangeWith(e, n, r.text(t, o)),
          this.selection.empty ||
            this.setSelection(ce.near(this.selection.$to)),
          this
        );
      }),
      (e.prototype.setMeta = function (t, e) {
        return (this.meta[typeof t === 'string' ? t : t.key] = e), this;
      }),
      (e.prototype.getMeta = function (t) {
        return this.meta[typeof t === 'string' ? t : t.key];
      }),
      (n.isGeneric.get = function () {
        for (const t in this.meta) return !1;
        return !0;
      }),
      (e.prototype.scrollIntoView = function () {
        return (this.updated |= 4), this;
      }),
      (n.scrolledIntoView.get = function () {
        return (4 & this.updated) > 0;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(oe);
  function xe(t, e) {
    return e && t ? t.bind(e) : t;
  }
  const Se = function (t, e, n) {
    (this.name = t), (this.init = xe(e.init, n)), (this.apply = xe(e.apply, n));
  };
  const Me = [
    new Se('doc', {
      init: function (t) {
        return t.doc || t.schema.topNodeType.createAndFill();
      },
      apply: function (t) {
        return t.doc;
      },
    }),
    new Se('selection', {
      init: function (t, e) {
        return t.selection || ce.atStart(e.doc);
      },
      apply: function (t) {
        return t.selection;
      },
    }),
    new Se('storedMarks', {
      init: function (t) {
        return t.storedMarks || null;
      },
      apply: function (t, e, n, r) {
        return r.selection.$cursor ? t.storedMarks : null;
      },
    }),
    new Se('scrollToSelection', {
      init: function () {
        return 0;
      },
      apply: function (t, e) {
        return t.scrolledIntoView ? e + 1 : e;
      },
    }),
  ];
  const Ce = function (t, e) {
    const n = this;
    (this.schema = t),
      (this.plugins = []),
      (this.pluginsByKey = Object.create(null)),
      (this.fields = Me.slice()),
      e &&
        e.forEach(function (t) {
          if (n.pluginsByKey[t.key])
            throw new RangeError(
              'Adding different instances of a keyed plugin (' + t.key + ')',
            );
          n.plugins.push(t),
            (n.pluginsByKey[t.key] = t),
            t.spec.state && n.fields.push(new Se(t.key, t.spec.state, t));
        });
  };
  const Oe = function (t) {
    this.config = t;
  };
  const Ne = {
    schema: { configurable: !0 },
    plugins: { configurable: !0 },
    tr: { configurable: !0 },
  };
  function De(t, e, n) {
    for (const r in t) {
      let o = t[r];
      o instanceof Function
        ? (o = o.bind(e))
        : r == 'handleDOMEvents' && (o = De(o, e, {})),
        (n[r] = o);
    }
    return n;
  }
  (Ne.schema.get = function () {
    return this.config.schema;
  }),
    (Ne.plugins.get = function () {
      return this.config.plugins;
    }),
    (Oe.prototype.apply = function (t) {
      return this.applyTransaction(t).state;
    }),
    (Oe.prototype.filterTransaction = function (t, e) {
      void 0 === e && (e = -1);
      for (let n = 0; n < this.config.plugins.length; n++)
        if (n != e) {
          const r = this.config.plugins[n];
          if (
            r.spec.filterTransaction &&
            !r.spec.filterTransaction.call(r, t, this)
          )
            return !1;
        }
      return !0;
    }),
    (Oe.prototype.applyTransaction = function (t) {
      if (!this.filterTransaction(t)) return { state: this, transactions: [] };
      for (let e = [t], n = this.applyInner(t), r = null; ; ) {
        for (var o = !1, i = 0; i < this.config.plugins.length; i++) {
          const s = this.config.plugins[i];
          if (s.spec.appendTransaction) {
            const a = r ? r[i].n : 0;
            const c = r ? r[i].state : this;
            const l =
              a < e.length &&
              s.spec.appendTransaction.call(s, a ? e.slice(a) : e, c, n);
            if (l && n.filterTransaction(l, i)) {
              if ((l.setMeta('appendedTransaction', t), !r)) {
                r = [];
                for (let p = 0; p < this.config.plugins.length; p++)
                  r.push(
                    p < i ? { state: n, n: e.length } : { state: this, n: 0 },
                  );
              }
              e.push(l), (n = n.applyInner(l)), (o = !0);
            }
            r && (r[i] = { state: n, n: e.length });
          }
        }
        if (!o) return { state: n, transactions: e };
      }
    }),
    (Oe.prototype.applyInner = function (t) {
      if (!t.before.eq(this.doc))
        throw new RangeError('Applying a mismatched transaction');
      for (
        var e = new Oe(this.config), n = this.config.fields, r = 0;
        r < n.length;
        r++
      ) {
        const o = n[r];
        e[o.name] = o.apply(t, this[o.name], this, e);
      }
      return e;
    }),
    (Ne.tr.get = function () {
      return new ke(this);
    }),
    (Oe.create = function (t) {
      for (
        var e = new Ce(t.doc ? t.doc.type.schema : t.schema, t.plugins),
          n = new Oe(e),
          r = 0;
        r < e.fields.length;
        r++
      )
        n[e.fields[r].name] = e.fields[r].init(t, n);
      return n;
    }),
    (Oe.prototype.reconfigure = function (t) {
      for (
        var e = new Ce(this.schema, t.plugins),
          n = e.fields,
          r = new Oe(e),
          o = 0;
        o < n.length;
        o++
      ) {
        const i = n[o].name;
        r[i] = this.hasOwnProperty(i) ? this[i] : n[o].init(t, r);
      }
      return r;
    }),
    (Oe.prototype.toJSON = function (t) {
      const e = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
      if (
        (this.storedMarks &&
          (e.storedMarks = this.storedMarks.map(function (t) {
            return t.toJSON();
          })),
        t && typeof t === 'object')
      )
        for (const n in t) {
          if (n == 'doc' || n == 'selection')
            throw new RangeError(
              'The JSON fields `doc` and `selection` are reserved',
            );
          const r = t[n];
          const o = r.spec.state;
          o && o.toJSON && (e[n] = o.toJSON.call(r, this[r.key]));
        }
      return e;
    }),
    (Oe.fromJSON = function (t, e, n) {
      if (!e) throw new RangeError('Invalid input for EditorState.fromJSON');
      if (!t.schema)
        throw new RangeError("Required config field 'schema' missing");
      const r = new Ce(t.schema, t.plugins);
      const o = new Oe(r);
      return (
        r.fields.forEach(function (r) {
          if (r.name == 'doc') o.doc = E.fromJSON(t.schema, e.doc);
          else if (r.name == 'selection')
            o.selection = ce.fromJSON(o.doc, e.selection);
          else if (r.name == 'storedMarks')
            e.storedMarks &&
              (o.storedMarks = e.storedMarks.map(t.schema.markFromJSON));
          else {
            if (n)
              for (const i in n) {
                const s = n[i];
                const a = s.spec.state;
                if (s.key == r.name && a && a.fromJSON && Object.hasOwn(e, i))
                  return void (o[r.name] = a.fromJSON.call(s, t, e[i], o));
              }
            o[r.name] = r.init(t, o);
          }
        }),
        o
      );
    }),
    Object.defineProperties(Oe.prototype, Ne);
  const Te = function (t) {
    (this.spec = t),
      (this.props = {}),
      t.props && De(t.props, this, this.props),
      (this.key = t.key ? t.key.key : Ee('plugin'));
  };
  Te.prototype.getState = function (t) {
    return t[this.key];
  };
  const Ae = Object.create(null);
  function Ee(t) {
    return t in Ae ? t + '$' + ++Ae[t] : ((Ae[t] = 0), t + '$');
  }
  const Ie = function (t) {
    void 0 === t && (t = 'key'), (this.key = Ee(t));
  };
  (Ie.prototype.get = function (t) {
    return t.config.pluginsByKey[this.key];
  }),
    (Ie.prototype.getState = function (t) {
      return t[this.key];
    });
  const Re = Object.freeze({
    __proto__: null,
    AllSelection: ge,
    EditorState: Oe,
    NodeSelection: me,
    Plugin: Te,
    PluginKey: Ie,
    Selection: ce,
    SelectionRange: pe,
    TextSelection: fe,
    Transaction: ke,
  });
  const ze = 'undefined' !== typeof navigator ? navigator : null;
  const Pe = 'undefined' !== typeof document ? document : null;
  const Be = (ze && ze.userAgent) || '';
  const _e = /Edge\/(\d+)/.exec(Be);
  const Ve = /MSIE \d/.exec(Be);
  const Fe = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Be);
  const $e = !!(Ve || Fe || _e);
  const qe = Ve
    ? document.documentMode
    : Fe
    ? Number(Fe[1])
    : _e
    ? Number(_e[1])
    : 0;
  const Le = !$e && /gecko\/(\d+)/i.test(Be);
  Le && (/Firefox\/(\d+)/.exec(Be) || [0, 0])[1];
  const je = !$e && /Chrome\/(\d+)/.exec(Be);
  const Je = !!je;
  const We = je ? Number(je[1]) : 0;
  const Ke = !$e && !!ze && /Apple Computer/.test(ze.vendor);
  const He = Ke && (/Mobile\/\w+/.test(Be) || (!!ze && ze.maxTouchPoints > 2));
  const Ue = He || (!!ze && /Mac/.test(ze.platform));
  const Ge = /Android \d/.test(Be);
  const Qe = !!Pe && 'webkitFontSmoothing' in Pe.documentElement.style;
  const Xe = Qe
    ? Number((/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1])
    : 0;
  const Ye = function (t) {
    for (let e = 0; ; e++) if (!(t = t.previousSibling)) return e;
  };
  const Ze = function (t) {
    const e = t.assignedSlot || t.parentNode;
    return e && e.nodeType == 11 ? e.host : e;
  };
  let tn = null;
  const en = function (t, e, n) {
    const r = tn || (tn = document.createRange());
    return (
      r.setEnd(t, n == null ? t.nodeValue.length : n), r.setStart(t, e || 0), r
    );
  };
  const nn = function (t, e, n, r) {
    return n && (on(t, e, n, r, -1) || on(t, e, n, r, 1));
  };
  const rn = /^(img|br|input|textarea|hr)$/i;
  function on(t, e, n, r, o) {
    for (;;) {
      if (t == n && e == r) return !0;
      if (e == (o < 0 ? 0 : sn(t))) {
        const i = t.parentNode;
        if (
          !i ||
          1 != i.nodeType ||
          an(t) ||
          rn.test(t.nodeName) ||
          t.contentEditable == 'false'
        )
          return !1;
        (e = Ye(t) + (o < 0 ? 0 : 1)), (t = i);
      } else {
        if (1 != t.nodeType) return !1;
        if ((t = t.childNodes[e + (o < 0 ? -1 : 0)]).contentEditable == 'false')
          return !1;
        e = o < 0 ? sn(t) : 0;
      }
    }
  }
  function sn(t) {
    return t.nodeType == 3 ? t.nodeValue.length : t.childNodes.length;
  }
  function an(t) {
    for (var e, n = t; n && !(e = n.pmViewDesc); n = n.parentNode);
    return e && e.node && e.node.isBlock && (e.dom == t || e.contentDOM == t);
  }
  const cn = function (t) {
    let e = t.isCollapsed;
    return e && Je && t.rangeCount && !t.getRangeAt(0).collapsed && (e = !1), e;
  };
  function ln(t, e) {
    const n = document.createEvent('Event');
    return (
      n.initEvent('keydown', !0, !0), (n.keyCode = t), (n.key = n.code = e), n
    );
  }
  function pn(t) {
    return {
      left: 0,
      right: t.documentElement.clientWidth,
      top: 0,
      bottom: t.documentElement.clientHeight,
    };
  }
  function hn(t, e) {
    return typeof t === 'number' ? t : t[e];
  }
  function un(t) {
    const e = t.getBoundingClientRect();
    const n = e.width / t.offsetWidth || 1;
    const r = e.height / t.offsetHeight || 1;
    return {
      left: e.left,
      right: e.left + t.clientWidth * n,
      top: e.top,
      bottom: e.top + t.clientHeight * r,
    };
  }
  function fn(t, e, n) {
    for (
      let r = t.someProp('scrollThreshold') || 0,
        o = t.someProp('scrollMargin') || 5,
        i = t.dom.ownerDocument,
        s = n || t.dom;
      s;
      s = Ze(s)
    )
      if (s.nodeType == 1) {
        const a = s;
        const c = a == i.body;
        const l = c ? pn(i) : un(a);
        let p = 0;
        let h = 0;
        if (
          (e.top < l.top + hn(r, 'top')
            ? (h = -(l.top - e.top + hn(o, 'top')))
            : e.bottom > l.bottom - hn(r, 'bottom') &&
              (h = e.bottom - l.bottom + hn(o, 'bottom')),
          e.left < l.left + hn(r, 'left')
            ? (p = -(l.left - e.left + hn(o, 'left')))
            : e.right > l.right - hn(r, 'right') &&
              (p = e.right - l.right + hn(o, 'right')),
          p || h)
        )
          if (c) i.defaultView.scrollBy(p, h);
          else {
            const u = a.scrollLeft;
            const f = a.scrollTop;
            h && (a.scrollTop += h), p && (a.scrollLeft += p);
            const d = a.scrollLeft - u;
            const m = a.scrollTop - f;
            e = {
              left: e.left - d,
              top: e.top - m,
              right: e.right - d,
              bottom: e.bottom - m,
            };
          }
        if (c) break;
      }
  }
  function dn(t) {
    for (
      var e = [], n = t.ownerDocument, r = t;
      r && (e.push({ dom: r, top: r.scrollTop, left: r.scrollLeft }), t != n);
      r = Ze(r)
    );
    return e;
  }
  function mn(t, e) {
    for (let n = 0; n < t.length; n++) {
      const r = t[n];
      const o = r.dom;
      const i = r.top;
      const s = r.left;
      o.scrollTop != i + e && (o.scrollTop = i + e),
        o.scrollLeft != s && (o.scrollLeft = s);
    }
  }
  let vn = null;
  function gn(t, e) {
    for (
      var n, r, o = 2e8, i = 0, s = e.top, a = e.top, c = t.firstChild, l = 0;
      c;
      c = c.nextSibling, l++
    ) {
      let p = void 0;
      if (c.nodeType == 1) p = c.getClientRects();
      else {
        if (3 != c.nodeType) continue;
        p = en(c).getClientRects();
      }
      for (let h = 0; h < p.length; h++) {
        const u = p[h];
        if (u.top <= s && u.bottom >= a) {
          (s = Math.max(u.bottom, s)), (a = Math.min(u.top, a));
          const f =
            u.left > e.left
              ? u.left - e.left
              : u.right < e.left
              ? e.left - u.right
              : 0;
          if (f < o) {
            (n = c),
              (o = f),
              (r =
                f && n.nodeType == 3
                  ? { left: u.right < e.left ? u.right : u.left, top: e.top }
                  : e),
              c.nodeType == 1 &&
                f &&
                (i = l + (e.left >= (u.left + u.right) / 2 ? 1 : 0));
            continue;
          }
        }
        !n &&
          ((e.left >= u.right && e.top >= u.top) ||
            (e.left >= u.left && e.top >= u.bottom)) &&
          (i = l + 1);
      }
    }
    return n && n.nodeType == 3
      ? (function (t, e) {
          for (
            let n = t.nodeValue.length, r = document.createRange(), o = 0;
            o < n;
            o++
          ) {
            r.setEnd(t, o + 1), r.setStart(t, o);
            const i = kn(r, 1);
            if (i.top != i.bottom && yn(e, i))
              return {
                node: t,
                offset: o + (e.left >= (i.left + i.right) / 2 ? 1 : 0),
              };
          }
          return { node: t, offset: 0 };
        })(n, r)
      : !n || (o && n.nodeType == 1)
      ? { node: t, offset: i }
      : gn(n, r);
  }
  function yn(t, e) {
    return (
      t.left >= e.left - 1 &&
      t.left <= e.right + 1 &&
      t.top >= e.top - 1 &&
      t.top <= e.bottom + 1
    );
  }
  function wn(t, e, n) {
    const r = t.childNodes.length;
    if (r && n.top < n.bottom)
      for (
        let o = Math.max(
            0,
            Math.min(
              r - 1,
              Math.floor((r * (e.top - n.top)) / (n.bottom - n.top)) - 2,
            ),
          ),
          i = o;
        ;

      ) {
        const s = t.childNodes[i];
        if (s.nodeType == 1)
          for (let a = s.getClientRects(), c = 0; c < a.length; c++) {
            const l = a[c];
            if (yn(e, l)) return wn(s, e, l);
          }
        if ((i = (i + 1) % r) == o) break;
      }
    return t;
  }
  function bn(t, e) {
    let n;
    let r;
    let o;
    const i = t.dom.ownerDocument;
    let s = 0;
    if (i.caretPositionFromPoint)
      try {
        const a = i.caretPositionFromPoint(e.left, e.top);
        a && ((o = (n = a).offsetNode), (s = n.offset));
      } catch (t) {}
    if (!o && i.caretRangeFromPoint) {
      const c = i.caretRangeFromPoint(e.left, e.top);
      c && ((o = (r = c).startContainer), (s = r.startOffset));
    }
    let l;
    let p = (t.root.elementFromPoint ? t.root : i).elementFromPoint(
      e.left,
      e.top,
    );
    if (!p || !t.dom.contains(1 != p.nodeType ? p.parentNode : p)) {
      const h = t.dom.getBoundingClientRect();
      if (!yn(e, h)) return null;
      if (!(p = wn(t.dom, e, h))) return null;
    }
    if (Ke) for (let u = p; o && u; u = Ze(u)) u.draggable && (o = void 0);
    if (
      ((p = (function (t, e) {
        const n = t.parentNode;
        return n &&
          /^li$/i.test(n.nodeName) &&
          e.left < t.getBoundingClientRect().left
          ? n
          : t;
      })(p, e)),
      o)
    ) {
      if (
        Le &&
        o.nodeType == 1 &&
        (s = Math.min(s, o.childNodes.length)) < o.childNodes.length
      ) {
        let f;
        const d = o.childNodes[s];
        d.nodeName == 'IMG' &&
          (f = d.getBoundingClientRect()).right <= e.left &&
          f.bottom > e.top &&
          s++;
      }
      o == t.dom &&
      s == o.childNodes.length - 1 &&
      o.lastChild.nodeType == 1 &&
      e.top > o.lastChild.getBoundingClientRect().bottom
        ? (l = t.state.doc.content.size)
        : (0 != s && o.nodeType == 1 && o.childNodes[s - 1].nodeName == 'BR') ||
          (l = (function (t, e, n, r) {
            for (var o = -1, i = e; i != t.dom; ) {
              const s = t.docView.nearestDesc(i, !0);
              if (!s) return null;
              if (s.node.isBlock && s.parent) {
                const a = s.dom.getBoundingClientRect();
                if (a.left > r.left || a.top > r.top) o = s.posBefore;
                else {
                  if (!(a.right < r.left || a.bottom < r.top)) break;
                  o = s.posAfter;
                }
              }
              i = s.dom.parentNode;
            }
            return o > -1 ? o : t.docView.posFromDOM(e, n, 1);
          })(t, o, s, e));
    }
    l == null &&
      (l = (function (t, e, n) {
        const r = gn(e, n);
        const o = r.node;
        const i = r.offset;
        let s = -1;
        if (o.nodeType == 1 && !o.firstChild) {
          const a = o.getBoundingClientRect();
          s = a.left != a.right && n.left > (a.left + a.right) / 2 ? 1 : -1;
        }
        return t.docView.posFromDOM(o, i, s);
      })(t, p, e));
    const m = t.docView.nearestDesc(p, !0);
    return { pos: l, inside: m ? m.posAtStart - m.border : -1 };
  }
  function kn(t, e) {
    const n = t.getClientRects();
    return n.length ? n[e < 0 ? 0 : n.length - 1] : t.getBoundingClientRect();
  }
  const xn = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  function Sn(t, e, n) {
    const r = t.docView.domFromPos(e, n < 0 ? -1 : 1);
    const o = r.node;
    const i = r.offset;
    const s = r.atom;
    const a = Qe || Le;
    if (o.nodeType == 3) {
      if (
        !a ||
        (!xn.test(o.nodeValue) && (n < 0 ? i : i != o.nodeValue.length))
      ) {
        let c = i;
        let l = i;
        let p = n < 0 ? 1 : -1;
        return (
          n < 0 && !i
            ? (l++, (p = -1))
            : n >= 0 && i == o.nodeValue.length
            ? (c--, (p = 1))
            : n < 0
            ? c--
            : l++,
          Mn(kn(en(o, c, l), 1), p < 0)
        );
      }
      const h = kn(en(o, i, i), n);
      if (Le && i && /\s/.test(o.nodeValue[i - 1]) && i < o.nodeValue.length) {
        const u = kn(en(o, i - 1, i - 1), -1);
        if (u.top == h.top) {
          const f = kn(en(o, i, i + 1), -1);
          if (f.top != h.top) return Mn(f, f.left < u.left);
        }
      }
      return h;
    }
    if (!t.state.doc.resolve(e - (s || 0)).parent.inlineContent) {
      if (s == null && i && (n < 0 || i == sn(o))) {
        const d = o.childNodes[i - 1];
        if (d.nodeType == 1) return Cn(d.getBoundingClientRect(), !1);
      }
      if (s == null && i < sn(o)) {
        const m = o.childNodes[i];
        if (m.nodeType == 1) return Cn(m.getBoundingClientRect(), !0);
      }
      return Cn(o.getBoundingClientRect(), n >= 0);
    }
    if (s == null && i && (n < 0 || i == sn(o))) {
      const v = o.childNodes[i - 1];
      const g =
        v.nodeType == 3
          ? en(v, sn(v) - (a ? 0 : 1))
          : 1 != v.nodeType || (v.nodeName == 'BR' && v.nextSibling)
          ? null
          : v;
      if (g) return Mn(kn(g, 1), !1);
    }
    if (s == null && i < sn(o)) {
      for (
        var y = o.childNodes[i];
        y.pmViewDesc && y.pmViewDesc.ignoreForCoords;

      )
        y = y.nextSibling;
      const w = y
        ? y.nodeType == 3
          ? en(y, 0, a ? 0 : 1)
          : y.nodeType == 1
          ? y
          : null
        : null;
      if (w) return Mn(kn(w, -1), !0);
    }
    return Mn(kn(o.nodeType == 3 ? en(o) : o, -n), n >= 0);
  }
  function Mn(t, e) {
    if (t.width == 0) return t;
    const n = e ? t.left : t.right;
    return { top: t.top, bottom: t.bottom, left: n, right: n };
  }
  function Cn(t, e) {
    if (t.height == 0) return t;
    const n = e ? t.top : t.bottom;
    return { top: n, bottom: n, left: t.left, right: t.right };
  }
  function On(t, e, n) {
    const r = t.state;
    const o = t.root.activeElement;
    r != e && t.updateState(e), o != t.dom && t.focus();
    try {
      return n();
    } finally {
      r != e && t.updateState(r), o != t.dom && o && o.focus();
    }
  }
  const Nn = /[\u0590-\u08ac]/;
  let Dn = null;
  let Tn = null;
  let An = !1;
  function En(t, e, n) {
    return Dn == e && Tn == n
      ? An
      : ((Dn = e),
        (Tn = n),
        (An =
          n == 'up' || n == 'down'
            ? (function (t, e, n) {
                const r = e.selection;
                const o = n == 'up' ? r.$from : r.$to;
                return On(t, e, function () {
                  for (
                    var e = t.docView.domFromPos(
                      o.pos,
                      n == 'up' ? -1 : 1,
                    ).node;
                    ;

                  ) {
                    const r = t.docView.nearestDesc(e, !0);
                    if (!r) break;
                    if (r.node.isBlock) {
                      e = r.dom;
                      break;
                    }
                    e = r.dom.parentNode;
                  }
                  for (
                    let i = Sn(t, o.pos, 1), s = e.firstChild;
                    s;
                    s = s.nextSibling
                  ) {
                    let a = void 0;
                    if (s.nodeType == 1) a = s.getClientRects();
                    else {
                      if (3 != s.nodeType) continue;
                      a = en(s, 0, s.nodeValue.length).getClientRects();
                    }
                    for (let c = 0; c < a.length; c++) {
                      const l = a[c];
                      if (
                        l.bottom > l.top + 1 &&
                        (n == 'up'
                          ? i.top - l.top > 2 * (l.bottom - i.top)
                          : l.bottom - i.bottom > 2 * (i.bottom - l.top))
                      )
                        return !1;
                    }
                  }
                  return !0;
                });
              })(t, e, n)
            : (function (t, e, n) {
                const r = e.selection.$head;
                if (!r.parent.isTextblock) return !1;
                const o = r.parentOffset;
                const i = !o;
                const s = o == r.parent.content.size;
                const a = t.domSelection();
                return Nn.test(r.parent.textContent) && a.modify
                  ? On(t, e, function () {
                      const e = a.getRangeAt(0);
                      const o = a.focusNode;
                      const i = a.focusOffset;
                      const s = a.caretBidiLevel;
                      a.modify('move', n, 'character');
                      const c =
                        !(
                          r.depth ? t.docView.domAfterPos(r.before()) : t.dom
                        ).contains(
                          a.focusNode.nodeType == 1
                            ? a.focusNode
                            : a.focusNode.parentNode,
                        ) ||
                        (o == a.focusNode && i == a.focusOffset);
                      return (
                        a.removeAllRanges(),
                        a.addRange(e),
                        null != s && (a.caretBidiLevel = s),
                        c
                      );
                    })
                  : n == 'left' || n == 'backward'
                  ? i
                  : s;
              })(t, e, n)));
  }
  const In = function (t, e, n, r) {
    (this.parent = t),
      (this.children = e),
      (this.dom = n),
      (this.contentDOM = r),
      (this.dirty = 0),
      (n.pmViewDesc = this);
  };
  const Rn = {
    size: { configurable: !0 },
    border: { configurable: !0 },
    posBefore: { configurable: !0 },
    posAtStart: { configurable: !0 },
    posAfter: { configurable: !0 },
    posAtEnd: { configurable: !0 },
    contentLost: { configurable: !0 },
    domAtom: { configurable: !0 },
    ignoreForCoords: { configurable: !0 },
  };
  (In.prototype.matchesWidget = function (t) {
    return !1;
  }),
    (In.prototype.matchesMark = function (t) {
      return !1;
    }),
    (In.prototype.matchesNode = function (t, e, n) {
      return !1;
    }),
    (In.prototype.matchesHack = function (t) {
      return !1;
    }),
    (In.prototype.parseRule = function () {
      return null;
    }),
    (In.prototype.stopEvent = function (t) {
      return !1;
    }),
    (Rn.size.get = function () {
      for (var t = 0, e = 0; e < this.children.length; e++)
        t += this.children[e].size;
      return t;
    }),
    (Rn.border.get = function () {
      return 0;
    }),
    (In.prototype.destroy = function () {
      (this.parent = void 0),
        this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
      for (let t = 0; t < this.children.length; t++) this.children[t].destroy();
    }),
    (In.prototype.posBeforeChild = function (t) {
      for (let e = 0, n = this.posAtStart; ; e++) {
        const r = this.children[e];
        if (r == t) return n;
        n += r.size;
      }
    }),
    (Rn.posBefore.get = function () {
      return this.parent.posBeforeChild(this);
    }),
    (Rn.posAtStart.get = function () {
      return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
    }),
    (Rn.posAfter.get = function () {
      return this.posBefore + this.size;
    }),
    (Rn.posAtEnd.get = function () {
      return this.posAtStart + this.size - 2 * this.border;
    }),
    (In.prototype.localPosFromDOM = function (t, e, n) {
      if (
        this.contentDOM &&
        this.contentDOM.contains(t.nodeType == 1 ? t : t.parentNode)
      ) {
        if (n < 0) {
          let r;
          let o;
          if (t == this.contentDOM) r = t.childNodes[e - 1];
          else {
            for (; t.parentNode != this.contentDOM; ) t = t.parentNode;
            r = t.previousSibling;
          }
          for (; r && (!(o = r.pmViewDesc) || o.parent != this); )
            r = r.previousSibling;
          return r ? this.posBeforeChild(o) + o.size : this.posAtStart;
        }
        let i;
        let s;
        if (t == this.contentDOM) i = t.childNodes[e];
        else {
          for (; t.parentNode != this.contentDOM; ) t = t.parentNode;
          i = t.nextSibling;
        }
        for (; i && (!(s = i.pmViewDesc) || s.parent != this); )
          i = i.nextSibling;
        return i ? this.posBeforeChild(s) : this.posAtEnd;
      }
      let a;
      if (t == this.dom && this.contentDOM) a = e > Ye(this.contentDOM);
      else if (
        this.contentDOM &&
        this.contentDOM != this.dom &&
        this.dom.contains(this.contentDOM)
      )
        a = 2 & t.compareDocumentPosition(this.contentDOM);
      else if (this.dom.firstChild) {
        if (e == 0)
          for (let c = t; ; c = c.parentNode) {
            if (c == this.dom) {
              a = !1;
              break;
            }
            if (c.previousSibling) break;
          }
        if (a == null && e == t.childNodes.length)
          for (let l = t; ; l = l.parentNode) {
            if (l == this.dom) {
              a = !0;
              break;
            }
            if (l.nextSibling) break;
          }
      }
      return (a == null ? n > 0 : a) ? this.posAtEnd : this.posAtStart;
    }),
    (In.prototype.nearestDesc = function (t, e) {
      void 0 === e && (e = !1);
      for (let n = !0, r = t; r; r = r.parentNode) {
        const o = this.getDesc(r);
        let i = void 0;
        if (o && (!e || o.node)) {
          if (
            !n ||
            !(i = o.nodeDOM) ||
            (i.nodeType == 1
              ? i.contains(t.nodeType == 1 ? t : t.parentNode)
              : i == t)
          )
            return o;
          n = !1;
        }
      }
    }),
    (In.prototype.getDesc = function (t) {
      for (let e = t.pmViewDesc, n = e; n; n = n.parent)
        if (n == this) return e;
    }),
    (In.prototype.posFromDOM = function (t, e, n) {
      for (let r = t; r; r = r.parentNode) {
        const o = this.getDesc(r);
        if (o) return o.localPosFromDOM(t, e, n);
      }
      return -1;
    }),
    (In.prototype.descAt = function (t) {
      for (let e = 0, n = 0; e < this.children.length; e++) {
        let r = this.children[e];
        const o = n + r.size;
        if (n == t && o != n) {
          for (; !r.border && r.children.length; ) r = r.children[0];
          return r;
        }
        if (t < o) return r.descAt(t - n - r.border);
        n = o;
      }
    }),
    (In.prototype.domFromPos = function (t, e) {
      if (!this.contentDOM) return { node: this.dom, offset: 0, atom: t + 1 };
      for (var n = 0, r = 0, o = 0; n < this.children.length; n++) {
        const i = this.children[n];
        const s = o + i.size;
        if (s > t || i instanceof $n) {
          r = t - o;
          break;
        }
        o = s;
      }
      if (r) return this.children[n].domFromPos(r - this.children[n].border, e);
      for (
        let a = void 0;
        n && !(a = this.children[n - 1]).size && a instanceof zn && a.side >= 0;
        n--
      );
      if (e <= 0) {
        for (
          var c, l = !0;
          (c = n ? this.children[n - 1] : null) &&
          c.dom.parentNode != this.contentDOM;
          n--, l = !1
        );
        return c && e && l && !c.border && !c.domAtom
          ? c.domFromPos(c.size, e)
          : { node: this.contentDOM, offset: c ? Ye(c.dom) + 1 : 0 };
      }
      for (
        var p, h = !0;
        (p = n < this.children.length ? this.children[n] : null) &&
        p.dom.parentNode != this.contentDOM;
        n++, h = !1
      );
      return p && h && !p.border && !p.domAtom
        ? p.domFromPos(0, e)
        : {
            node: this.contentDOM,
            offset: p ? Ye(p.dom) : this.contentDOM.childNodes.length,
          };
    }),
    (In.prototype.parseRange = function (t, e, n) {
      if ((void 0 === n && (n = 0), this.children.length == 0))
        return {
          node: this.contentDOM,
          from: t,
          to: e,
          fromOffset: 0,
          toOffset: this.contentDOM.childNodes.length,
        };
      for (var r = -1, o = -1, i = n, s = 0; ; s++) {
        const a = this.children[s];
        const c = i + a.size;
        if (r == -1 && t <= c) {
          const l = i + a.border;
          if (
            t >= l &&
            e <= c - a.border &&
            a.node &&
            a.contentDOM &&
            this.contentDOM.contains(a.contentDOM)
          )
            return a.parseRange(t, e, l);
          t = i;
          for (let p = s; p > 0; p--) {
            const h = this.children[p - 1];
            if (
              h.size &&
              h.dom.parentNode == this.contentDOM &&
              !h.emptyChildAt(1)
            ) {
              r = Ye(h.dom) + 1;
              break;
            }
            t -= h.size;
          }
          r == -1 && (r = 0);
        }
        if (r > -1 && (c > e || s == this.children.length - 1)) {
          e = c;
          for (let u = s + 1; u < this.children.length; u++) {
            const f = this.children[u];
            if (
              f.size &&
              f.dom.parentNode == this.contentDOM &&
              !f.emptyChildAt(-1)
            ) {
              o = Ye(f.dom);
              break;
            }
            e += f.size;
          }
          o == -1 && (o = this.contentDOM.childNodes.length);
          break;
        }
        i = c;
      }
      return {
        node: this.contentDOM,
        from: t,
        to: e,
        fromOffset: r,
        toOffset: o,
      };
    }),
    (In.prototype.emptyChildAt = function (t) {
      if (this.border || !this.contentDOM || !this.children.length) return !1;
      const e = this.children[t < 0 ? 0 : this.children.length - 1];
      return e.size == 0 || e.emptyChildAt(t);
    }),
    (In.prototype.domAfterPos = function (t) {
      const e = this.domFromPos(t, 0);
      const n = e.node;
      const r = e.offset;
      if (1 != n.nodeType || r == n.childNodes.length)
        throw new RangeError('No node after pos ' + t);
      return n.childNodes[r];
    }),
    (In.prototype.setSelection = function (t, e, n, r) {
      void 0 === r && (r = !1);
      for (
        let o = Math.min(t, e), i = Math.max(t, e), s = 0, a = 0;
        s < this.children.length;
        s++
      ) {
        const c = this.children[s];
        const l = a + c.size;
        if (o > a && i < l)
          return c.setSelection(t - a - c.border, e - a - c.border, n, r);
        a = l;
      }
      let p = this.domFromPos(t, t ? -1 : 1);
      let h = e == t ? p : this.domFromPos(e, e ? -1 : 1);
      const u = n.getSelection();
      let f = !1;
      if ((Le || Ke) && t == e) {
        const d = p.node;
        const m = p.offset;
        if (d.nodeType == 3) {
          if (
            (f = !(!m || '\n' != d.nodeValue[m - 1])) &&
            m == d.nodeValue.length
          )
            for (let v = d, g = void 0; v; v = v.parentNode) {
              if ((g = v.nextSibling)) {
                g.nodeName == 'BR' &&
                  (p = h = { node: g.parentNode, offset: Ye(g) + 1 });
                break;
              }
              const y = v.pmViewDesc;
              if (y && y.node && y.node.isBlock) break;
            }
        } else {
          const w = d.childNodes[m - 1];
          f = w && (w.nodeName == 'BR' || w.contentEditable == 'false');
        }
      }
      if (
        Le &&
        u.focusNode &&
        u.focusNode != h.node &&
        u.focusNode.nodeType == 1
      ) {
        const b = u.focusNode.childNodes[u.focusOffset];
        b && b.contentEditable == 'false' && (r = !0);
      }
      if (
        r ||
        (f && Ke) ||
        !nn(p.node, p.offset, u.anchorNode, u.anchorOffset) ||
        !nn(h.node, h.offset, u.focusNode, u.focusOffset)
      ) {
        let k = !1;
        if ((u.extend || t == e) && !f) {
          u.collapse(p.node, p.offset);
          try {
            t != e && u.extend(h.node, h.offset), (k = !0);
          } catch (t) {
            if (!(t instanceof DOMException)) throw t;
          }
        }
        if (!k) {
          if (t > e) {
            const x = p;
            (p = h), (h = x);
          }
          const S = document.createRange();
          S.setEnd(h.node, h.offset),
            S.setStart(p.node, p.offset),
            u.removeAllRanges(),
            u.addRange(S);
        }
      }
    }),
    (In.prototype.ignoreMutation = function (t) {
      return !this.contentDOM && 'selection' != t.type;
    }),
    (Rn.contentLost.get = function () {
      return (
        this.contentDOM &&
        this.contentDOM != this.dom &&
        !this.dom.contains(this.contentDOM)
      );
    }),
    (In.prototype.markDirty = function (t, e) {
      for (let n = 0, r = 0; r < this.children.length; r++) {
        const o = this.children[r];
        const i = n + o.size;
        if (n == i ? t <= i && e >= n : t < i && e > n) {
          const s = n + o.border;
          const a = i - o.border;
          if (t >= s && e <= a)
            return (
              (this.dirty = t == n || e == i ? 2 : 1),
              void (t != s ||
              e != a ||
              (!o.contentLost && o.dom.parentNode == this.contentDOM)
                ? o.markDirty(t - s, e - s)
                : (o.dirty = 3))
            );
          o.dirty =
            o.dom != o.contentDOM ||
            o.dom.parentNode != this.contentDOM ||
            o.children.length
              ? 3
              : 2;
        }
        n = i;
      }
      this.dirty = 2;
    }),
    (In.prototype.markParentsDirty = function () {
      for (let t = 1, e = this.parent; e; e = e.parent, t++) {
        const n = t == 1 ? 2 : 1;
        e.dirty < n && (e.dirty = n);
      }
    }),
    (Rn.domAtom.get = function () {
      return !1;
    }),
    (Rn.ignoreForCoords.get = function () {
      return !1;
    }),
    Object.defineProperties(In.prototype, Rn);
  var zn = (function (t) {
    function e(e, n, r, o) {
      let i;
      let s = n.type.toDOM;
      if (
        (typeof s === 'function' &&
          (s = s(r, function () {
            return i ? (i.parent ? i.parent.posBeforeChild(i) : void 0) : o;
          })),
        !n.type.spec.raw)
      ) {
        if (1 != s.nodeType) {
          const a = document.createElement('span');
          a.appendChild(s), (s = a);
        }
        (s.contentEditable = 'false'), s.classList.add('ProseMirror-widget');
      }
      t.call(this, e, [], s, null),
        (this.widget = n),
        (this.widget = n),
        (i = this);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = { domAtom: { configurable: !0 }, side: { configurable: !0 } };
    return (
      (e.prototype.matchesWidget = function (t) {
        return this.dirty == 0 && t.type.eq(this.widget.type);
      }),
      (e.prototype.parseRule = function () {
        return { ignore: !0 };
      }),
      (e.prototype.stopEvent = function (t) {
        const e = this.widget.spec.stopEvent;
        return !!e && e(t);
      }),
      (e.prototype.ignoreMutation = function (t) {
        return 'selection' != t.type || this.widget.spec.ignoreSelection;
      }),
      (e.prototype.destroy = function () {
        this.widget.type.destroy(this.dom), t.prototype.destroy.call(this);
      }),
      (n.domAtom.get = function () {
        return !0;
      }),
      (n.side.get = function () {
        return this.widget.type.side;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(In);
  const Pn = (function (t) {
    function e(e, n, r, o) {
      t.call(this, e, [], n, null), (this.textDOM = r), (this.text = o);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = { size: { configurable: !0 } };
    return (
      (n.size.get = function () {
        return this.text.length;
      }),
      (e.prototype.localPosFromDOM = function (t, e) {
        return t != this.textDOM
          ? this.posAtStart + (e ? this.size : 0)
          : this.posAtStart + e;
      }),
      (e.prototype.domFromPos = function (t) {
        return { node: this.textDOM, offset: t };
      }),
      (e.prototype.ignoreMutation = function (t) {
        return t.type === 'characterData' && t.target.nodeValue == t.oldValue;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(In);
  const Bn = (function (t) {
    function e(e, n, r, o) {
      t.call(this, e, [], r, o), (this.mark = n);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.create = function (t, n, r, o) {
        const i = o.nodeViews[n.type.name];
        let s = i && i(n, o, r);
        return (
          (s && s.dom) ||
            (s = ft.renderSpec(document, n.type.spec.toDOM(n, r))),
          new e(t, n, s.dom, s.contentDOM || s.dom)
        );
      }),
      (e.prototype.parseRule = function () {
        return 3 & this.dirty || this.mark.type.spec.reparseInView
          ? null
          : {
              mark: this.mark.type.name,
              attrs: this.mark.attrs,
              contentElement: this.contentDOM || void 0,
            };
      }),
      (e.prototype.matchesMark = function (t) {
        return 3 != this.dirty && this.mark.eq(t);
      }),
      (e.prototype.markDirty = function (e, n) {
        if ((t.prototype.markDirty.call(this, e, n), 0 != this.dirty)) {
          for (var r = this.parent; !r.node; ) r = r.parent;
          r.dirty < this.dirty && (r.dirty = this.dirty), (this.dirty = 0);
        }
      }),
      (e.prototype.slice = function (t, n, r) {
        const o = e.create(this.parent, this.mark, !0, r);
        let i = this.children;
        const s = this.size;
        n < s && (i = Zn(i, n, s, r)), t > 0 && (i = Zn(i, 0, t, r));
        for (let a = 0; a < i.length; a++) i[a].parent = o;
        return (o.children = i), o;
      }),
      e
    );
  })(In);
  const _n = (function (t) {
    function e(e, n, r, o, i, s, a, c, l) {
      t.call(this, e, [], i, s),
        (this.node = n),
        (this.outerDeco = r),
        (this.innerDeco = o),
        (this.nodeDOM = a),
        s && this.updateChildren(c, l);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = {
      size: { configurable: !0 },
      border: { configurable: !0 },
      domAtom: { configurable: !0 },
    };
    return (
      (e.create = function (t, n, r, o, i, s) {
        let a;
        let c;
        const l = i.nodeViews[n.type.name];
        const p =
          l &&
          l(
            n,
            i,
            function () {
              return c ? (c.parent ? c.parent.posBeforeChild(c) : void 0) : s;
            },
            r,
            o,
          );
        let h = p && p.dom;
        let u = p && p.contentDOM;
        if (n.isText)
          if (h) {
            if (3 != h.nodeType)
              throw new RangeError('Text must be rendered as a DOM text node');
          } else h = document.createTextNode(n.text);
        else
          h ||
            ((h = (a = ft.renderSpec(document, n.type.spec.toDOM(n))).dom),
            (u = a.contentDOM));
        u ||
          n.isText ||
          h.nodeName == 'BR' ||
          (h.hasAttribute('contenteditable') || (h.contentEditable = 'false'),
          n.type.spec.draggable && (h.draggable = !0));
        const f = h;
        return (
          (h = Un(h, r, n)),
          p
            ? (c = new qn(t, n, r, o, h, u || null, f, p, i, s + 1))
            : n.isText
            ? new Fn(t, n, r, o, h, f, i)
            : new e(t, n, r, o, h, u || null, f, i, s + 1)
        );
      }),
      (e.prototype.parseRule = function () {
        const t = this;
        if (this.node.type.spec.reparseInView) return null;
        const e = { node: this.node.type.name, attrs: this.node.attrs };
        if (
          (this.node.type.whitespace == 'pre' &&
            (e.preserveWhitespace = 'full'),
          this.contentDOM)
        )
          if (this.contentLost) {
            for (let n = this.children.length - 1; n >= 0; n--) {
              const o = this.children[n];
              if (this.dom.contains(o.dom.parentNode)) {
                e.contentElement = o.dom.parentNode;
                break;
              }
            }
            e.contentElement ||
              (e.getContent = function () {
                return r.empty;
              });
          } else e.contentElement = this.contentDOM;
        else
          e.getContent = function () {
            return t.node.content;
          };
        return e;
      }),
      (e.prototype.matchesNode = function (t, e, n) {
        return (
          this.dirty == 0 &&
          t.eq(this.node) &&
          Gn(e, this.outerDeco) &&
          n.eq(this.innerDeco)
        );
      }),
      (n.size.get = function () {
        return this.node.nodeSize;
      }),
      (n.border.get = function () {
        return this.node.isLeaf ? 0 : 1;
      }),
      (e.prototype.updateChildren = function (t, e) {
        const n = this;
        const r = this.node.inlineContent;
        let o = e;
        const i = t.composing ? this.localCompositionInfo(t, e) : null;
        const s = i && i.pos > -1 ? i : null;
        const a = i && i.pos < 0;
        const l = new Xn(this, s && s.node, t);
        !(function (t, e, n, r) {
          const o = e.locals(t);
          let i = 0;
          if (o.length == 0) {
            for (let s = 0; s < t.childCount; s++) {
              const a = t.child(s);
              r(a, o, e.forChild(i, a), s), (i += a.nodeSize);
            }
            return;
          }
          for (let c = 0, l = [], p = null, h = 0; ; ) {
            if (c < o.length && o[c].to == i) {
              for (var u = o[c++], f = void 0; c < o.length && o[c].to == i; )
                (f || (f = [u])).push(o[c++]);
              if (f) {
                f.sort(Yn);
                for (let d = 0; d < f.length; d++) n(f[d], h, !!p);
              } else n(u, h, !!p);
            }
            let m = void 0;
            let v = void 0;
            if (p) (v = -1), (m = p), (p = null);
            else {
              if (!(h < t.childCount)) break;
              (v = h), (m = t.child(h++));
            }
            for (let g = 0; g < l.length; g++) l[g].to <= i && l.splice(g--, 1);
            for (; c < o.length && o[c].from <= i && o[c].to > i; )
              l.push(o[c++]);
            let y = i + m.nodeSize;
            if (m.isText) {
              let w = y;
              c < o.length && o[c].from < w && (w = o[c].from);
              for (let b = 0; b < l.length; b++) l[b].to < w && (w = l[b].to);
              w < y &&
                ((p = m.cut(w - i)), (m = m.cut(0, w - i)), (y = w), (v = -1));
            }
            r(
              m,
              m.isInline && !m.isLeaf
                ? l.filter(function (t) {
                    return !t.inline;
                  })
                : l.slice(),
              e.forChild(i, m),
              v,
            ),
              (i = y);
          }
        })(
          this.node,
          this.innerDeco,
          function (e, i, s) {
            e.spec.marks
              ? l.syncToMarks(e.spec.marks, r, t)
              : e.type.side >= 0 &&
                !s &&
                l.syncToMarks(
                  i == n.node.childCount ? c.none : n.node.child(i).marks,
                  r,
                  t,
                ),
              l.placeWidget(e, t, o);
          },
          function (e, n, s, c) {
            let p;
            l.syncToMarks(e.marks, r, t),
              l.findNodeMatch(e, n, s, c) ||
                (a &&
                  t.state.selection.from > o &&
                  t.state.selection.to < o + e.nodeSize &&
                  (p = l.findIndexWithChild(i.node)) > -1 &&
                  l.updateNodeAt(e, n, s, p, t)) ||
                l.updateNextNode(e, n, s, t, c) ||
                l.addNode(e, n, s, t, o),
              (o += e.nodeSize);
          },
        ),
          l.syncToMarks([], r, t),
          this.node.isTextblock && l.addTextblockHacks(),
          l.destroyRest(),
          (l.changed || this.dirty == 2) &&
            (s && this.protectLocalComposition(t, s),
            Ln(this.contentDOM, this.children, t),
            He &&
              (function (t) {
                if (t.nodeName == 'UL' || t.nodeName == 'OL') {
                  const e = t.style.cssText;
                  (t.style.cssText = e + '; list-style: square !important'),
                    window.getComputedStyle(t).listStyle,
                    (t.style.cssText = e);
                }
              })(this.dom));
      }),
      (e.prototype.localCompositionInfo = function (t, e) {
        const n = t.state.selection;
        const r = n.from;
        const o = n.to;
        if (
          !(t.state.selection instanceof fe) ||
          r < e ||
          o > e + this.node.content.size
        )
          return null;
        const i = t.domSelection();
        const s = (function (t, e) {
          for (;;) {
            if (t.nodeType == 3) return t;
            if (t.nodeType == 1 && e > 0) {
              if (t.childNodes.length > e && t.childNodes[e].nodeType == 3)
                return t.childNodes[e];
              e = sn((t = t.childNodes[e - 1]));
            } else {
              if (!(t.nodeType == 1 && e < t.childNodes.length)) return null;
              (t = t.childNodes[e]), (e = 0);
            }
          }
        })(i.focusNode, i.focusOffset);
        if (!s || !this.dom.contains(s.parentNode)) return null;
        if (this.node.inlineContent) {
          const a = s.nodeValue;
          const c = (function (t, e, n, r) {
            for (let o = 0, i = 0; o < t.childCount && i <= r; ) {
              const s = t.child(o++);
              const a = i;
              if (((i += s.nodeSize), s.isText)) {
                for (var c = s.text; o < t.childCount; ) {
                  const l = t.child(o++);
                  if (((i += l.nodeSize), !l.isText)) break;
                  c += l.text;
                }
                if (i >= n) {
                  const p = a < r ? c.lastIndexOf(e, r - a - 1) : -1;
                  if (p >= 0 && p + e.length + a >= n) return a + p;
                  if (
                    n == r &&
                    c.length >= r + e.length - a &&
                    c.slice(r - a, r - a + e.length) == e
                  )
                    return r;
                }
              }
            }
            return -1;
          })(this.node.content, a, r - e, o - e);
          return c < 0 ? null : { node: s, pos: c, text: a };
        }
        return { node: s, pos: -1, text: '' };
      }),
      (e.prototype.protectLocalComposition = function (t, e) {
        const n = e.node;
        const r = e.pos;
        const o = e.text;
        if (!this.getDesc(n)) {
          for (var i = n; i.parentNode != this.contentDOM; i = i.parentNode) {
            for (; i.previousSibling; )
              i.parentNode.removeChild(i.previousSibling);
            for (; i.nextSibling; ) i.parentNode.removeChild(i.nextSibling);
            i.pmViewDesc && (i.pmViewDesc = void 0);
          }
          const s = new Pn(this, i, n, o);
          t.input.compositionNodes.push(s),
            (this.children = Zn(this.children, r, r + o.length, t, s));
        }
      }),
      (e.prototype.update = function (t, e, n, r) {
        return (
          !(this.dirty == 3 || !t.sameMarkup(this.node)) &&
          (this.updateInner(t, e, n, r), !0)
        );
      }),
      (e.prototype.updateInner = function (t, e, n, r) {
        this.updateOuterDeco(e),
          (this.node = t),
          (this.innerDeco = n),
          this.contentDOM && this.updateChildren(r, this.posAtStart),
          (this.dirty = 0);
      }),
      (e.prototype.updateOuterDeco = function (t) {
        if (!Gn(t, this.outerDeco)) {
          const e = 1 != this.nodeDOM.nodeType;
          const n = this.dom;
          (this.dom = Kn(
            this.dom,
            this.nodeDOM,
            Wn(this.outerDeco, this.node, e),
            Wn(t, this.node, e),
          )),
            this.dom != n &&
              ((n.pmViewDesc = void 0), (this.dom.pmViewDesc = this)),
            (this.outerDeco = t);
        }
      }),
      (e.prototype.selectNode = function () {
        this.nodeDOM.nodeType == 1 &&
          this.nodeDOM.classList.add('ProseMirror-selectednode'),
          (!this.contentDOM && this.node.type.spec.draggable) ||
            (this.dom.draggable = !0);
      }),
      (e.prototype.deselectNode = function () {
        this.nodeDOM.nodeType == 1 &&
          this.nodeDOM.classList.remove('ProseMirror-selectednode'),
          (!this.contentDOM && this.node.type.spec.draggable) ||
            this.dom.removeAttribute('draggable');
      }),
      (n.domAtom.get = function () {
        return this.node.isAtom;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(In);
  function Vn(t, e, n, r, o) {
    return Un(r, e, t), new _n(void 0, t, e, n, r, r, r, o, 0);
  }
  var Fn = (function (t) {
    function e(e, n, r, o, i, s, a) {
      t.call(this, e, n, r, o, i, null, s, a, 0);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = { domAtom: { configurable: !0 } };
    return (
      (e.prototype.parseRule = function () {
        for (
          var t = this.nodeDOM.parentNode;
          t && t != this.dom && !t.pmIsDeco;

        )
          t = t.parentNode;
        return { skip: t || !0 };
      }),
      (e.prototype.update = function (t, e, n, r) {
        return (
          !(
            this.dirty == 3 ||
            (0 != this.dirty && !this.inParent()) ||
            !t.sameMarkup(this.node)
          ) &&
          (this.updateOuterDeco(e),
          (this.dirty == 0 && t.text == this.node.text) ||
            t.text == this.nodeDOM.nodeValue ||
            ((this.nodeDOM.nodeValue = t.text),
            r.trackWrites == this.nodeDOM && (r.trackWrites = null)),
          (this.node = t),
          (this.dirty = 0),
          !0)
        );
      }),
      (e.prototype.inParent = function () {
        for (
          let t = this.parent.contentDOM, e = this.nodeDOM;
          e;
          e = e.parentNode
        )
          if (e == t) return !0;
        return !1;
      }),
      (e.prototype.domFromPos = function (t) {
        return { node: this.nodeDOM, offset: t };
      }),
      (e.prototype.localPosFromDOM = function (e, n, r) {
        return e == this.nodeDOM
          ? this.posAtStart + Math.min(n, this.node.text.length)
          : t.prototype.localPosFromDOM.call(this, e, n, r);
      }),
      (e.prototype.ignoreMutation = function (t) {
        return 'characterData' != t.type && 'selection' != t.type;
      }),
      (e.prototype.slice = function (t, n, r) {
        const o = this.node.cut(t, n);
        const i = document.createTextNode(o.text);
        return new e(this.parent, o, this.outerDeco, this.innerDeco, i, i, r);
      }),
      (e.prototype.markDirty = function (e, n) {
        t.prototype.markDirty.call(this, e, n),
          this.dom == this.nodeDOM ||
            (0 != e && n != this.nodeDOM.nodeValue.length) ||
            (this.dirty = 3);
      }),
      (n.domAtom.get = function () {
        return !1;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(_n);
  var $n = (function (t) {
    function e() {
      t.apply(this, arguments);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = {
      domAtom: { configurable: !0 },
      ignoreForCoords: { configurable: !0 },
    };
    return (
      (e.prototype.parseRule = function () {
        return { ignore: !0 };
      }),
      (e.prototype.matchesHack = function (t) {
        return this.dirty == 0 && this.dom.nodeName == t;
      }),
      (n.domAtom.get = function () {
        return !0;
      }),
      (n.ignoreForCoords.get = function () {
        return this.dom.nodeName == 'IMG';
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(In);
  var qn = (function (t) {
    function e(e, n, r, o, i, s, a, c, l, p) {
      t.call(this, e, n, r, o, i, s, a, l, p), (this.spec = c);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.update = function (e, n, r, o) {
        if (this.dirty == 3) return !1;
        if (this.spec.update) {
          const i = this.spec.update(e, n, r);
          return i && this.updateInner(e, n, r, o), i;
        }
        return (
          !(!this.contentDOM && !e.isLeaf) &&
          t.prototype.update.call(this, e, n, r, o)
        );
      }),
      (e.prototype.selectNode = function () {
        this.spec.selectNode
          ? this.spec.selectNode()
          : t.prototype.selectNode.call(this);
      }),
      (e.prototype.deselectNode = function () {
        this.spec.deselectNode
          ? this.spec.deselectNode()
          : t.prototype.deselectNode.call(this);
      }),
      (e.prototype.setSelection = function (e, n, r, o) {
        this.spec.setSelection
          ? this.spec.setSelection(e, n, r)
          : t.prototype.setSelection.call(this, e, n, r, o);
      }),
      (e.prototype.destroy = function () {
        this.spec.destroy && this.spec.destroy(),
          t.prototype.destroy.call(this);
      }),
      (e.prototype.stopEvent = function (t) {
        return !!this.spec.stopEvent && this.spec.stopEvent(t);
      }),
      (e.prototype.ignoreMutation = function (e) {
        return this.spec.ignoreMutation
          ? this.spec.ignoreMutation(e)
          : t.prototype.ignoreMutation.call(this, e);
      }),
      e
    );
  })(_n);
  function Ln(t, e, n) {
    for (var r = t.firstChild, o = !1, i = 0; i < e.length; i++) {
      const s = e[i];
      const a = s.dom;
      if (a.parentNode == t) {
        for (; a != r; ) (r = Qn(r)), (o = !0);
        r = r.nextSibling;
      } else (o = !0), t.insertBefore(a, r);
      if (s instanceof Bn) {
        const c = r ? r.previousSibling : t.lastChild;
        Ln(s.contentDOM, s.children, n), (r = c ? c.nextSibling : t.firstChild);
      }
    }
    for (; r; ) (r = Qn(r)), (o = !0);
    o && n.trackWrites == t && (n.trackWrites = null);
  }
  const jn = function (t) {
    t && (this.nodeName = t);
  };
  jn.prototype = Object.create(null);
  const Jn = [new jn()];
  function Wn(t, e, n) {
    if (t.length == 0) return Jn;
    for (var r = n ? Jn[0] : new jn(), o = [r], i = 0; i < t.length; i++) {
      const s = t[i].type.attrs;
      if (s)
        for (const a in (s.nodeName && o.push((r = new jn(s.nodeName))), s)) {
          const c = s[a];
          null != c &&
            (n &&
              o.length == 1 &&
              o.push((r = new jn(e.isInline ? 'span' : 'div'))),
            a == 'class'
              ? (r.class = (r.class ? r.class + ' ' : '') + c)
              : a == 'style'
              ? (r.style = (r.style ? r.style + ';' : '') + c)
              : 'nodeName' != a && (r[a] = c));
        }
    }
    return o;
  }
  function Kn(t, e, n, r) {
    if (n == Jn && r == Jn) return e;
    for (var o = e, i = 0; i < r.length; i++) {
      const s = r[i];
      let a = n[i];
      if (i) {
        let c = void 0;
        (a &&
          a.nodeName == s.nodeName &&
          o != t &&
          (c = o.parentNode) &&
          c.nodeName.toLowerCase() == s.nodeName) ||
          (((c = document.createElement(s.nodeName)).pmIsDeco = !0),
          c.appendChild(o),
          (a = Jn[0])),
          (o = c);
      }
      Hn(o, a || Jn[0], s);
    }
    return o;
  }
  function Hn(t, e, n) {
    for (const r in e)
      r == 'class' ||
        r == 'style' ||
        r == 'nodeName' ||
        r in n ||
        t.removeAttribute(r);
    for (const o in n)
      'class' != o &&
        'style' != o &&
        'nodeName' != o &&
        n[o] != e[o] &&
        t.setAttribute(o, n[o]);
    if (e.class != n.class) {
      for (
        var i = e.class ? e.class.split(' ').filter(Boolean) : [],
          s = n.class ? n.class.split(' ').filter(Boolean) : [],
          a = 0;
        a < i.length;
        a++
      )
        s.indexOf(i[a]) == -1 && t.classList.remove(i[a]);
      for (let c = 0; c < s.length; c++)
        i.indexOf(s[c]) == -1 && t.classList.add(s[c]);
      t.classList.length == 0 && t.removeAttribute('class');
    }
    if (e.style != n.style) {
      if (e.style)
        for (
          var l,
            p =
              /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g;
          (l = p.exec(e.style));

        )
          t.style.removeProperty(l[1]);
      n.style && (t.style.cssText += n.style);
    }
  }
  function Un(t, e, n) {
    return Kn(t, t, Jn, Wn(e, n, 1 != t.nodeType));
  }
  function Gn(t, e) {
    if (t.length != e.length) return !1;
    for (let n = 0; n < t.length; n++) if (!t[n].type.eq(e[n].type)) return !1;
    return !0;
  }
  function Qn(t) {
    const e = t.nextSibling;
    return t.parentNode.removeChild(t), e;
  }
  var Xn = function (t, e, n) {
    (this.lock = e),
      (this.view = n),
      (this.index = 0),
      (this.stack = []),
      (this.changed = !1),
      (this.top = t),
      (this.preMatch = (function (t, e) {
        let n = e;
        let r = n.children.length;
        let o = t.childCount;
        const i = new Map();
        const s = [];
        t: for (; o > 0; ) {
          for (var a = void 0; ; )
            if (r) {
              const c = n.children[r - 1];
              if (!(c instanceof Bn)) {
                (a = c), r--;
                break;
              }
              (n = c), (r = c.children.length);
            } else {
              if (n == e) break t;
              (r = n.parent.children.indexOf(n)), (n = n.parent);
            }
          const l = a.node;
          if (l) {
            if (l != t.child(o - 1)) break;
            --o, i.set(a, o), s.push(a);
          }
        }
        return { index: o, matched: i, matches: s.reverse() };
      })(t.node.content, t));
  };
  function Yn(t, e) {
    return t.type.side - e.type.side;
  }
  function Zn(t, e, n, r, o) {
    for (var i = [], s = 0, a = 0; s < t.length; s++) {
      const c = t[s];
      const l = a;
      const p = (a += c.size);
      l >= n || p <= e
        ? i.push(c)
        : (l < e && i.push(c.slice(0, e - l, r)),
          o && (i.push(o), (o = void 0)),
          p > n && i.push(c.slice(n - l, c.size, r)));
    }
    return i;
  }
  function tr(t, e) {
    void 0 === e && (e = null);
    const n = t.domSelection();
    const r = t.state.doc;
    if (!n.focusNode) return null;
    let o = t.docView.nearestDesc(n.focusNode);
    const i = o && o.size == 0;
    const s = t.docView.posFromDOM(n.focusNode, n.focusOffset, 1);
    if (s < 0) return null;
    let a;
    let c;
    const l = r.resolve(s);
    if (cn(n)) {
      for (a = l; o && !o.node; ) o = o.parent;
      const p = o.node;
      if (
        o &&
        p.isAtom &&
        me.isSelectable(p) &&
        o.parent &&
        (!p.isInline ||
          !(function (t, e, n) {
            for (let r = e == 0, o = e == sn(t); r || o; ) {
              if (t == n) return !0;
              const i = Ye(t);
              if (!(t = t.parentNode)) return !1;
              (r = r && i == 0), (o = o && i == sn(t));
            }
          })(n.focusNode, n.focusOffset, o.dom))
      ) {
        const h = o.posBefore;
        c = new me(s == h ? l : r.resolve(h));
      }
    } else {
      const u = t.docView.posFromDOM(n.anchorNode, n.anchorOffset, 1);
      if (u < 0) return null;
      a = r.resolve(u);
    }
    c ||
      (c = lr(
        t,
        a,
        l,
        e == 'pointer' || (t.state.selection.head < l.pos && !i) ? 1 : -1,
      ));
    return c;
  }
  function er(t) {
    return t.editable
      ? t.hasFocus()
      : hr(t) &&
          document.activeElement &&
          document.activeElement.contains(t.dom);
  }
  function nr(t, e) {
    void 0 === e && (e = !1);
    const n = t.state.selection;
    if ((ar(t, n), er(t))) {
      if (!e && t.input.mouseDown && t.input.mouseDown.allowDefault && Je) {
        const r = t.domSelection();
        const o = t.domObserver.currentSelection;
        if (
          r.anchorNode &&
          o.anchorNode &&
          nn(r.anchorNode, r.anchorOffset, o.anchorNode, o.anchorOffset)
        )
          return (
            (t.input.mouseDown.delayedSelectionSync = !0),
            void t.domObserver.setCurSelection()
          );
      }
      if ((t.domObserver.disconnectSelection(), t.cursorWrapper))
        !(function (t) {
          const e = t.domSelection();
          const n = document.createRange();
          const r = t.cursorWrapper.dom;
          const o = r.nodeName == 'IMG';
          o ? n.setEnd(r.parentNode, Ye(r) + 1) : n.setEnd(r, 0);
          n.collapse(!1),
            e.removeAllRanges(),
            e.addRange(n),
            !o &&
              !t.state.selection.visible &&
              $e &&
              qe <= 11 &&
              ((r.disabled = !0), (r.disabled = !1));
        })(t);
      else {
        let i;
        let s;
        const a = n.anchor;
        const c = n.head;
        !rr ||
          n instanceof fe ||
          (n.$from.parent.inlineContent || (i = or(t, n.from)),
          n.empty || n.$from.parent.inlineContent || (s = or(t, n.to))),
          t.docView.setSelection(a, c, t.root, e),
          rr && (i && sr(i), s && sr(s)),
          n.visible
            ? t.dom.classList.remove('ProseMirror-hideselection')
            : (t.dom.classList.add('ProseMirror-hideselection'),
              'onselectionchange' in document &&
                (function (t) {
                  const e = t.dom.ownerDocument;
                  e.removeEventListener(
                    'selectionchange',
                    t.input.hideSelectionGuard,
                  );
                  const n = t.domSelection();
                  const r = n.anchorNode;
                  const o = n.anchorOffset;
                  e.addEventListener(
                    'selectionchange',
                    (t.input.hideSelectionGuard = function () {
                      (n.anchorNode == r && n.anchorOffset == o) ||
                        (e.removeEventListener(
                          'selectionchange',
                          t.input.hideSelectionGuard,
                        ),
                        setTimeout(function () {
                          (er(t) && !t.state.selection.visible) ||
                            t.dom.classList.remove('ProseMirror-hideselection');
                        }, 20));
                    }),
                  );
                })(t));
      }
      t.domObserver.setCurSelection(), t.domObserver.connectSelection();
    }
  }
  (Xn.prototype.destroyBetween = function (t, e) {
    if (t != e) {
      for (let n = t; n < e; n++) this.top.children[n].destroy();
      this.top.children.splice(t, e - t), (this.changed = !0);
    }
  }),
    (Xn.prototype.destroyRest = function () {
      this.destroyBetween(this.index, this.top.children.length);
    }),
    (Xn.prototype.syncToMarks = function (t, e, n) {
      for (
        var r = 0, o = this.stack.length >> 1, i = Math.min(o, t.length);
        r < i &&
        (r == o - 1 ? this.top : this.stack[(r + 1) << 1]).matchesMark(t[r]) &&
        !1 !== t[r].type.spec.spanning;

      )
        r++;
      for (; r < o; )
        this.destroyRest(),
          (this.top.dirty = 0),
          (this.index = this.stack.pop()),
          (this.top = this.stack.pop()),
          o--;
      for (; o < t.length; ) {
        this.stack.push(this.top, this.index + 1);
        for (
          var s = -1, a = this.index;
          a < Math.min(this.index + 3, this.top.children.length);
          a++
        )
          if (this.top.children[a].matchesMark(t[o])) {
            s = a;
            break;
          }
        if (s > -1)
          s > this.index &&
            ((this.changed = !0), this.destroyBetween(this.index, s)),
            (this.top = this.top.children[this.index]);
        else {
          const c = Bn.create(this.top, t[o], e, n);
          this.top.children.splice(this.index, 0, c),
            (this.top = c),
            (this.changed = !0);
        }
        (this.index = 0), o++;
      }
    }),
    (Xn.prototype.findNodeMatch = function (t, e, n, r) {
      let o;
      let i = -1;
      if (
        r >= this.preMatch.index &&
        (o = this.preMatch.matches[r - this.preMatch.index]).parent ==
          this.top &&
        o.matchesNode(t, e, n)
      )
        i = this.top.children.indexOf(o, this.index);
      else
        for (
          let s = this.index, a = Math.min(this.top.children.length, s + 5);
          s < a;
          s++
        ) {
          const c = this.top.children[s];
          if (c.matchesNode(t, e, n) && !this.preMatch.matched.has(c)) {
            i = s;
            break;
          }
        }
      return !(i < 0) && (this.destroyBetween(this.index, i), this.index++, !0);
    }),
    (Xn.prototype.updateNodeAt = function (t, e, n, r, o) {
      const i = this.top.children[r];
      return (
        i.dirty == 3 && i.dom == i.contentDOM && (i.dirty = 2),
        !!i.update(t, e, n, o) &&
          (this.destroyBetween(this.index, r), this.index++, !0)
      );
    }),
    (Xn.prototype.findIndexWithChild = function (t) {
      for (;;) {
        const e = t.parentNode;
        if (!e) return -1;
        if (e == this.top.contentDOM) {
          const n = t.pmViewDesc;
          if (n)
            for (let r = this.index; r < this.top.children.length; r++)
              if (this.top.children[r] == n) return r;
          return -1;
        }
        t = e;
      }
    }),
    (Xn.prototype.updateNextNode = function (t, e, n, r, o) {
      for (let i = this.index; i < this.top.children.length; i++) {
        const s = this.top.children[i];
        if (s instanceof _n) {
          const a = this.preMatch.matched.get(s);
          if (null != a && a != o) return !1;
          const c = s.dom;
          if (
            !(
              this.lock &&
              (c == this.lock ||
                (c.nodeType == 1 && c.contains(this.lock.parentNode))) &&
              !(
                t.isText &&
                s.node &&
                s.node.isText &&
                s.nodeDOM.nodeValue == t.text &&
                3 != s.dirty &&
                Gn(e, s.outerDeco)
              )
            ) &&
            s.update(t, e, n, r)
          )
            return (
              this.destroyBetween(this.index, i),
              s.dom != c && (this.changed = !0),
              this.index++,
              !0
            );
          break;
        }
      }
      return !1;
    }),
    (Xn.prototype.addNode = function (t, e, n, r, o) {
      this.top.children.splice(
        this.index++,
        0,
        _n.create(this.top, t, e, n, r, o),
      ),
        (this.changed = !0);
    }),
    (Xn.prototype.placeWidget = function (t, e, n) {
      const r =
        this.index < this.top.children.length
          ? this.top.children[this.index]
          : null;
      if (
        !r ||
        !r.matchesWidget(t) ||
        (t != r.widget && r.widget.type.toDOM.parentNode)
      ) {
        const o = new zn(this.top, t, e, n);
        this.top.children.splice(this.index++, 0, o), (this.changed = !0);
      } else this.index++;
    }),
    (Xn.prototype.addTextblockHacks = function () {
      for (
        var t = this.top.children[this.index - 1], e = this.top;
        t instanceof Bn;

      )
        t = (e = t).children[e.children.length - 1];
      (!t ||
        !(t instanceof Fn) ||
        /\n$/.test(t.node.text) ||
        (this.view.requiresGeckoHackNode && /\s$/.test(t.node.text))) &&
        ((Ke || Je) &&
          t &&
          t.dom.contentEditable == 'false' &&
          this.addHackNode('IMG', e),
        this.addHackNode('BR', this.top));
    }),
    (Xn.prototype.addHackNode = function (t, e) {
      if (
        e == this.top &&
        this.index < e.children.length &&
        e.children[this.index].matchesHack(t)
      )
        this.index++;
      else {
        const n = document.createElement(t);
        t == 'IMG' && ((n.className = 'ProseMirror-separator'), (n.alt = '')),
          t == 'BR' && (n.className = 'ProseMirror-trailingBreak');
        const r = new $n(this.top, [], n, null);
        e != this.top
          ? e.children.push(r)
          : e.children.splice(this.index++, 0, r),
          (this.changed = !0);
      }
    });
  var rr = Ke || (Je && We < 63);
  function or(t, e) {
    const n = t.docView.domFromPos(e, 0);
    const r = n.node;
    const o = n.offset;
    const i = o < r.childNodes.length ? r.childNodes[o] : null;
    const s = o ? r.childNodes[o - 1] : null;
    if (Ke && i && i.contentEditable == 'false') return ir(i);
    if (
      !(
        (i && 'false' != i.contentEditable) ||
        (s && 'false' != s.contentEditable)
      )
    ) {
      if (i) return ir(i);
      if (s) return ir(s);
    }
  }
  function ir(t) {
    return (
      (t.contentEditable = 'true'),
      Ke && t.draggable && ((t.draggable = !1), (t.wasDraggable = !0)),
      t
    );
  }
  function sr(t) {
    (t.contentEditable = 'false'),
      t.wasDraggable && ((t.draggable = !0), (t.wasDraggable = null));
  }
  function ar(t, e) {
    if (e instanceof me) {
      const n = t.docView.descAt(e.from);
      n != t.lastSelectedViewDesc &&
        (cr(t), n && n.selectNode(), (t.lastSelectedViewDesc = n));
    } else cr(t);
  }
  function cr(t) {
    t.lastSelectedViewDesc &&
      (t.lastSelectedViewDesc.parent && t.lastSelectedViewDesc.deselectNode(),
      (t.lastSelectedViewDesc = void 0));
  }
  function lr(t, e, n, r) {
    return (
      t.someProp('createSelectionBetween', function (r) {
        return r(t, e, n);
      }) || fe.between(e, n, r)
    );
  }
  function pr(t) {
    return (!t.editable || t.root.activeElement == t.dom) && hr(t);
  }
  function hr(t) {
    const e = t.domSelection();
    if (!e.anchorNode) return !1;
    try {
      return (
        t.dom.contains(
          e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode,
        ) &&
        (t.editable ||
          t.dom.contains(
            e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode,
          ))
      );
    } catch (t) {
      return !1;
    }
  }
  function ur(t, e) {
    const n = t.selection;
    const r = n.$anchor;
    const o = n.$head;
    const i = e > 0 ? r.max(o) : r.min(o);
    const s = i.parent.inlineContent
      ? i.depth
        ? t.doc.resolve(e > 0 ? i.after() : i.before())
        : null
      : i;
    return s && ce.findFrom(s, e);
  }
  function fr(t, e) {
    return t.dispatch(t.state.tr.setSelection(e).scrollIntoView()), !0;
  }
  function dr(t, e, n) {
    const r = t.state.selection;
    if (!(r instanceof fe)) {
      if (r instanceof me && r.node.isInline)
        return fr(t, new fe(e > 0 ? r.$to : r.$from));
      const o = ur(t.state, e);
      return !!o && fr(t, o);
    }
    if (!r.empty || n.indexOf('s') > -1) return !1;
    if (t.endOfTextblock(e > 0 ? 'right' : 'left')) {
      const i = ur(t.state, e);
      return !!(i && i instanceof me) && fr(t, i);
    }
    if (!(Ue && n.indexOf('m') > -1)) {
      let s;
      const a = r.$head;
      const c = a.textOffset ? null : e < 0 ? a.nodeBefore : a.nodeAfter;
      if (!c || c.isText) return !1;
      const l = e < 0 ? a.pos - c.nodeSize : a.pos;
      return (
        !!(c.isAtom || ((s = t.docView.descAt(l)) && !s.contentDOM)) &&
        (me.isSelectable(c)
          ? fr(t, new me(e < 0 ? t.state.doc.resolve(a.pos - c.nodeSize) : a))
          : !!Qe &&
            fr(t, new fe(t.state.doc.resolve(e < 0 ? l : l + c.nodeSize))))
      );
    }
  }
  function mr(t) {
    return t.nodeType == 3 ? t.nodeValue.length : t.childNodes.length;
  }
  function vr(t) {
    const e = t.pmViewDesc;
    return e && e.size == 0 && (t.nextSibling || 'BR' != t.nodeName);
  }
  function gr(t) {
    const e = t.domSelection();
    let n = e.focusNode;
    let r = e.focusOffset;
    if (n) {
      let o;
      let i;
      let s = !1;
      for (
        Le && n.nodeType == 1 && r < mr(n) && vr(n.childNodes[r]) && (s = !0);
        ;

      )
        if (r > 0) {
          if (1 != n.nodeType) break;
          const a = n.childNodes[r - 1];
          if (vr(a)) (o = n), (i = --r);
          else {
            if (3 != a.nodeType) break;
            r = (n = a).nodeValue.length;
          }
        } else {
          if (wr(n)) break;
          for (var c = n.previousSibling; c && vr(c); )
            (o = n.parentNode), (i = Ye(c)), (c = c.previousSibling);
          if (c) r = mr((n = c));
          else {
            if ((n = n.parentNode) == t.dom) break;
            r = 0;
          }
        }
      s ? br(t, e, n, r) : o && br(t, e, o, i);
    }
  }
  function yr(t) {
    const e = t.domSelection();
    let n = e.focusNode;
    let r = e.focusOffset;
    if (n) {
      for (var o, i, s = mr(n); ; )
        if (r < s) {
          if (1 != n.nodeType) break;
          if (!vr(n.childNodes[r])) break;
          (o = n), (i = ++r);
        } else {
          if (wr(n)) break;
          for (var a = n.nextSibling; a && vr(a); )
            (o = a.parentNode), (i = Ye(a) + 1), (a = a.nextSibling);
          if (a) (r = 0), (s = mr((n = a)));
          else {
            if ((n = n.parentNode) == t.dom) break;
            r = s = 0;
          }
        }
      o && br(t, e, o, i);
    }
  }
  function wr(t) {
    const e = t.pmViewDesc;
    return e && e.node && e.node.isBlock;
  }
  function br(t, e, n, r) {
    if (cn(e)) {
      const o = document.createRange();
      o.setEnd(n, r), o.setStart(n, r), e.removeAllRanges(), e.addRange(o);
    } else e.extend && e.extend(n, r);
    t.domObserver.setCurSelection();
    const i = t.state;
    setTimeout(function () {
      t.state == i && nr(t);
    }, 50);
  }
  function kr(t, e, n) {
    const r = t.state.selection;
    if ((r instanceof fe && !r.empty) || n.indexOf('s') > -1) return !1;
    if (Ue && n.indexOf('m') > -1) return !1;
    const o = r.$from;
    const i = r.$to;
    if (!o.parent.inlineContent || t.endOfTextblock(e < 0 ? 'up' : 'down')) {
      const s = ur(t.state, e);
      if (s && s instanceof me) return fr(t, s);
    }
    if (!o.parent.inlineContent) {
      const a = e < 0 ? o : i;
      const c = r instanceof ge ? ce.near(a, e) : ce.findFrom(a, e);
      return !!c && fr(t, c);
    }
    return !1;
  }
  function xr(t, e) {
    if (!(t.state.selection instanceof fe)) return !0;
    const n = t.state.selection;
    const r = n.$head;
    const o = n.$anchor;
    const i = n.empty;
    if (!r.sameParent(o)) return !0;
    if (!i) return !1;
    if (t.endOfTextblock(e > 0 ? 'forward' : 'backward')) return !0;
    const s = !r.textOffset && (e < 0 ? r.nodeBefore : r.nodeAfter);
    if (s && !s.isText) {
      const a = t.state.tr;
      return (
        e < 0
          ? a.delete(r.pos - s.nodeSize, r.pos)
          : a.delete(r.pos, r.pos + s.nodeSize),
        t.dispatch(a),
        !0
      );
    }
    return !1;
  }
  function Sr(t, e, n) {
    t.domObserver.stop(), (e.contentEditable = n), t.domObserver.start();
  }
  function Mr(t, e) {
    const n = e.keyCode;
    const r = (function (t) {
      let e = '';
      return (
        t.ctrlKey && (e += 'c'),
        t.metaKey && (e += 'm'),
        t.altKey && (e += 'a'),
        t.shiftKey && (e += 's'),
        e
      );
    })(e);
    return n == 8 || (Ue && n == 72 && r == 'c')
      ? xr(t, -1) || gr(t)
      : n == 46 || (Ue && n == 68 && r == 'c')
      ? xr(t, 1) || yr(t)
      : n == 13 ||
        n == 27 ||
        (n == 37 || (Ue && n == 66 && r == 'c')
          ? dr(t, -1, r) || gr(t)
          : n == 39 || (Ue && n == 70 && r == 'c')
          ? dr(t, 1, r) || yr(t)
          : n == 38 || (Ue && n == 80 && r == 'c')
          ? kr(t, -1, r) || gr(t)
          : n == 40 || (Ue && n == 78 && r == 'c')
          ? (function (t) {
              if (!Ke || t.state.selection.$head.parentOffset > 0) return !1;
              const e = t.domSelection();
              const n = e.focusNode;
              const r = e.focusOffset;
              if (
                n &&
                n.nodeType == 1 &&
                r == 0 &&
                n.firstChild &&
                n.firstChild.contentEditable == 'false'
              ) {
                const o = n.firstChild;
                Sr(t, o, 'true'),
                  setTimeout(function () {
                    return Sr(t, o, 'false');
                  }, 20);
              }
              return !1;
            })(t) ||
            kr(t, 1, r) ||
            yr(t)
          : r == (Ue ? 'm' : 'c') &&
            (n == 66 || n == 73 || n == 89 || n == 90));
  }
  function Cr(t, e) {
    for (
      var n = [], r = e.content, o = e.openStart, i = e.openEnd;
      o > 1 && i > 1 && r.childCount == 1 && r.firstChild.childCount == 1;

    ) {
      o--, i--;
      const s = r.firstChild;
      n.push(s.type.name, s.attrs != s.type.defaultAttrs ? s.attrs : null),
        (r = s.content);
    }
    const a =
      t.someProp('clipboardSerializer') || ft.fromSchema(t.state.schema);
    const c = Pr();
    const l = c.createElement('div');
    l.appendChild(a.serializeFragment(r, { document: c }));
    for (
      var p, h = l.firstChild, u = 0;
      h && h.nodeType == 1 && (p = Rr[h.nodeName.toLowerCase()]);

    ) {
      for (let f = p.length - 1; f >= 0; f--) {
        for (var d = c.createElement(p[f]); l.firstChild; )
          d.appendChild(l.firstChild);
        l.appendChild(d), u++;
      }
      h = l.firstChild;
    }
    return (
      h &&
        h.nodeType == 1 &&
        h.setAttribute(
          'data-pm-slice',
          o + ' ' + i + (u ? ' -' + u : '') + ' ' + JSON.stringify(n),
        ),
      {
        dom: l,
        text:
          t.someProp('clipboardTextSerializer', function (t) {
            return t(e);
          }) || e.content.textBetween(0, e.content.size, '\n\n'),
      }
    );
  }
  function Or(t, e, n, o, i) {
    let s;
    let a;
    const c = i.parent.type.spec.code;
    if (!n && !e) return null;
    const l = e && (o || c || !n);
    if (l) {
      if (
        (t.someProp('transformPastedText', function (t) {
          e = t(e, c || o);
        }),
        c)
      )
        return e
          ? new p(r.from(t.state.schema.text(e.replace(/\r\n?/g, '\n'))), 0, 0)
          : p.empty;
      const h = t.someProp('clipboardTextParser', function (t) {
        return t(e, i, o);
      });
      if (h) a = h;
      else {
        const u = i.marks();
        const f = t.state.schema;
        const d = ft.fromSchema(f);
        (s = document.createElement('div')),
          e.split(/(?:\r\n?|\n)+/).forEach(function (t) {
            const e = s.appendChild(document.createElement('p'));
            t && e.appendChild(d.serializeNode(f.text(t, u)));
          });
      }
    } else
      t.someProp('transformPastedHTML', function (t) {
        n = t(n);
      }),
        (s = (function (t) {
          const e = /^(\s*<meta [^>]*>)*/.exec(t);
          e && (t = t.slice(e[0].length));
          let n;
          let r = Pr().createElement('div');
          const o = /<([a-z][^>\s]+)/i.exec(t);
          (n = o && Rr[o[1].toLowerCase()]) &&
            (t =
              n
                .map(function (t) {
                  return '<' + t + '>';
                })
                .join('') +
              t +
              n
                .map(function (t) {
                  return '</' + t + '>';
                })
                .reverse()
                .join(''));
          if (((r.innerHTML = t), n))
            for (let i = 0; i < n.length; i++) r = r.querySelector(n[i]) || r;
          return r;
        })(n)),
        Qe &&
          (function (t) {
            for (
              let e = t.querySelectorAll(
                  Je
                    ? 'span:not([class]):not([style])'
                    : 'span.Apple-converted-space',
                ),
                n = 0;
              n < e.length;
              n++
            ) {
              const r = e[n];
              r.childNodes.length == 1 &&
                r.textContent == ' ' &&
                r.parentNode &&
                r.parentNode.replaceChild(
                  t.ownerDocument.createTextNode(' '),
                  r,
                );
            }
          })(s);
    const m = s && s.querySelector('[data-pm-slice]');
    const v =
      m &&
      /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(
        m.getAttribute('data-pm-slice') || '',
      );
    if (v && v[3])
      for (let g = Number(v[3]); g > 0 && s.firstChild; g--) s = s.firstChild;
    if (!a) {
      const y =
        t.someProp('clipboardParser') ||
        t.someProp('domParser') ||
        nt.fromSchema(t.state.schema);
      a = y.parseSlice(s, {
        preserveWhitespace: !(!l && !v),
        context: i,
        ruleFromNode: function (t) {
          return 'BR' != t.nodeName ||
            t.nextSibling ||
            !t.parentNode ||
            Nr.test(t.parentNode.nodeName)
            ? null
            : { ignore: !0 };
        },
      });
    }
    if (v)
      a = (function (t, e) {
        if (!t.size) return t;
        let n;
        const o = t.content.firstChild.type.schema;
        try {
          n = JSON.parse(e);
        } catch (e) {
          return t;
        }
        for (
          var i = t.content, s = t.openStart, a = t.openEnd, c = n.length - 2;
          c >= 0;
          c -= 2
        ) {
          const l = o.nodes[n[c]];
          if (!l || l.hasRequiredAttrs()) break;
          (i = r.from(l.create(n[c + 1], i))), s++, a++;
        }
        return new p(i, s, a);
      })(Ir(a, Number(v[1]), Number(v[2])), v[4]);
    else if (
      ((a = p.maxOpen(
        (function (t, e) {
          if (t.childCount < 2) return t;
          for (
            let n = function (n) {
                let o = e.node(n).contentMatchAt(e.index(n));
                let i = void 0;
                let s = [];
                if (
                  (t.forEach(function (t) {
                    if (s) {
                      let e;
                      const n = o.findWrapping(t.type);
                      if (!n) return (s = null);
                      if (
                        (e =
                          s.length &&
                          i.length &&
                          Tr(n, i, t, s[s.length - 1], 0))
                      )
                        s[s.length - 1] = e;
                      else {
                        s.length &&
                          (s[s.length - 1] = Ar(s[s.length - 1], i.length));
                        const r = Dr(t, n);
                        s.push(r), (o = o.matchType(r.type)), (i = n);
                      }
                    }
                  }),
                  s)
                )
                  return { v: r.from(s) };
              },
              o = e.depth;
            o >= 0;
            o--
          ) {
            const i = n(o);
            if (i) return i.v;
          }
          return t;
        })(a.content, i),
        !0,
      )),
      a.openStart || a.openEnd)
    ) {
      for (
        var w = 0, b = 0, k = a.content.firstChild;
        w < a.openStart && !k.type.spec.isolating;
        w++, k = k.firstChild
      );
      for (
        let x = a.content.lastChild;
        b < a.openEnd && !x.type.spec.isolating;
        b++, x = x.lastChild
      );
      a = Ir(a, w, b);
    }
    return (
      t.someProp('transformPasted', function (t) {
        a = t(a);
      }),
      a
    );
  }
  var Nr =
    /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
  function Dr(t, e, n) {
    void 0 === n && (n = 0);
    for (let o = e.length - 1; o >= n; o--) t = e[o].create(null, r.from(t));
    return t;
  }
  function Tr(t, e, n, o, i) {
    if (i < t.length && i < e.length && t[i] == e[i]) {
      const s = Tr(t, e, n, o.lastChild, i + 1);
      if (s) return o.copy(o.content.replaceChild(o.childCount - 1, s));
      if (
        o
          .contentMatchAt(o.childCount)
          .matchType(i == t.length - 1 ? n.type : t[i + 1])
      )
        return o.copy(o.content.append(r.from(Dr(n, t, i + 1))));
    }
  }
  function Ar(t, e) {
    if (e == 0) return t;
    const n = t.content.replaceChild(t.childCount - 1, Ar(t.lastChild, e - 1));
    const o = t.contentMatchAt(t.childCount).fillBefore(r.empty, !0);
    return t.copy(n.append(o));
  }
  function Er(t, e, n, o, i, s) {
    const a = e < 0 ? t.firstChild : t.lastChild;
    let c = a.content;
    return (
      i < o - 1 && (c = Er(c, e, n, o, i + 1, s)),
      i >= n &&
        (c =
          e < 0
            ? a
                .contentMatchAt(0)
                .fillBefore(c, t.childCount > 1 || s <= i)
                .append(c)
            : c.append(a.contentMatchAt(a.childCount).fillBefore(r.empty, !0))),
      t.replaceChild(e < 0 ? 0 : t.childCount - 1, a.copy(c))
    );
  }
  function Ir(t, e, n) {
    return (
      e < t.openStart &&
        (t = new p(
          Er(t.content, -1, e, t.openStart, 0, t.openEnd),
          e,
          t.openEnd,
        )),
      n < t.openEnd &&
        (t = new p(Er(t.content, 1, n, t.openEnd, 0, 0), t.openStart, n)),
      t
    );
  }
  var Rr = {
    thead: ['table'],
    tbody: ['table'],
    tfoot: ['table'],
    caption: ['table'],
    colgroup: ['table'],
    col: ['table', 'colgroup'],
    tr: ['table', 'tbody'],
    td: ['table', 'tbody', 'tr'],
    th: ['table', 'tbody', 'tr'],
  };
  let zr = null;
  function Pr() {
    return zr || (zr = document.implementation.createHTMLDocument('title'));
  }
  const Br = {};
  const _r = {};
  const Vr = { touchstart: !0, touchmove: !0 };
  const Fr = function () {
    (this.shiftKey = !1),
      (this.mouseDown = null),
      (this.lastKeyCode = null),
      (this.lastKeyCodeTime = 0),
      (this.lastClick = { time: 0, x: 0, y: 0, type: '' }),
      (this.lastSelectionOrigin = null),
      (this.lastSelectionTime = 0),
      (this.lastIOSEnter = 0),
      (this.lastIOSEnterFallbackTimeout = -1),
      (this.lastFocus = 0),
      (this.lastTouch = 0),
      (this.lastAndroidDelete = 0),
      (this.composing = !1),
      (this.composingTimeout = -1),
      (this.compositionNodes = []),
      (this.compositionEndedAt = -2e8),
      (this.domChangeCount = 0),
      (this.eventHandlers = Object.create(null)),
      (this.hideSelectionGuard = null);
  };
  function $r(t, e) {
    (t.input.lastSelectionOrigin = e), (t.input.lastSelectionTime = Date.now());
  }
  function qr(t) {
    t.someProp('handleDOMEvents', function (e) {
      for (const n in e)
        t.input.eventHandlers[n] ||
          t.dom.addEventListener(
            n,
            (t.input.eventHandlers[n] = function (e) {
              return Lr(t, e);
            }),
          );
    });
  }
  function Lr(t, e) {
    return t.someProp('handleDOMEvents', function (n) {
      const r = n[e.type];
      return !!r && (r(t, e) || e.defaultPrevented);
    });
  }
  function jr(t) {
    return { left: t.clientX, top: t.clientY };
  }
  function Jr(t, e, n, r, o) {
    if (r == -1) return !1;
    for (
      var i = t.state.doc.resolve(r),
        s = function (r) {
          if (
            t.someProp(e, function (e) {
              return r > i.depth
                ? e(t, n, i.nodeAfter, i.before(r), o, !0)
                : e(t, n, i.node(r), i.before(r), o, !1);
            })
          )
            return { v: !0 };
        },
        a = i.depth + 1;
      a > 0;
      a--
    ) {
      const c = s(a);
      if (c) return c.v;
    }
    return !1;
  }
  function Wr(t, e, n) {
    t.focused || t.focus();
    const r = t.state.tr.setSelection(e);
    n == 'pointer' && r.setMeta('pointer', !0), t.dispatch(r);
  }
  function Kr(t, e, n, r, o) {
    return (
      Jr(t, 'handleClickOn', e, n, r) ||
      t.someProp('handleClick', function (n) {
        return n(t, e, r);
      }) ||
      (o
        ? (function (t, e) {
            if (e == -1) return !1;
            let n;
            let r;
            const o = t.state.selection;
            o instanceof me && (n = o.node);
            for (let i = t.state.doc.resolve(e), s = i.depth + 1; s > 0; s--) {
              const a = s > i.depth ? i.nodeAfter : i.node(s);
              if (me.isSelectable(a)) {
                r =
                  n &&
                  o.$from.depth > 0 &&
                  s >= o.$from.depth &&
                  i.before(o.$from.depth + 1) == o.$from.pos
                    ? i.before(o.$from.depth)
                    : i.before(s);
                break;
              }
            }
            return (
              null != r && (Wr(t, me.create(t.state.doc, r), 'pointer'), !0)
            );
          })(t, n)
        : (function (t, e) {
            if (e == -1) return !1;
            const n = t.state.doc.resolve(e);
            const r = n.nodeAfter;
            return (
              !!(r && r.isAtom && me.isSelectable(r)) &&
              (Wr(t, new me(n), 'pointer'), !0)
            );
          })(t, n))
    );
  }
  function Hr(t, e, n, r) {
    return (
      Jr(t, 'handleDoubleClickOn', e, n, r) ||
      t.someProp('handleDoubleClick', function (n) {
        return n(t, e, r);
      })
    );
  }
  function Ur(t, e, n, r) {
    return (
      Jr(t, 'handleTripleClickOn', e, n, r) ||
      t.someProp('handleTripleClick', function (n) {
        return n(t, e, r);
      }) ||
      (function (t, e, n) {
        if (0 != n.button) return !1;
        const r = t.state.doc;
        if (e == -1)
          return (
            !!r.inlineContent &&
            (Wr(t, fe.create(r, 0, r.content.size), 'pointer'), !0)
          );
        for (let o = r.resolve(e), i = o.depth + 1; i > 0; i--) {
          const s = i > o.depth ? o.nodeAfter : o.node(i);
          const a = o.before(i);
          if (s.inlineContent)
            Wr(t, fe.create(r, a + 1, a + 1 + s.content.size), 'pointer');
          else {
            if (!me.isSelectable(s)) continue;
            Wr(t, me.create(r, a), 'pointer');
          }
          return !0;
        }
      })(t, n, r)
    );
  }
  function Gr(t) {
    return no(t);
  }
  (_r.keydown = function (t, e) {
    const n = e;
    if (
      ((t.input.shiftKey = n.keyCode == 16 || n.shiftKey),
      !Yr(t, n) &&
        ((t.input.lastKeyCode = n.keyCode),
        (t.input.lastKeyCodeTime = Date.now()),
        !Ge || !Je || 13 != n.keyCode))
    )
      if (
        (229 != n.keyCode && t.domObserver.forceFlush(),
        !He || 13 != n.keyCode || n.ctrlKey || n.altKey || n.metaKey)
      )
        t.someProp('handleKeyDown', function (e) {
          return e(t, n);
        }) || Mr(t, n)
          ? n.preventDefault()
          : $r(t, 'key');
      else {
        const r = Date.now();
        (t.input.lastIOSEnter = r),
          (t.input.lastIOSEnterFallbackTimeout = setTimeout(function () {
            t.input.lastIOSEnter == r &&
              (t.someProp('handleKeyDown', function (e) {
                return e(t, ln(13, 'Enter'));
              }),
              (t.input.lastIOSEnter = 0));
          }, 200));
      }
  }),
    (_r.keyup = function (t, e) {
      e.keyCode == 16 && (t.input.shiftKey = !1);
    }),
    (_r.keypress = function (t, e) {
      const n = e;
      if (
        !(
          Yr(t, n) ||
          !n.charCode ||
          (n.ctrlKey && !n.altKey) ||
          (Ue && n.metaKey)
        )
      )
        if (
          t.someProp('handleKeyPress', function (e) {
            return e(t, n);
          })
        )
          n.preventDefault();
        else {
          const r = t.state.selection;
          if (!(r instanceof fe && r.$from.sameParent(r.$to))) {
            const o = String.fromCharCode(n.charCode);
            t.someProp('handleTextInput', function (e) {
              return e(t, r.$from.pos, r.$to.pos, o);
            }) || t.dispatch(t.state.tr.insertText(o).scrollIntoView()),
              n.preventDefault();
          }
        }
    });
  const Qr = Ue ? 'metaKey' : 'ctrlKey';
  Br.mousedown = function (t, e) {
    const n = e;
    t.input.shiftKey = n.shiftKey;
    const r = Gr(t);
    const o = Date.now();
    let i = 'singleClick';
    o - t.input.lastClick.time < 500 &&
      (function (t, e) {
        const n = e.x - t.clientX;
        const r = e.y - t.clientY;
        return n * n + r * r < 100;
      })(n, t.input.lastClick) &&
      !n[Qr] &&
      (t.input.lastClick.type == 'singleClick'
        ? (i = 'doubleClick')
        : t.input.lastClick.type == 'doubleClick' && (i = 'tripleClick')),
      (t.input.lastClick = { time: o, x: n.clientX, y: n.clientY, type: i });
    const s = t.posAtCoords(jr(n));
    s &&
      (i == 'singleClick'
        ? (t.input.mouseDown && t.input.mouseDown.done(),
          (t.input.mouseDown = new Xr(t, s, n, !!r)))
        : (i == 'doubleClick' ? Hr : Ur)(t, s.pos, s.inside, n)
        ? n.preventDefault()
        : $r(t, 'pointer'));
  };
  var Xr = function (t, e, n, r) {
    let o;
    let i;
    const s = this;
    if (
      ((this.view = t),
      (this.pos = e),
      (this.event = n),
      (this.flushed = r),
      (this.delayedSelectionSync = !1),
      (this.mightDrag = null),
      (this.startDoc = t.state.doc),
      (this.selectNode = !!n[Qr]),
      (this.allowDefault = n.shiftKey),
      e.inside > -1)
    )
      (o = t.state.doc.nodeAt(e.inside)), (i = e.inside);
    else {
      const a = t.state.doc.resolve(e.pos);
      (o = a.parent), (i = a.depth ? a.before() : 0);
    }
    const c = r ? null : n.target;
    const l = c ? t.docView.nearestDesc(c, !0) : null;
    this.target = l ? l.dom : null;
    const p = t.state.selection;
    ((n.button == 0 &&
      o.type.spec.draggable &&
      !1 !== o.type.spec.selectable) ||
      (p instanceof me && p.from <= i && p.to > i)) &&
      (this.mightDrag = {
        node: o,
        pos: i,
        addAttr: !(!this.target || this.target.draggable),
        setUneditable: !(
          !this.target ||
          !Le ||
          this.target.hasAttribute('contentEditable')
        ),
      }),
      this.target &&
        this.mightDrag &&
        (this.mightDrag.addAttr || this.mightDrag.setUneditable) &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && (this.target.draggable = !0),
        this.mightDrag.setUneditable &&
          setTimeout(function () {
            s.view.input.mouseDown == s &&
              s.target.setAttribute('contentEditable', 'false');
          }, 20),
        this.view.domObserver.start()),
      t.root.addEventListener('mouseup', (this.up = this.up.bind(this))),
      t.root.addEventListener('mousemove', (this.move = this.move.bind(this))),
      $r(t, 'pointer');
  };
  function Yr(t, e) {
    return (
      !!t.composing ||
      (!!(Ke && Math.abs(e.timeStamp - t.input.compositionEndedAt) < 500) &&
        ((t.input.compositionEndedAt = -2e8), !0))
    );
  }
  (Xr.prototype.done = function () {
    const t = this;
    this.view.root.removeEventListener('mouseup', this.up),
      this.view.root.removeEventListener('mousemove', this.move),
      this.mightDrag &&
        this.target &&
        (this.view.domObserver.stop(),
        this.mightDrag.addAttr && this.target.removeAttribute('draggable'),
        this.mightDrag.setUneditable &&
          this.target.removeAttribute('contentEditable'),
        this.view.domObserver.start()),
      this.delayedSelectionSync &&
        setTimeout(function () {
          return nr(t.view);
        }),
      (this.view.input.mouseDown = null);
  }),
    (Xr.prototype.up = function (t) {
      if ((this.done(), this.view.dom.contains(t.target))) {
        let e = this.pos;
        this.view.state.doc != this.startDoc &&
          (e = this.view.posAtCoords(jr(t))),
          this.updateAllowDefault(t),
          this.allowDefault || !e
            ? $r(this.view, 'pointer')
            : Kr(this.view, e.pos, e.inside, t, this.selectNode)
            ? t.preventDefault()
            : t.button == 0 &&
              (this.flushed ||
                (Ke && this.mightDrag && !this.mightDrag.node.isAtom) ||
                (Je &&
                  !(this.view.state.selection instanceof fe) &&
                  Math.min(
                    Math.abs(e.pos - this.view.state.selection.from),
                    Math.abs(e.pos - this.view.state.selection.to),
                  ) <= 2))
            ? (Wr(
                this.view,
                ce.near(this.view.state.doc.resolve(e.pos)),
                'pointer',
              ),
              t.preventDefault())
            : $r(this.view, 'pointer');
      }
    }),
    (Xr.prototype.move = function (t) {
      this.updateAllowDefault(t),
        $r(this.view, 'pointer'),
        t.buttons == 0 && this.done();
    }),
    (Xr.prototype.updateAllowDefault = function (t) {
      !this.allowDefault &&
        (Math.abs(this.event.x - t.clientX) > 4 ||
          Math.abs(this.event.y - t.clientY) > 4) &&
        (this.allowDefault = !0);
    }),
    (Br.touchstart = function (t) {
      (t.input.lastTouch = Date.now()), Gr(t), $r(t, 'pointer');
    }),
    (Br.touchmove = function (t) {
      (t.input.lastTouch = Date.now()), $r(t, 'pointer');
    }),
    (Br.contextmenu = function (t) {
      return Gr(t);
    });
  const Zr = Ge ? 5e3 : -1;
  function to(t, e) {
    clearTimeout(t.input.composingTimeout),
      e > -1 &&
        (t.input.composingTimeout = setTimeout(function () {
          return no(t);
        }, e));
  }
  function eo(t) {
    let e;
    for (
      t.composing &&
      ((t.input.composing = !1),
      (t.input.compositionEndedAt =
        ((e = document.createEvent('Event')).initEvent('event', !0, !0),
        e.timeStamp)));
      t.input.compositionNodes.length > 0;

    )
      t.input.compositionNodes.pop().markParentsDirty();
  }
  function no(t, e) {
    if ((void 0 === e && (e = !1), !(Ge && t.domObserver.flushingSoon >= 0))) {
      if (
        (t.domObserver.forceFlush(), eo(t), e || (t.docView && t.docView.dirty))
      ) {
        const n = tr(t);
        return (
          n && !n.eq(t.state.selection)
            ? t.dispatch(t.state.tr.setSelection(n))
            : t.updateState(t.state),
          !0
        );
      }
      return !1;
    }
  }
  (_r.compositionstart = _r.compositionupdate =
    function (t) {
      if (!t.composing) {
        t.domObserver.flush();
        const e = t.state;
        const n = e.selection.$from;
        if (
          e.selection.empty &&
          (e.storedMarks ||
            (!n.textOffset &&
              n.parentOffset &&
              n.nodeBefore.marks.some(function (t) {
                return !1 === t.type.spec.inclusive;
              })))
        )
          (t.markCursor = t.state.storedMarks || n.marks()),
            no(t, !0),
            (t.markCursor = null);
        else if (
          (no(t),
          Le &&
            e.selection.empty &&
            n.parentOffset &&
            !n.textOffset &&
            n.nodeBefore.marks.length)
        )
          for (
            let r = t.domSelection(), o = r.focusNode, i = r.focusOffset;
            o && o.nodeType == 1 && 0 != i;

          ) {
            const s = i < 0 ? o.lastChild : o.childNodes[i - 1];
            if (!s) break;
            if (s.nodeType == 3) {
              r.collapse(s, s.nodeValue.length);
              break;
            }
            (o = s), (i = -1);
          }
        t.input.composing = !0;
      }
      to(t, Zr);
    }),
    (_r.compositionend = function (t, e) {
      t.composing &&
        ((t.input.composing = !1),
        (t.input.compositionEndedAt = e.timeStamp),
        to(t, 20));
    });
  const ro = ($e && qe < 15) || (He && Xe < 604);
  function oo(t, e, n, r) {
    const o = Or(t, e, n, t.input.shiftKey, t.state.selection.$from);
    if (
      t.someProp('handlePaste', function (e) {
        return e(t, r, o || p.empty);
      })
    )
      return !0;
    if (!o) return !1;
    const i = (function (t) {
      return t.openStart == 0 && t.openEnd == 0 && t.content.childCount == 1
        ? t.content.firstChild
        : null;
    })(o);
    const s = i
      ? t.state.tr.replaceSelectionWith(i, t.input.shiftKey)
      : t.state.tr.replaceSelection(o);
    return (
      t.dispatch(
        s.scrollIntoView().setMeta('paste', !0).setMeta('uiEvent', 'paste'),
      ),
      !0
    );
  }
  (Br.copy = _r.cut =
    function (t, e) {
      const n = e;
      const r = t.state.selection;
      const o = n.type == 'cut';
      if (!r.empty) {
        const i = ro ? null : n.clipboardData;
        const s = Cr(t, r.content());
        const a = s.dom;
        const c = s.text;
        i
          ? (n.preventDefault(),
            i.clearData(),
            i.setData('text/html', a.innerHTML),
            i.setData('text/plain', c))
          : (function (t, e) {
              if (t.dom.parentNode) {
                const n = t.dom.parentNode.appendChild(
                  document.createElement('div'),
                );
                n.appendChild(e),
                  (n.style.cssText =
                    'position: fixed; left: -10000px; top: 10px');
                const r = getSelection();
                const o = document.createRange();
                o.selectNodeContents(e),
                  t.dom.blur(),
                  r.removeAllRanges(),
                  r.addRange(o),
                  setTimeout(function () {
                    n.parentNode && n.parentNode.removeChild(n), t.focus();
                  }, 50);
              }
            })(t, a),
          o &&
            t.dispatch(
              t.state.tr
                .deleteSelection()
                .scrollIntoView()
                .setMeta('uiEvent', 'cut'),
            );
      }
    }),
    (_r.paste = function (t, e) {
      const n = e;
      if (!t.composing || Ge) {
        const r = ro ? null : n.clipboardData;
        r && oo(t, r.getData('text/plain'), r.getData('text/html'), n)
          ? n.preventDefault()
          : (function (t, e) {
              if (t.dom.parentNode) {
                const n =
                  t.input.shiftKey ||
                  t.state.selection.$from.parent.type.spec.code;
                const r = t.dom.parentNode.appendChild(
                  document.createElement(n ? 'textarea' : 'div'),
                );
                n || (r.contentEditable = 'true'),
                  (r.style.cssText =
                    'position: fixed; left: -10000px; top: 10px'),
                  r.focus(),
                  setTimeout(function () {
                    t.focus(),
                      r.parentNode && r.parentNode.removeChild(r),
                      n
                        ? oo(t, r.value, null, e)
                        : oo(t, r.textContent, r.innerHTML, e);
                  }, 50);
              }
            })(t, n);
      }
    });
  const io = function (t, e) {
    (this.slice = t), (this.move = e);
  };
  const so = Ue ? 'altKey' : 'ctrlKey';
  for (const ao in ((Br.dragstart = function (t, e) {
    const n = e;
    const r = t.input.mouseDown;
    if ((r && r.done(), n.dataTransfer)) {
      const o = t.state.selection;
      const i = o.empty ? null : t.posAtCoords(jr(n));
      if (i && i.pos >= o.from && i.pos <= (o instanceof me ? o.to - 1 : o.to));
      else if (r && r.mightDrag)
        t.dispatch(
          t.state.tr.setSelection(me.create(t.state.doc, r.mightDrag.pos)),
        );
      else if (n.target && n.target.nodeType == 1) {
        const s = t.docView.nearestDesc(n.target, !0);
        s &&
          s.node.type.spec.draggable &&
          s != t.docView &&
          t.dispatch(
            t.state.tr.setSelection(me.create(t.state.doc, s.posBefore)),
          );
      }
      const a = t.state.selection.content();
      const c = Cr(t, a);
      const l = c.dom;
      const p = c.text;
      n.dataTransfer.clearData(),
        n.dataTransfer.setData(ro ? 'Text' : 'text/html', l.innerHTML),
        (n.dataTransfer.effectAllowed = 'copyMove'),
        ro || n.dataTransfer.setData('text/plain', p),
        (t.dragging = new io(a, !n[so]));
    }
  }),
  (Br.dragend = function (t) {
    const e = t.dragging;
    window.setTimeout(function () {
      t.dragging == e && (t.dragging = null);
    }, 50);
  }),
  (_r.dragover = _r.dragenter =
    function (t, e) {
      return e.preventDefault();
    }),
  (_r.drop = function (t, e) {
    const n = e;
    const r = t.dragging;
    if (((t.dragging = null), n.dataTransfer)) {
      const o = t.posAtCoords(jr(n));
      if (o) {
        const i = t.state.doc.resolve(o.pos);
        let s = r && r.slice;
        s
          ? t.someProp('transformPasted', function (t) {
              s = t(s);
            })
          : (s = Or(
              t,
              n.dataTransfer.getData(ro ? 'Text' : 'text/plain'),
              ro ? null : n.dataTransfer.getData('text/html'),
              !1,
              i,
            ));
        const a = !(!r || n[so]);
        if (
          t.someProp('handleDrop', function (e) {
            return e(t, n, s || p.empty, a);
          })
        )
          n.preventDefault();
        else if (s) {
          n.preventDefault();
          let c = s ? jt(t.state.doc, i.pos, s) : i.pos;
          c == null && (c = i.pos);
          const l = t.state.tr;
          a && l.deleteSelection();
          const h = l.mapping.map(c);
          const u =
            s.openStart == 0 && s.openEnd == 0 && s.content.childCount == 1;
          const f = l.doc;
          if (
            (u
              ? l.replaceRangeWith(h, h, s.content.firstChild)
              : l.replaceRange(h, h, s),
            !l.doc.eq(f))
          ) {
            const d = l.doc.resolve(h);
            if (
              u &&
              me.isSelectable(s.content.firstChild) &&
              d.nodeAfter &&
              d.nodeAfter.sameMarkup(s.content.firstChild)
            )
              l.setSelection(new me(d));
            else {
              let m = l.mapping.map(c);
              l.mapping.maps[l.mapping.maps.length - 1].forEach(
                function (t, e, n, r) {
                  return (m = r);
                },
              ),
                l.setSelection(lr(t, d, l.doc.resolve(m)));
            }
            t.focus(), t.dispatch(l.setMeta('uiEvent', 'drop'));
          }
        }
      }
    }
  }),
  (Br.focus = function (t) {
    (t.input.lastFocus = Date.now()),
      t.focused ||
        (t.domObserver.stop(),
        t.dom.classList.add('ProseMirror-focused'),
        t.domObserver.start(),
        (t.focused = !0),
        setTimeout(function () {
          t.docView &&
            t.hasFocus() &&
            !t.domObserver.currentSelection.eq(t.domSelection()) &&
            nr(t);
        }, 20));
  }),
  (Br.blur = function (t, e) {
    const n = e;
    t.focused &&
      (t.domObserver.stop(),
      t.dom.classList.remove('ProseMirror-focused'),
      t.domObserver.start(),
      n.relatedTarget &&
        t.dom.contains(n.relatedTarget) &&
        t.domObserver.currentSelection.clear(),
      (t.focused = !1));
  }),
  (Br.beforeinput = function (t, e) {
    if (Je && Ge && e.inputType == 'deleteContentBackward') {
      t.domObserver.flushSoon();
      const n = t.input.domChangeCount;
      setTimeout(function () {
        if (
          t.input.domChangeCount == n &&
          (t.dom.blur(),
          t.focus(),
          !t.someProp('handleKeyDown', function (e) {
            return e(t, ln(8, 'Backspace'));
          }))
        ) {
          const e = t.state.selection.$cursor;
          e &&
            e.pos > 0 &&
            t.dispatch(t.state.tr.delete(e.pos - 1, e.pos).scrollIntoView());
        }
      }, 50);
    }
  }),
  _r))
    Br[ao] = _r[ao];
  function co(t, e) {
    if (t == e) return !0;
    for (const n in t) if (t[n] !== e[n]) return !1;
    for (const r in e) if (!(r in t)) return !1;
    return !0;
  }
  const lo = function (t, e) {
    (this.toDOM = t), (this.spec = e || vo), (this.side = this.spec.side || 0);
  };
  (lo.prototype.map = function (t, e, n, r) {
    const o = t.mapResult(e.from + r, this.side < 0 ? -1 : 1);
    const i = o.pos;
    return o.deleted ? null : new uo(i - n, i - n, this);
  }),
    (lo.prototype.valid = function () {
      return !0;
    }),
    (lo.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof lo &&
          ((this.spec.key && this.spec.key == t.spec.key) ||
            (this.toDOM == t.toDOM && co(this.spec, t.spec))))
      );
    }),
    (lo.prototype.destroy = function (t) {
      this.spec.destroy && this.spec.destroy(t);
    });
  const po = function (t, e) {
    (this.attrs = t), (this.spec = e || vo);
  };
  (po.prototype.map = function (t, e, n, r) {
    const o = t.map(e.from + r, this.spec.inclusiveStart ? -1 : 1) - n;
    const i = t.map(e.to + r, this.spec.inclusiveEnd ? 1 : -1) - n;
    return o >= i ? null : new uo(o, i, this);
  }),
    (po.prototype.valid = function (t, e) {
      return e.from < e.to;
    }),
    (po.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof po && co(this.attrs, t.attrs) && co(this.spec, t.spec))
      );
    }),
    (po.is = function (t) {
      return t.type instanceof po;
    }),
    (po.prototype.destroy = function () {});
  const ho = function (t, e) {
    (this.attrs = t), (this.spec = e || vo);
  };
  (ho.prototype.map = function (t, e, n, r) {
    const o = t.mapResult(e.from + r, 1);
    if (o.deleted) return null;
    const i = t.mapResult(e.to + r, -1);
    return i.deleted || i.pos <= o.pos
      ? null
      : new uo(o.pos - n, i.pos - n, this);
  }),
    (ho.prototype.valid = function (t, e) {
      let n;
      const r = t.content.findIndex(e.from);
      const o = r.index;
      const i = r.offset;
      return i == e.from && !(n = t.child(o)).isText && i + n.nodeSize == e.to;
    }),
    (ho.prototype.eq = function (t) {
      return (
        this == t ||
        (t instanceof ho && co(this.attrs, t.attrs) && co(this.spec, t.spec))
      );
    }),
    (ho.prototype.destroy = function () {});
  var uo = function (t, e, n) {
    (this.from = t), (this.to = e), (this.type = n);
  };
  const fo = { spec: { configurable: !0 }, inline: { configurable: !0 } };
  (uo.prototype.copy = function (t, e) {
    return new uo(t, e, this.type);
  }),
    (uo.prototype.eq = function (t, e) {
      return (
        void 0 === e && (e = 0),
        this.type.eq(t.type) && this.from + e == t.from && this.to + e == t.to
      );
    }),
    (uo.prototype.map = function (t, e, n) {
      return this.type.map(t, this, e, n);
    }),
    (uo.widget = function (t, e, n) {
      return new uo(t, t, new lo(e, n));
    }),
    (uo.inline = function (t, e, n, r) {
      return new uo(t, e, new po(n, r));
    }),
    (uo.node = function (t, e, n, r) {
      return new uo(t, e, new ho(n, r));
    }),
    (fo.spec.get = function () {
      return this.type.spec;
    }),
    (fo.inline.get = function () {
      return this.type instanceof po;
    }),
    Object.defineProperties(uo.prototype, fo);
  const mo = [];
  var vo = {};
  const go = function (t, e) {
    (this.local = t.length ? t : mo), (this.children = e.length ? e : mo);
  };
  (go.create = function (t, e) {
    return e.length ? So(e, t, 0, vo) : yo;
  }),
    (go.prototype.find = function (t, e, n) {
      const r = [];
      return this.findInner(t == null ? 0 : t, e == null ? 1e9 : e, r, 0, n), r;
    }),
    (go.prototype.findInner = function (t, e, n, r, o) {
      for (let i = 0; i < this.local.length; i++) {
        const s = this.local[i];
        s.from <= e &&
          s.to >= t &&
          (!o || o(s.spec)) &&
          n.push(s.copy(s.from + r, s.to + r));
      }
      for (let a = 0; a < this.children.length; a += 3)
        if (this.children[a] < e && this.children[a + 1] > t) {
          const c = this.children[a] + 1;
          this.children[a + 2].findInner(t - c, e - c, n, r + c, o);
        }
    }),
    (go.prototype.map = function (t, e, n) {
      return this == yo || t.maps.length == 0
        ? this
        : this.mapInner(t, e, 0, 0, n || vo);
    }),
    (go.prototype.mapInner = function (t, e, n, r, o) {
      for (var i, s = 0; s < this.local.length; s++) {
        const a = this.local[s].map(t, n, r);
        a && a.type.valid(e, a)
          ? (i || (i = [])).push(a)
          : o.onRemove && o.onRemove(this.local[s].spec);
      }
      return this.children.length
        ? (function (t, e, n, r, o, i, s) {
            for (
              var a = t.slice(),
                c = function (t, e) {
                  let r = 0;
                  n.maps[t].forEach(function (t, n, i, s) {
                    for (var c = s - i - (n - t), l = 0; l < a.length; l += 3) {
                      const p = a[l + 1];
                      if (!(p < 0 || t > p + e - r)) {
                        const h = a[l] + e - r;
                        n >= h
                          ? (a[l + 1] = t <= h ? -2 : -1)
                          : i >= o && c && ((a[l] += c), (a[l + 1] += c));
                      }
                    }
                    r += c;
                  }),
                    (e = n.maps[t].map(e, -1)),
                    (p = e);
                },
                l = 0,
                p = i;
              l < n.maps.length;
              l++
            )
              c(l, p);
            for (var h = !1, u = 0; u < a.length; u += 3)
              if (a[u + 1] < 0) {
                if (a[u + 1] == -2) {
                  (h = !0), (a[u + 1] = -1);
                  continue;
                }
                const f = n.map(t[u] + i);
                const d = f - o;
                if (d < 0 || d >= r.content.size) {
                  h = !0;
                  continue;
                }
                const m = n.map(t[u + 1] + i, -1) - o;
                const v = r.content.findIndex(d);
                const g = v.index;
                const y = v.offset;
                const w = r.maybeChild(g);
                if (w && y == d && y + w.nodeSize == m) {
                  const b = a[u + 2].mapInner(n, w, f + 1, t[u] + i + 1, s);
                  b != yo
                    ? ((a[u] = d), (a[u + 1] = m), (a[u + 2] = b))
                    : ((a[u + 1] = -2), (h = !0));
                } else h = !0;
              }
            if (h) {
              const k = (function (t, e, n, r, o, i, s) {
                function a(t, e) {
                  for (let i = 0; i < t.local.length; i++) {
                    const c = t.local[i].map(r, o, e);
                    c ? n.push(c) : s.onRemove && s.onRemove(t.local[i].spec);
                  }
                  for (let l = 0; l < t.children.length; l += 3)
                    a(t.children[l + 2], t.children[l] + e + 1);
                }
                for (let c = 0; c < t.length; c += 3)
                  t[c + 1] == -1 && a(t[c + 2], e[c] + i + 1);
                return n;
              })(a, t, e, n, o, i, s);
              const x = So(k, r, 0, s);
              e = x.local;
              for (let S = 0; S < a.length; S += 3)
                a[S + 1] < 0 && (a.splice(S, 3), (S -= 3));
              for (let M = 0, C = 0; M < x.children.length; M += 3) {
                for (let O = x.children[M]; C < a.length && a[C] < O; ) C += 3;
                a.splice(
                  C,
                  0,
                  x.children[M],
                  x.children[M + 1],
                  x.children[M + 2],
                );
              }
            }
            return new go(e.sort(Mo), a);
          })(this.children, i || [], t, e, n, r, o)
        : i
        ? new go(i.sort(Mo), mo)
        : yo;
    }),
    (go.prototype.add = function (t, e) {
      return e.length
        ? this == yo
          ? go.create(t, e)
          : this.addInner(t, e, 0)
        : this;
    }),
    (go.prototype.addInner = function (t, e, n) {
      let r;
      const o = this;
      let i = 0;
      t.forEach(function (t, s) {
        let a;
        const c = s + n;
        if ((a = ko(e, t, c))) {
          for (r || (r = o.children.slice()); i < r.length && r[i] < s; )
            i += 3;
          r[i] == s
            ? (r[i + 2] = r[i + 2].addInner(t, a, c + 1))
            : r.splice(i, 0, s, s + t.nodeSize, So(a, t, c + 1, vo)),
            (i += 3);
        }
      });
      for (var s = bo(i ? xo(e) : e, -n), a = 0; a < s.length; a++)
        s[a].type.valid(t, s[a]) || s.splice(a--, 1);
      return new go(
        s.length ? this.local.concat(s).sort(Mo) : this.local,
        r || this.children,
      );
    }),
    (go.prototype.remove = function (t) {
      return t.length == 0 || this == yo ? this : this.removeInner(t, 0);
    }),
    (go.prototype.removeInner = function (t, e) {
      for (var n = this.children, r = this.local, o = 0; o < n.length; o += 3) {
        for (
          var i = void 0, s = n[o] + e, a = n[o + 1] + e, c = 0, l = void 0;
          c < t.length;
          c++
        )
          (l = t[c]) &&
            l.from > s &&
            l.to < a &&
            ((t[c] = null), (i || (i = [])).push(l));
        if (i) {
          n == this.children && (n = this.children.slice());
          const p = n[o + 2].removeInner(i, s + 1);
          p != yo ? (n[o + 2] = p) : (n.splice(o, 3), (o -= 3));
        }
      }
      if (r.length)
        for (let h = 0, u = void 0; h < t.length; h++)
          if ((u = t[h]))
            for (let f = 0; f < r.length; f++)
              r[f].eq(u, e) &&
                (r == this.local && (r = this.local.slice()), r.splice(f--, 1));
      return n == this.children && r == this.local
        ? this
        : r.length || n.length
        ? new go(r, n)
        : yo;
    }),
    (go.prototype.forChild = function (t, e) {
      if (this == yo) return this;
      if (e.isLeaf) return go.empty;
      for (var n, r, o = 0; o < this.children.length; o += 3)
        if (this.children[o] >= t) {
          this.children[o] == t && (n = this.children[o + 2]);
          break;
        }
      for (
        let i = t + 1, s = i + e.content.size, a = 0;
        a < this.local.length;
        a++
      ) {
        const c = this.local[a];
        if (c.from < s && c.to > i && c.type instanceof po) {
          const l = Math.max(i, c.from) - i;
          const p = Math.min(s, c.to) - i;
          l < p && (r || (r = [])).push(c.copy(l, p));
        }
      }
      if (r) {
        const h = new go(r.sort(Mo), mo);
        return n ? new wo([h, n]) : h;
      }
      return n || yo;
    }),
    (go.prototype.eq = function (t) {
      if (this == t) return !0;
      if (
        !(t instanceof go) ||
        this.local.length != t.local.length ||
        this.children.length != t.children.length
      )
        return !1;
      for (let e = 0; e < this.local.length; e++)
        if (!this.local[e].eq(t.local[e])) return !1;
      for (let n = 0; n < this.children.length; n += 3)
        if (
          this.children[n] != t.children[n] ||
          this.children[n + 1] != t.children[n + 1] ||
          !this.children[n + 2].eq(t.children[n + 2])
        )
          return !1;
      return !0;
    }),
    (go.prototype.locals = function (t) {
      return Co(this.localsInner(t));
    }),
    (go.prototype.localsInner = function (t) {
      if (this == yo) return mo;
      if (t.inlineContent || !this.local.some(po.is)) return this.local;
      for (var e = [], n = 0; n < this.local.length; n++)
        this.local[n].type instanceof po || e.push(this.local[n]);
      return e;
    }),
    (go.empty = new go([], [])),
    (go.removeOverlap = Co);
  var yo = go.empty;
  var wo = function (t) {
    this.members = t;
  };
  function bo(t, e) {
    if (!e || !t.length) return t;
    for (var n = [], r = 0; r < t.length; r++) {
      const o = t[r];
      n.push(new uo(o.from + e, o.to + e, o.type));
    }
    return n;
  }
  function ko(t, e, n) {
    if (e.isLeaf) return null;
    for (var r = n + e.nodeSize, o = null, i = 0, s = void 0; i < t.length; i++)
      (s = t[i]) &&
        s.from > n &&
        s.to < r &&
        ((o || (o = [])).push(s), (t[i] = null));
    return o;
  }
  function xo(t) {
    for (var e = [], n = 0; n < t.length; n++) null != t[n] && e.push(t[n]);
    return e;
  }
  function So(t, e, n, r) {
    const o = [];
    let i = !1;
    e.forEach(function (e, s) {
      const a = ko(t, e, s + n);
      if (a) {
        i = !0;
        const c = So(a, e, n + s + 1, r);
        c != yo && o.push(s, s + e.nodeSize, c);
      }
    });
    for (var s = bo(i ? xo(t) : t, -n).sort(Mo), a = 0; a < s.length; a++)
      s[a].type.valid(e, s[a]) ||
        (r.onRemove && r.onRemove(s[a].spec), s.splice(a--, 1));
    return s.length || o.length ? new go(s, o) : yo;
  }
  function Mo(t, e) {
    return t.from - e.from || t.to - e.to;
  }
  function Co(t) {
    for (var e = t, n = 0; n < e.length - 1; n++) {
      const r = e[n];
      if (r.from != r.to)
        for (let o = n + 1; o < e.length; o++) {
          const i = e[o];
          if (i.from != r.from) {
            i.from < r.to &&
              (e == t && (e = t.slice()),
              (e[n] = r.copy(r.from, i.from)),
              Oo(e, o, r.copy(i.from, r.to)));
            break;
          }
          i.to != r.to &&
            (e == t && (e = t.slice()),
            (e[o] = i.copy(i.from, r.to)),
            Oo(e, o + 1, i.copy(r.to, i.to)));
        }
    }
    return e;
  }
  function Oo(t, e, n) {
    for (; e < t.length && Mo(n, t[e]) > 0; ) e++;
    t.splice(e, 0, n);
  }
  function No(t) {
    const e = [];
    return (
      t.someProp('decorations', function (n) {
        const r = n(t.state);
        r && r != yo && e.push(r);
      }),
      t.cursorWrapper && e.push(go.create(t.state.doc, [t.cursorWrapper.deco])),
      wo.from(e)
    );
  }
  (wo.prototype.map = function (t, e) {
    const n = this.members.map(function (n) {
      return n.map(t, e, vo);
    });
    return wo.from(n);
  }),
    (wo.prototype.forChild = function (t, e) {
      if (e.isLeaf) return go.empty;
      for (var n = [], r = 0; r < this.members.length; r++) {
        const o = this.members[r].forChild(t, e);
        o != yo && (o instanceof wo ? (n = n.concat(o.members)) : n.push(o));
      }
      return wo.from(n);
    }),
    (wo.prototype.eq = function (t) {
      if (!(t instanceof wo) || t.members.length != this.members.length)
        return !1;
      for (let e = 0; e < this.members.length; e++)
        if (!this.members[e].eq(t.members[e])) return !1;
      return !0;
    }),
    (wo.prototype.locals = function (t) {
      for (var e, n = !0, r = 0; r < this.members.length; r++) {
        const o = this.members[r].localsInner(t);
        if (o.length)
          if (e) {
            n && ((e = e.slice()), (n = !1));
            for (let i = 0; i < o.length; i++) e.push(o[i]);
          } else e = o;
      }
      return e ? Co(n ? e : e.sort(Mo)) : mo;
    }),
    (wo.from = function (t) {
      switch (t.length) {
        case 0:
          return yo;
        case 1:
          return t[0];
        default:
          return new wo(t);
      }
    });
  const Do = {
    childList: !0,
    characterData: !0,
    characterDataOldValue: !0,
    attributes: !0,
    attributeOldValue: !0,
    subtree: !0,
  };
  const To = $e && qe <= 11;
  const Ao = function () {
    (this.anchorNode = null),
      (this.anchorOffset = 0),
      (this.focusNode = null),
      (this.focusOffset = 0);
  };
  (Ao.prototype.set = function (t) {
    (this.anchorNode = t.anchorNode),
      (this.anchorOffset = t.anchorOffset),
      (this.focusNode = t.focusNode),
      (this.focusOffset = t.focusOffset);
  }),
    (Ao.prototype.clear = function () {
      this.anchorNode = this.focusNode = null;
    }),
    (Ao.prototype.eq = function (t) {
      return (
        t.anchorNode == this.anchorNode &&
        t.anchorOffset == this.anchorOffset &&
        t.focusNode == this.focusNode &&
        t.focusOffset == this.focusOffset
      );
    });
  const Eo = function (t, e) {
    const n = this;
    (this.view = t),
      (this.handleDOMChange = e),
      (this.queue = []),
      (this.flushingSoon = -1),
      (this.observer = null),
      (this.currentSelection = new Ao()),
      (this.onCharData = null),
      (this.suppressingSelectionUpdates = !1),
      (this.observer =
        window.MutationObserver &&
        new window.MutationObserver(function (t) {
          for (let e = 0; e < t.length; e++) n.queue.push(t[e]);
          $e &&
          qe <= 11 &&
          t.some(function (t) {
            return (
              (t.type == 'childList' && t.removedNodes.length) ||
              (t.type == 'characterData' &&
                t.oldValue.length > t.target.nodeValue.length)
            );
          })
            ? n.flushSoon()
            : n.flush();
        })),
      To &&
        (this.onCharData = function (t) {
          n.queue.push({
            target: t.target,
            type: 'characterData',
            oldValue: t.prevValue,
          }),
            n.flushSoon();
        }),
      (this.onSelectionChange = this.onSelectionChange.bind(this));
  };
  (Eo.prototype.flushSoon = function () {
    const t = this;
    this.flushingSoon < 0 &&
      (this.flushingSoon = window.setTimeout(function () {
        (t.flushingSoon = -1), t.flush();
      }, 20));
  }),
    (Eo.prototype.forceFlush = function () {
      this.flushingSoon > -1 &&
        (window.clearTimeout(this.flushingSoon),
        (this.flushingSoon = -1),
        this.flush());
    }),
    (Eo.prototype.start = function () {
      this.observer &&
        (this.observer.takeRecords(), this.observer.observe(this.view.dom, Do)),
        this.onCharData &&
          this.view.dom.addEventListener(
            'DOMCharacterDataModified',
            this.onCharData,
          ),
        this.connectSelection();
    }),
    (Eo.prototype.stop = function () {
      const t = this;
      if (this.observer) {
        const e = this.observer.takeRecords();
        if (e.length) {
          for (let n = 0; n < e.length; n++) this.queue.push(e[n]);
          window.setTimeout(function () {
            return t.flush();
          }, 20);
        }
        this.observer.disconnect();
      }
      this.onCharData &&
        this.view.dom.removeEventListener(
          'DOMCharacterDataModified',
          this.onCharData,
        ),
        this.disconnectSelection();
    }),
    (Eo.prototype.connectSelection = function () {
      this.view.dom.ownerDocument.addEventListener(
        'selectionchange',
        this.onSelectionChange,
      );
    }),
    (Eo.prototype.disconnectSelection = function () {
      this.view.dom.ownerDocument.removeEventListener(
        'selectionchange',
        this.onSelectionChange,
      );
    }),
    (Eo.prototype.suppressSelectionUpdates = function () {
      const t = this;
      (this.suppressingSelectionUpdates = !0),
        setTimeout(function () {
          return (t.suppressingSelectionUpdates = !1);
        }, 50);
    }),
    (Eo.prototype.onSelectionChange = function () {
      if (pr(this.view)) {
        if (this.suppressingSelectionUpdates) return nr(this.view);
        if ($e && qe <= 11 && !this.view.state.selection.empty) {
          const t = this.view.domSelection();
          if (
            t.focusNode &&
            nn(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset)
          )
            return this.flushSoon();
        }
        this.flush();
      }
    }),
    (Eo.prototype.setCurSelection = function () {
      this.currentSelection.set(this.view.domSelection());
    }),
    (Eo.prototype.ignoreSelectionChange = function (t) {
      if (t.rangeCount == 0) return !0;
      const e = t.getRangeAt(0).commonAncestorContainer;
      const n = this.view.docView.nearestDesc(e);
      return n &&
        n.ignoreMutation({
          type: 'selection',
          target: e.nodeType == 3 ? e.parentNode : e,
        })
        ? (this.setCurSelection(), !0)
        : void 0;
    }),
    (Eo.prototype.flush = function () {
      const t = this.view;
      if (t.docView && !(this.flushingSoon > -1)) {
        let e = this.observer ? this.observer.takeRecords() : [];
        this.queue.length &&
          ((e = this.queue.concat(e)), (this.queue.length = 0));
        const n = t.domSelection();
        const r =
          !this.suppressingSelectionUpdates &&
          !this.currentSelection.eq(n) &&
          pr(t) &&
          !this.ignoreSelectionChange(n);
        let o = -1;
        let i = -1;
        let s = !1;
        const a = [];
        if (t.editable)
          for (let c = 0; c < e.length; c++) {
            const l = this.registerMutation(e[c], a);
            l &&
              ((o = o < 0 ? l.from : Math.min(l.from, o)),
              (i = i < 0 ? l.to : Math.max(l.to, i)),
              l.typeOver && (s = !0));
          }
        if (Le && a.length > 1) {
          const p = a.filter(function (t) {
            return t.nodeName == 'BR';
          });
          if (p.length == 2) {
            const h = p[0];
            const u = p[1];
            h.parentNode && h.parentNode.parentNode == u.parentNode
              ? u.remove()
              : h.remove();
          }
        }
        let f = null;
        o < 0 &&
        r &&
        t.input.lastFocus > Date.now() - 200 &&
        t.input.lastTouch < Date.now() - 300 &&
        cn(n) &&
        (f = tr(t)) &&
        f.eq(ce.near(t.state.doc.resolve(0), 1))
          ? ((t.input.lastFocus = 0),
            nr(t),
            this.currentSelection.set(n),
            t.scrollToSelection())
          : (o > -1 || r) &&
            (o > -1 &&
              (t.docView.markDirty(o, i),
              (function (t) {
                if (Io.has(t)) return;
                if (
                  (Io.set(t, null),
                  -1 !==
                    ['normal', 'nowrap', 'pre-line'].indexOf(
                      getComputedStyle(t.dom).whiteSpace,
                    ))
                ) {
                  if (((t.requiresGeckoHackNode = Le), Ro)) return;
                  console.warn(
                    "ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.",
                  ),
                    (Ro = !0);
                }
              })(t)),
            this.handleDOMChange(o, i, s, a),
            t.docView && t.docView.dirty
              ? t.updateState(t.state)
              : this.currentSelection.eq(n) || nr(t),
            this.currentSelection.set(n));
      }
    }),
    (Eo.prototype.registerMutation = function (t, e) {
      if (e.indexOf(t.target) > -1) return null;
      const n = this.view.docView.nearestDesc(t.target);
      if (
        t.type == 'attributes' &&
        (n == this.view.docView ||
          t.attributeName == 'contenteditable' ||
          (t.attributeName == 'style' &&
            !t.oldValue &&
            !t.target.getAttribute('style')))
      )
        return null;
      if (!n || n.ignoreMutation(t)) return null;
      if (t.type == 'childList') {
        for (let r = 0; r < t.addedNodes.length; r++) e.push(t.addedNodes[r]);
        if (
          n.contentDOM &&
          n.contentDOM != n.dom &&
          !n.contentDOM.contains(t.target)
        )
          return { from: n.posBefore, to: n.posAfter };
        let o = t.previousSibling;
        let i = t.nextSibling;
        if ($e && qe <= 11 && t.addedNodes.length)
          for (let s = 0; s < t.addedNodes.length; s++) {
            const a = t.addedNodes[s];
            const c = a.previousSibling;
            const l = a.nextSibling;
            (!c || Array.prototype.indexOf.call(t.addedNodes, c) < 0) &&
              (o = c),
              (!l || Array.prototype.indexOf.call(t.addedNodes, l) < 0) &&
                (i = l);
          }
        const p = o && o.parentNode == t.target ? Ye(o) + 1 : 0;
        const h = n.localPosFromDOM(t.target, p, -1);
        const u =
          i && i.parentNode == t.target ? Ye(i) : t.target.childNodes.length;
        return { from: h, to: n.localPosFromDOM(t.target, u, 1) };
      }
      return t.type == 'attributes'
        ? { from: n.posAtStart - n.border, to: n.posAtEnd + n.border }
        : {
            from: n.posAtStart,
            to: n.posAtEnd,
            typeOver: t.target.nodeValue == t.oldValue,
          };
    });
  var Io = new WeakMap();
  var Ro = !1;
  function zo(t) {
    const e = t.pmViewDesc;
    if (e) return e.parseRule();
    if (t.nodeName == 'BR' && t.parentNode) {
      if (Ke && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
        const n = document.createElement('div');
        return n.appendChild(document.createElement('li')), { skip: n };
      }
      if (
        t.parentNode.lastChild == t ||
        (Ke && /^(tr|table)$/i.test(t.parentNode.nodeName))
      )
        return { ignore: !0 };
    } else if (t.nodeName == 'IMG' && t.getAttribute('mark-placeholder'))
      return { ignore: !0 };
    return null;
  }
  function Po(t, e, n, o, i) {
    if (e < 0) {
      const s =
        t.input.lastSelectionTime > Date.now() - 50
          ? t.input.lastSelectionOrigin
          : null;
      const a = tr(t, s);
      if (a && !t.state.selection.eq(a)) {
        const c = t.state.tr.setSelection(a);
        s == 'pointer'
          ? c.setMeta('pointer', !0)
          : s == 'key' && c.scrollIntoView(),
          t.dispatch(c);
      }
    } else {
      const l = t.state.doc.resolve(e);
      const p = l.sharedDepth(n);
      (e = l.before(p + 1)), (n = t.state.doc.resolve(n).after(p + 1));
      let h;
      let u;
      const f = t.state.selection;
      const d = (function (t, e, n) {
        let r;
        const o = t.docView.parseRange(e, n);
        const i = o.node;
        const s = o.fromOffset;
        let a = o.toOffset;
        const c = o.from;
        const l = o.to;
        const p = t.domSelection();
        const h = p.anchorNode;
        if (
          (h &&
            t.dom.contains(h.nodeType == 1 ? h : h.parentNode) &&
            ((r = [{ node: h, offset: p.anchorOffset }]),
            cn(p) || r.push({ node: p.focusNode, offset: p.focusOffset })),
          Je && t.input.lastKeyCode === 8)
        )
          for (let u = a; u > s; u--) {
            const f = i.childNodes[u - 1];
            const d = f.pmViewDesc;
            if (f.nodeName == 'BR' && !d) {
              a = u;
              break;
            }
            if (!d || d.size) break;
          }
        const m = t.state.doc;
        const v = t.someProp('domParser') || nt.fromSchema(t.state.schema);
        const g = m.resolve(c);
        let y = null;
        const w = v.parse(i, {
          topNode: g.parent,
          topMatch: g.parent.contentMatchAt(g.index()),
          topOpen: !0,
          from: s,
          to: a,
          preserveWhitespace: 'pre' != g.parent.type.whitespace || 'full',
          findPositions: r,
          ruleFromNode: zo,
          context: g,
        });
        if (r && null != r[0].pos) {
          const b = r[0].pos;
          let k = r[1] && r[1].pos;
          k == null && (k = b), (y = { anchor: b + c, head: k + c });
        }
        return { doc: w, sel: y, from: c, to: l };
      })(t, e, n);
      const m = t.state.doc;
      const v = m.slice(d.from, d.to);
      t.input.lastKeyCode === 8 && Date.now() - 100 < t.input.lastKeyCodeTime
        ? ((h = t.state.selection.to), (u = 'end'))
        : ((h = t.state.selection.from), (u = 'start')),
        (t.input.lastKeyCode = null);
      let g = (function (t, e, n, r, o) {
        let i = t.findDiffStart(e, n);
        if (i == null) return null;
        const s = t.findDiffEnd(e, n + t.size, n + e.size);
        let a = s.a;
        let c = s.b;
        if (o == 'end') {
          r -= a + Math.max(0, i - Math.min(a, c)) - i;
        }
        if (a < i && t.size < e.size) {
          (c = (i -= r <= i && r >= a ? i - r : 0) + (c - a)), (a = i);
        } else if (c < i) {
          (a = (i -= r <= i && r >= c ? i - r : 0) + (a - c)), (c = i);
        }
        return { start: i, endA: a, endB: c };
      })(v.content, d.doc.content, d.from, h, u);
      if (
        ((He && t.input.lastIOSEnter > Date.now() - 225) || Ge) &&
        i.some(function (t) {
          return t.nodeName == 'DIV' || t.nodeName == 'P';
        }) &&
        (!g || g.endA >= g.endB) &&
        t.someProp('handleKeyDown', function (e) {
          return e(t, ln(13, 'Enter'));
        })
      )
        t.input.lastIOSEnter = 0;
      else {
        if (!g) {
          if (
            !(
              o &&
              f instanceof fe &&
              !f.empty &&
              f.$head.sameParent(f.$anchor)
            ) ||
            t.composing ||
            (d.sel && d.sel.anchor != d.sel.head)
          ) {
            if (d.sel) {
              const y = Bo(t, t.state.doc, d.sel);
              y &&
                !y.eq(t.state.selection) &&
                t.dispatch(t.state.tr.setSelection(y));
            }
            return;
          }
          g = { start: f.from, endA: f.to, endB: f.to };
        }
        if (
          Je &&
          t.cursorWrapper &&
          d.sel &&
          d.sel.anchor == t.cursorWrapper.deco.from &&
          d.sel.head == d.sel.anchor
        ) {
          const w = g.endB - g.start;
          d.sel = { anchor: d.sel.anchor + w, head: d.sel.anchor + w };
        }
        t.input.domChangeCount++,
          t.state.selection.from < t.state.selection.to &&
            g.start == g.endB &&
            t.state.selection instanceof fe &&
            (g.start > t.state.selection.from &&
            g.start <= t.state.selection.from + 2 &&
            t.state.selection.from >= d.from
              ? (g.start = t.state.selection.from)
              : g.endA < t.state.selection.to &&
                g.endA >= t.state.selection.to - 2 &&
                t.state.selection.to <= d.to &&
                ((g.endB += t.state.selection.to - g.endA),
                (g.endA = t.state.selection.to))),
          $e &&
            qe <= 11 &&
            g.endB == g.start + 1 &&
            g.endA == g.start &&
            g.start > d.from &&
            d.doc.textBetween(g.start - d.from - 1, g.start - d.from + 1) ==
              '  ' &&
            (g.start--, g.endA--, g.endB--);
        let b;
        const k = d.doc.resolveNoCache(g.start - d.from);
        let x = d.doc.resolveNoCache(g.endB - d.from);
        const S = m.resolve(g.start);
        const M =
          k.sameParent(x) && k.parent.inlineContent && S.end() >= g.endA;
        if (
          ((He &&
            t.input.lastIOSEnter > Date.now() - 225 &&
            (!M ||
              i.some(function (t) {
                return t.nodeName == 'DIV' || t.nodeName == 'P';
              }))) ||
            (!M &&
              k.pos < d.doc.content.size &&
              (b = ce.findFrom(d.doc.resolve(k.pos + 1), 1, !0)) &&
              b.head == x.pos)) &&
          t.someProp('handleKeyDown', function (e) {
            return e(t, ln(13, 'Enter'));
          })
        )
          t.input.lastIOSEnter = 0;
        else if (
          t.state.selection.anchor > g.start &&
          (function (t, e, n, r, o) {
            if (
              !r.parent.isTextblock ||
              n - e <= o.pos - r.pos ||
              _o(r, !0, !1) < o.pos
            )
              return !1;
            const i = t.resolve(e);
            if (i.parentOffset < i.parent.content.size || !i.parent.isTextblock)
              return !1;
            const s = t.resolve(_o(i, !0, !0));
            if (!s.parent.isTextblock || s.pos > n || _o(s, !0, !1) < n)
              return !1;
            return r.parent.content.cut(r.parentOffset).eq(s.parent.content);
          })(m, g.start, g.endA, k, x) &&
          t.someProp('handleKeyDown', function (e) {
            return e(t, ln(8, 'Backspace'));
          })
        )
          Ge && Je && t.domObserver.suppressSelectionUpdates();
        else {
          Je &&
            Ge &&
            g.endB == g.start &&
            (t.input.lastAndroidDelete = Date.now()),
            Ge &&
              !M &&
              k.start() != x.start() &&
              x.parentOffset == 0 &&
              k.depth == x.depth &&
              d.sel &&
              d.sel.anchor == d.sel.head &&
              d.sel.head == g.endA &&
              ((g.endB -= 2),
              (x = d.doc.resolveNoCache(g.endB - d.from)),
              setTimeout(function () {
                t.someProp('handleKeyDown', function (e) {
                  return e(t, ln(13, 'Enter'));
                });
              }, 20));
          let C;
          let O;
          let N;
          const D = g.start;
          const T = g.endA;
          if (M)
            if (k.pos == x.pos)
              $e &&
                qe <= 11 &&
                k.parentOffset == 0 &&
                (t.domObserver.suppressSelectionUpdates(),
                setTimeout(function () {
                  return nr(t);
                }, 20)),
                (C = t.state.tr.delete(D, T)),
                (O = m.resolve(g.start).marksAcross(m.resolve(g.endA)));
            else if (
              g.endA == g.endB &&
              (N = (function (t, e) {
                for (
                  var n,
                    o,
                    i,
                    s = t.firstChild.marks,
                    a = e.firstChild.marks,
                    c = s,
                    l = a,
                    p = 0;
                  p < a.length;
                  p++
                )
                  c = a[p].removeFromSet(c);
                for (let h = 0; h < s.length; h++) l = s[h].removeFromSet(l);
                if (c.length == 1 && l.length == 0)
                  (o = c[0]),
                    (n = 'add'),
                    (i = function (t) {
                      return t.mark(o.addToSet(t.marks));
                    });
                else {
                  if (0 != c.length || 1 != l.length) return null;
                  (o = l[0]),
                    (n = 'remove'),
                    (i = function (t) {
                      return t.mark(o.removeFromSet(t.marks));
                    });
                }
                for (var u = [], f = 0; f < e.childCount; f++)
                  u.push(i(e.child(f)));
                if (r.from(u).eq(t)) return { mark: o, type: n };
              })(
                k.parent.content.cut(k.parentOffset, x.parentOffset),
                S.parent.content.cut(S.parentOffset, g.endA - S.start()),
              ))
            )
              (C = t.state.tr),
                N.type == 'add'
                  ? C.addMark(D, T, N.mark)
                  : C.removeMark(D, T, N.mark);
            else if (
              k.parent.child(k.index()).isText &&
              k.index() == x.index() - (x.textOffset ? 0 : 1)
            ) {
              const A = k.parent.textBetween(k.parentOffset, x.parentOffset);
              if (
                t.someProp('handleTextInput', function (e) {
                  return e(t, D, T, A);
                })
              )
                return;
              C = t.state.tr.insertText(A, D, T);
            }
          if (
            (C ||
              (C = t.state.tr.replace(
                D,
                T,
                d.doc.slice(g.start - d.from, g.endB - d.from),
              )),
            d.sel)
          ) {
            const E = Bo(t, C.doc, d.sel);
            E &&
              !(
                (Je &&
                  Ge &&
                  t.composing &&
                  E.empty &&
                  (g.start != g.endB ||
                    t.input.lastAndroidDelete < Date.now() - 100) &&
                  (E.head == D || E.head == C.mapping.map(T) - 1)) ||
                ($e && E.empty && E.head == D)
              ) &&
              C.setSelection(E);
          }
          O && C.ensureMarks(O), t.dispatch(C.scrollIntoView());
        }
      }
    }
  }
  function Bo(t, e, n) {
    return Math.max(n.anchor, n.head) > e.content.size
      ? null
      : lr(t, e.resolve(n.anchor), e.resolve(n.head));
  }
  function _o(t, e, n) {
    for (
      var r = t.depth, o = e ? t.end() : t.pos;
      r > 0 && (e || t.indexAfter(r) == t.node(r).childCount);

    )
      r--, o++, (e = !1);
    if (n)
      for (let i = t.node(r).maybeChild(t.indexAfter(r)); i && !i.isLeaf; )
        (i = i.firstChild), o++;
    return o;
  }
  const Vo = Cr;
  const Fo = Or;
  const $o = no;
  const qo = function (t, e) {
    const n = this;
    (this._root = null),
      (this.focused = !1),
      (this.trackWrites = null),
      (this.mounted = !1),
      (this.markCursor = null),
      (this.cursorWrapper = null),
      (this.lastSelectedViewDesc = void 0),
      (this.input = new Fr()),
      (this.prevDirectPlugins = []),
      (this.pluginViews = []),
      (this.requiresGeckoHackNode = !1),
      (this.dragging = null),
      (this._props = e),
      (this.state = e.state),
      (this.directPlugins = e.plugins || []),
      this.directPlugins.forEach(Ho),
      (this.dispatch = this.dispatch.bind(this)),
      (this.dom = (t && t.mount) || document.createElement('div')),
      t &&
        (t.appendChild
          ? t.appendChild(this.dom)
          : typeof t === 'function'
          ? t(this.dom)
          : t.mount && (this.mounted = !0)),
      (this.editable = Wo(this)),
      Jo(this),
      (this.nodeViews = Ko(this)),
      (this.docView = Vn(this.state.doc, jo(this), No(this), this.dom, this)),
      (this.domObserver = new Eo(this, function (t, e, r, o) {
        return Po(n, t, e, r, o);
      })),
      this.domObserver.start(),
      (function (t) {
        const e = function (e) {
          const n = Br[e];
          t.dom.addEventListener(
            e,
            (t.input.eventHandlers[e] = function (e) {
              !(function (t, e) {
                if (!e.bubbles) return !0;
                if (e.defaultPrevented) return !1;
                for (let n = e.target; n != t.dom; n = n.parentNode)
                  if (
                    !n ||
                    n.nodeType == 11 ||
                    (n.pmViewDesc && n.pmViewDesc.stopEvent(e))
                  )
                    return !1;
                return !0;
              })(t, e) ||
                Lr(t, e) ||
                (!t.editable && e.type in _r) ||
                n(t, e);
            }),
            Vr[e] ? { passive: !0 } : void 0,
          );
        };
        for (const n in Br) e(n);
        Ke &&
          t.dom.addEventListener('input', function () {
            return null;
          }),
          qr(t);
      })(this),
      this.updatePluginViews();
  };
  const Lo = {
    composing: { configurable: !0 },
    props: { configurable: !0 },
    root: { configurable: !0 },
    isDestroyed: { configurable: !0 },
  };
  function jo(t) {
    const e = Object.create(null);
    return (
      (e.class = 'ProseMirror'),
      (e.contenteditable = String(t.editable)),
      (e.translate = 'no'),
      t.someProp('attributes', function (n) {
        if ((typeof n === 'function' && (n = n(t.state)), n))
          for (const r in n)
            r == 'class' && (e.class += ' ' + n[r]),
              r == 'style'
                ? (e.style = (e.style ? e.style + ';' : '') + n[r])
                : e[r] ||
                  r == 'contenteditable' ||
                  r == 'nodeName' ||
                  (e[r] = String(n[r]));
      }),
      [uo.node(0, t.state.doc.content.size, e)]
    );
  }
  function Jo(t) {
    if (t.markCursor) {
      const e = document.createElement('img');
      (e.className = 'ProseMirror-separator'),
        e.setAttribute('mark-placeholder', 'true'),
        e.setAttribute('alt', ''),
        (t.cursorWrapper = {
          dom: e,
          deco: uo.widget(t.state.selection.head, e, {
            raw: !0,
            marks: t.markCursor,
          }),
        });
    } else t.cursorWrapper = null;
  }
  function Wo(t) {
    return !t.someProp('editable', function (e) {
      return !1 === e(t.state);
    });
  }
  function Ko(t) {
    const e = Object.create(null);
    function n(t) {
      for (const n in t) Object.hasOwn(e, n) || (e[n] = t[n]);
    }
    return t.someProp('nodeViews', n), t.someProp('markViews', n), e;
  }
  function Ho(t) {
    if (t.spec.state || t.spec.filterTransaction || t.spec.appendTransaction)
      throw new RangeError(
        'Plugins passed directly to the view must not have a state component',
      );
  }
  (Lo.composing.get = function () {
    return this.input.composing;
  }),
    (Lo.props.get = function () {
      if (this._props.state != this.state) {
        const t = this._props;
        for (const e in ((this._props = {}), t)) this._props[e] = t[e];
        this._props.state = this.state;
      }
      return this._props;
    }),
    (qo.prototype.update = function (t) {
      t.handleDOMEvents != this._props.handleDOMEvents && qr(this),
        (this._props = t),
        t.plugins && (t.plugins.forEach(Ho), (this.directPlugins = t.plugins)),
        this.updateStateInner(t.state, !0);
    }),
    (qo.prototype.setProps = function (t) {
      const e = {};
      for (const n in this._props) e[n] = this._props[n];
      for (const r in ((e.state = this.state), t)) e[r] = t[r];
      this.update(e);
    }),
    (qo.prototype.updateState = function (t) {
      this.updateStateInner(t, this.state.plugins != t.plugins);
    }),
    (qo.prototype.updateStateInner = function (t, e) {
      const n = this.state;
      let r = !1;
      let o = !1;
      if (
        (t.storedMarks && this.composing && (eo(this), (o = !0)),
        (this.state = t),
        e)
      ) {
        const i = Ko(this);
        (function (t, e) {
          let n = 0;
          let r = 0;
          for (const o in t) {
            if (t[o] != e[o]) return !0;
            n++;
          }
          for (const i in e) r++;
          return n != r;
        })(i, this.nodeViews) && ((this.nodeViews = i), (r = !0)),
          qr(this);
      }
      (this.editable = Wo(this)), Jo(this);
      const s = No(this);
      const a = jo(this);
      const c = e
        ? 'reset'
        : t.scrollToSelection > n.scrollToSelection
        ? 'to selection'
        : 'preserve';
      const l = r || !this.docView.matchesNode(t.doc, a, s);
      (!l && t.selection.eq(n.selection)) || (o = !0);
      let p;
      let h;
      let u;
      let f;
      let d;
      let m;
      let v;
      let g;
      const y =
        c == 'preserve' &&
        o &&
        this.dom.style.overflowAnchor == null &&
        (function (t) {
          for (
            var e,
              n,
              r = t.dom.getBoundingClientRect(),
              o = Math.max(0, r.top),
              i = (r.left + r.right) / 2,
              s = o + 1;
            s < Math.min(innerHeight, r.bottom);
            s += 5
          ) {
            const a = t.root.elementFromPoint(i, s);
            if (a && a != t.dom && t.dom.contains(a)) {
              const c = a.getBoundingClientRect();
              if (c.top >= o - 20) {
                (e = a), (n = c.top);
                break;
              }
            }
          }
          return { refDOM: e, refTop: n, stack: dn(t.dom) };
        })(this);
      if (o) {
        this.domObserver.stop();
        let w =
          l &&
          ($e || Je) &&
          !this.composing &&
          !n.selection.empty &&
          !t.selection.empty &&
          ((p = n.selection),
          (h = t.selection),
          (u = Math.min(
            p.$anchor.sharedDepth(p.head),
            h.$anchor.sharedDepth(h.head),
          )),
          p.$anchor.start(u) != h.$anchor.start(u));
        if (l) {
          const b = Je
            ? (this.trackWrites = this.domSelection().focusNode)
            : null;
          (!r && this.docView.update(t.doc, a, s, this)) ||
            (this.docView.updateOuterDeco([]),
            this.docView.destroy(),
            (this.docView = Vn(t.doc, a, s, this.dom, this))),
            b && !this.trackWrites && (w = !0);
        }
        w ||
        !(
          this.input.mouseDown &&
          this.domObserver.currentSelection.eq(this.domSelection()) &&
          (function (t) {
            const e = t.docView.domFromPos(t.state.selection.anchor, 0);
            const n = t.domSelection();
            return nn(e.node, e.offset, n.anchorNode, n.anchorOffset);
          })(this)
        )
          ? nr(this, w)
          : (ar(this, t.selection), this.domObserver.setCurSelection()),
          this.domObserver.start();
      }
      this.updatePluginViews(n),
        c == 'reset'
          ? (this.dom.scrollTop = 0)
          : c == 'to selection'
          ? this.scrollToSelection()
          : y &&
            ((d = (f = y).refDOM),
            (m = f.refTop),
            (v = f.stack),
            (g = d ? d.getBoundingClientRect().top : 0),
            mn(v, g == 0 ? 0 : g - m));
    }),
    (qo.prototype.scrollToSelection = function () {
      const t = this;
      const e = this.domSelection().focusNode;
      if (
        this.someProp('handleScrollToSelection', function (e) {
          return e(t);
        })
      );
      else if (this.state.selection instanceof me) {
        const n = this.docView.domAfterPos(this.state.selection.from);
        n.nodeType == 1 && fn(this, n.getBoundingClientRect(), e);
      } else fn(this, this.coordsAtPos(this.state.selection.head, 1), e);
    }),
    (qo.prototype.destroyPluginViews = function () {
      for (var t; (t = this.pluginViews.pop()); ) t.destroy && t.destroy();
    }),
    (qo.prototype.updatePluginViews = function (t) {
      if (
        t &&
        t.plugins == this.state.plugins &&
        this.directPlugins == this.prevDirectPlugins
      )
        for (let e = 0; e < this.pluginViews.length; e++) {
          const n = this.pluginViews[e];
          n.update && n.update(this, t);
        }
      else {
        (this.prevDirectPlugins = this.directPlugins),
          this.destroyPluginViews();
        for (let r = 0; r < this.directPlugins.length; r++) {
          const o = this.directPlugins[r];
          o.spec.view && this.pluginViews.push(o.spec.view(this));
        }
        for (let i = 0; i < this.state.plugins.length; i++) {
          const s = this.state.plugins[i];
          s.spec.view && this.pluginViews.push(s.spec.view(this));
        }
      }
    }),
    (qo.prototype.someProp = function (t, e) {
      let n;
      const r = this._props && this._props[t];
      if (null != r && (n = e ? e(r) : r)) return n;
      for (let o = 0; o < this.directPlugins.length; o++) {
        const i = this.directPlugins[o].props[t];
        if (null != i && (n = e ? e(i) : i)) return n;
      }
      const s = this.state.plugins;
      if (s)
        for (let a = 0; a < s.length; a++) {
          const c = s[a].props[t];
          if (null != c && (n = e ? e(c) : c)) return n;
        }
    }),
    (qo.prototype.hasFocus = function () {
      return this.root.activeElement == this.dom;
    }),
    (qo.prototype.focus = function () {
      this.domObserver.stop(),
        this.editable &&
          (function (t) {
            if (t.setActive) return t.setActive();
            if (vn) return t.focus(vn);
            const e = dn(t);
            t.focus(
              vn == null
                ? {
                    get preventScroll() {
                      return (vn = { preventScroll: !0 }), !0;
                    },
                  }
                : void 0,
            ),
              vn || ((vn = !1), mn(e, 0));
          })(this.dom),
        nr(this),
        this.domObserver.start();
    }),
    (Lo.root.get = function () {
      const t = this;
      const e = this._root;
      if (e == null)
        for (
          let n = function (e) {
              if (e.nodeType == 9 || (e.nodeType == 11 && e.host))
                return (
                  e.getSelection ||
                    (Object.getPrototypeOf(e).getSelection = function () {
                      return e.ownerDocument.getSelection();
                    }),
                  { v: (t._root = e) }
                );
            },
            r = t.dom.parentNode;
          r;
          r = r.parentNode
        ) {
          const o = n(r);
          if (o) return o.v;
        }
      return e || document;
    }),
    (qo.prototype.posAtCoords = function (t) {
      return bn(this, t);
    }),
    (qo.prototype.coordsAtPos = function (t, e) {
      return void 0 === e && (e = 1), Sn(this, t, e);
    }),
    (qo.prototype.domAtPos = function (t, e) {
      return void 0 === e && (e = 0), this.docView.domFromPos(t, e);
    }),
    (qo.prototype.nodeDOM = function (t) {
      const e = this.docView.descAt(t);
      return e ? e.nodeDOM : null;
    }),
    (qo.prototype.posAtDOM = function (t, e, n) {
      void 0 === n && (n = -1);
      const r = this.docView.posFromDOM(t, e, n);
      if (r == null) throw new RangeError('DOM position not inside the editor');
      return r;
    }),
    (qo.prototype.endOfTextblock = function (t, e) {
      return En(this, e || this.state, t);
    }),
    (qo.prototype.destroy = function () {
      this.docView &&
        (!(function (t) {
          for (const e in (t.domObserver.stop(), t.input.eventHandlers))
            t.dom.removeEventListener(e, t.input.eventHandlers[e]);
          clearTimeout(t.input.composingTimeout),
            clearTimeout(t.input.lastIOSEnterFallbackTimeout);
        })(this),
        this.destroyPluginViews(),
        this.mounted
          ? (this.docView.update(this.state.doc, [], No(this), this),
            (this.dom.textContent = ''))
          : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom),
        this.docView.destroy(),
        (this.docView = null));
    }),
    (Lo.isDestroyed.get = function () {
      return this.docView == null;
    }),
    (qo.prototype.dispatchEvent = function (t) {
      return (function (t, e) {
        Lr(t, e) ||
          !Br[e.type] ||
          (!t.editable && e.type in _r) ||
          Br[e.type](t, e);
      })(this, t);
    }),
    (qo.prototype.dispatch = function (t) {
      const e = this._props.dispatchTransaction;
      e ? e.call(this, t) : this.updateState(this.state.apply(t));
    }),
    (qo.prototype.domSelection = function () {
      return this.root.getSelection();
    }),
    Object.defineProperties(qo.prototype, Lo);
  const Uo = Object.freeze({
    __proto__: null,
    Decoration: uo,
    DecorationSet: go,
    EditorView: qo,
    __endComposition: $o,
    __parseFromClipboard: Fo,
    __serializeForClipboard: Vo,
  });
  const Go = {
    8: 'Backspace',
    9: 'Tab',
    10: 'Enter',
    12: 'NumLock',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    44: 'PrintScreen',
    45: 'Insert',
    46: 'Delete',
    59: ';',
    61: '=',
    91: 'Meta',
    92: 'Meta',
    106: '*',
    107: '+',
    108: ',',
    109: '-',
    110: '.',
    111: '/',
    144: 'NumLock',
    145: 'ScrollLock',
    160: 'Shift',
    161: 'Shift',
    162: 'Control',
    163: 'Control',
    164: 'Alt',
    165: 'Alt',
    173: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
  };
  const Qo = {
    48: ')',
    49: '!',
    50: '@',
    51: '#',
    52: '$',
    53: '%',
    54: '^',
    55: '&',
    56: '*',
    57: '(',
    59: ':',
    61: '+',
    173: '_',
    186: ':',
    187: '+',
    188: '<',
    189: '_',
    190: '>',
    191: '?',
    192: '~',
    219: '{',
    220: '|',
    221: '}',
    222: '"',
  };
  const Xo =
    'undefined' !== typeof navigator &&
    /Chrome\/(\d+)/.exec(navigator.userAgent);
  'undefined' !== typeof navigator && /Gecko\/\d+/.test(navigator.userAgent);
  for (
    var Yo = 'undefined' !== typeof navigator && /Mac/.test(navigator.platform),
      Zo =
        'undefined' !== typeof navigator &&
        /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(
          navigator.userAgent,
        ),
      ti = Yo || (Xo && Number(Xo[1]) < 57),
      ei = 0;
    ei < 10;
    ei++
  )
    Go[48 + ei] = Go[96 + ei] = String(ei);
  for (ei = 1; ei <= 24; ei++) Go[ei + 111] = 'F' + ei;
  for (ei = 65; ei <= 90; ei++)
    (Go[ei] = String.fromCharCode(ei + 32)), (Qo[ei] = String.fromCharCode(ei));
  for (const ni in Go) Qo.hasOwnProperty(ni) || (Qo[ni] = Go[ni]);
  const ri =
    'undefined' !== typeof navigator &&
    /Mac|iP(hone|[oa]d)/.test(navigator.platform);
  function oi(t) {
    let e;
    let n;
    let r;
    let o;
    const i = t.split(/-(?!$)/);
    let s = i[i.length - 1];
    s == 'Space' && (s = ' ');
    for (let a = 0; a < i.length - 1; a++) {
      const c = i[a];
      if (/^(cmd|meta|m)$/i.test(c)) o = !0;
      else if (/^a(lt)?$/i.test(c)) e = !0;
      else if (/^(c|ctrl|control)$/i.test(c)) n = !0;
      else if (/^s(hift)?$/i.test(c)) r = !0;
      else {
        if (!/^mod$/i.test(c))
          throw new Error('Unrecognized modifier name: ' + c);
        ri ? (o = !0) : (n = !0);
      }
    }
    return (
      e && (s = 'Alt-' + s),
      n && (s = 'Ctrl-' + s),
      o && (s = 'Meta-' + s),
      r && (s = 'Shift-' + s),
      s
    );
  }
  function ii(t, e, n) {
    return (
      e.altKey && (t = 'Alt-' + t),
      e.ctrlKey && (t = 'Ctrl-' + t),
      e.metaKey && (t = 'Meta-' + t),
      !1 !== n && e.shiftKey && (t = 'Shift-' + t),
      t
    );
  }
  function si(t) {
    return new Te({ props: { handleKeyDown: ai(t) } });
  }
  function ai(t) {
    const e = (function (t) {
      const e = Object.create(null);
      for (const n in t) e[oi(n)] = t[n];
      return e;
    })(t);
    return function (t, n) {
      let r;
      const o = (function (t) {
        let e =
          (!(
            (ti && (t.ctrlKey || t.altKey || t.metaKey)) ||
            (Zo && t.shiftKey && t.key && t.key.length == 1) ||
            t.key == 'Unidentified'
          ) &&
            t.key) ||
          (t.shiftKey ? Qo : Go)[t.keyCode] ||
          t.key ||
          'Unidentified';
        return (
          e == 'Esc' && (e = 'Escape'),
          e == 'Del' && (e = 'Delete'),
          e == 'Left' && (e = 'ArrowLeft'),
          e == 'Up' && (e = 'ArrowUp'),
          e == 'Right' && (e = 'ArrowRight'),
          e == 'Down' && (e = 'ArrowDown'),
          e
        );
      })(n);
      const i = o.length == 1 && ' ' != o;
      const s = e[ii(o, n, !i)];
      if (s && s(t.state, t.dispatch, t)) return !0;
      if (
        i &&
        (n.shiftKey || n.altKey || n.metaKey || o.charCodeAt(0) > 127) &&
        (r = Go[n.keyCode]) &&
        r != o
      ) {
        const a = e[ii(r, n, !0)];
        if (a && a(t.state, t.dispatch, t)) return !0;
      } else if (i && n.shiftKey) {
        const c = e[ii(o, n, !0)];
        if (c && c(t.state, t.dispatch, t)) return !0;
      }
      return !1;
    };
  }
  const ci = Object.freeze({ __proto__: null, keydownHandler: ai, keymap: si });
  const li = function (t, e) {
    let n;
    (this.match = t),
      (this.match = t),
      (this.handler =
        typeof e === 'string'
          ? ((n = e),
            function (t, e, r, o) {
              let i = n;
              if (e[1]) {
                const s = e[0].lastIndexOf(e[1]);
                i += e[0].slice(s + e[1].length);
                const a = (r += s) - o;
                a > 0 && ((i = e[0].slice(s - a, s) + i), (r = o));
              }
              return t.tr.insertText(i, r, o);
            })
          : e);
  };
  function pi(t) {
    const e = t.rules;
    var n = new Te({
      state: {
        init: function () {
          return null;
        },
        apply: function (t, e) {
          const n = t.getMeta(this);
          return n || (t.selectionSet || t.docChanged ? null : e);
        },
      },
      props: {
        handleTextInput: function (t, r, o, i) {
          return hi(t, r, o, i, e, n);
        },
        handleDOMEvents: {
          compositionend: function (t) {
            setTimeout(function () {
              const r = t.state.selection.$cursor;
              r && hi(t, r.pos, r.pos, '', e, n);
            });
          },
        },
      },
      isInputRules: !0,
    });
    return n;
  }
  function hi(t, e, n, r, o, i) {
    if (t.composing) return !1;
    const s = t.state;
    const a = s.doc.resolve(e);
    if (a.parent.type.spec.code) return !1;
    for (
      let c =
          a.parent.textBetween(
            Math.max(0, a.parentOffset - 500),
            a.parentOffset,
            null,
            '￼',
          ) + r,
        l = 0;
      l < o.length;
      l++
    ) {
      const p = o[l].match.exec(c);
      const h = p && o[l].handler(s, p, e - (p[0].length - r.length), n);
      if (h)
        return (
          t.dispatch(h.setMeta(i, { transform: h, from: e, to: n, text: r })),
          !0
        );
    }
    return !1;
  }
  const ui = function (t, e) {
    for (let n = t.plugins, r = 0; r < n.length; r++) {
      const o = n[r];
      let i = void 0;
      if (o.spec.isInputRules && (i = o.getState(t))) {
        if (e) {
          for (
            var s = t.tr, a = i.transform, c = a.steps.length - 1;
            c >= 0;
            c--
          )
            s.step(a.steps[c].invert(a.docs[c]));
          if (i.text) {
            const l = s.doc.resolve(i.from).marks();
            s.replaceWith(i.from, i.to, t.schema.text(i.text, l));
          } else s.delete(i.from, i.to);
          e(s);
        }
        return !0;
      }
    }
    return !1;
  };
  const fi = new li(/--$/, '—');
  const di = new li(/\.\.\.$/, '…');
  const mi = new li(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, '“');
  const vi = new li(/"$/, '”');
  const gi = new li(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, '‘');
  const yi = new li(/'$/, '’');
  const wi = [mi, vi, gi, yi];
  function bi(t, e, n, r) {
    return (
      void 0 === n && (n = null),
      new li(t, function (t, o, i, s) {
        const a = n instanceof Function ? n(o) : n;
        const c = t.tr.delete(i, s);
        const l = c.doc.resolve(i).blockRange();
        const p = l && Bt(l, e, a);
        if (!p) return null;
        c.wrap(l, p);
        const h = c.doc.resolve(i - 1).nodeBefore;
        return (
          h &&
            h.type == e &&
            Ft(c.doc, i - 1) &&
            (!r || r(o, h)) &&
            c.join(i - 1),
          c
        );
      })
    );
  }
  function ki(t, e, n) {
    return (
      void 0 === n && (n = null),
      new li(t, function (t, r, o, i) {
        const s = t.doc.resolve(o);
        const a = n instanceof Function ? n(r) : n;
        return s.node(-1).canReplaceWith(s.index(-1), s.indexAfter(-1), e)
          ? t.tr.delete(o, i).setBlockType(o, o, e, a)
          : null;
      })
    );
  }
  const xi = Object.freeze({
    __proto__: null,
    InputRule: li,
    closeDoubleQuote: vi,
    closeSingleQuote: yi,
    ellipsis: di,
    emDash: fi,
    inputRules: pi,
    openDoubleQuote: mi,
    openSingleQuote: gi,
    smartQuotes: wi,
    textblockTypeInputRule: ki,
    undoInputRule: ui,
    wrappingInputRule: bi,
  });
  const Si = 200;
  const Mi = function () {};
  (Mi.prototype.append = function (t) {
    return t.length
      ? ((t = Mi.from(t)),
        (!this.length && t) ||
          (t.length < Si && this.leafAppend(t)) ||
          (this.length < Si && t.leafPrepend(this)) ||
          this.appendInner(t))
      : this;
  }),
    (Mi.prototype.prepend = function (t) {
      return t.length ? Mi.from(t).append(this) : this;
    }),
    (Mi.prototype.appendInner = function (t) {
      return new Oi(this, t);
    }),
    (Mi.prototype.slice = function (t, e) {
      return (
        void 0 === t && (t = 0),
        void 0 === e && (e = this.length),
        t >= e
          ? Mi.empty
          : this.sliceInner(Math.max(0, t), Math.min(this.length, e))
      );
    }),
    (Mi.prototype.get = function (t) {
      if (!(t < 0 || t >= this.length)) return this.getInner(t);
    }),
    (Mi.prototype.forEach = function (t, e, n) {
      void 0 === e && (e = 0),
        void 0 === n && (n = this.length),
        e <= n
          ? this.forEachInner(t, e, n, 0)
          : this.forEachInvertedInner(t, e, n, 0);
    }),
    (Mi.prototype.map = function (t, e, n) {
      void 0 === e && (e = 0), void 0 === n && (n = this.length);
      const r = [];
      return (
        this.forEach(
          function (e, n) {
            return r.push(t(e, n));
          },
          e,
          n,
        ),
        r
      );
    }),
    (Mi.from = function (t) {
      return t instanceof Mi ? t : t && t.length ? new Ci(t) : Mi.empty;
    });
  var Ci = (function (t) {
    function e(e) {
      t.call(this), (this.values = e);
    }
    t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e);
    const n = { length: { configurable: !0 }, depth: { configurable: !0 } };
    return (
      (e.prototype.flatten = function () {
        return this.values;
      }),
      (e.prototype.sliceInner = function (t, n) {
        return t == 0 && n == this.length
          ? this
          : new e(this.values.slice(t, n));
      }),
      (e.prototype.getInner = function (t) {
        return this.values[t];
      }),
      (e.prototype.forEachInner = function (t, e, n, r) {
        for (let o = e; o < n; o++)
          if (!1 === t(this.values[o], r + o)) return !1;
      }),
      (e.prototype.forEachInvertedInner = function (t, e, n, r) {
        for (let o = e - 1; o >= n; o--)
          if (!1 === t(this.values[o], r + o)) return !1;
      }),
      (e.prototype.leafAppend = function (t) {
        if (this.length + t.length <= Si)
          return new e(this.values.concat(t.flatten()));
      }),
      (e.prototype.leafPrepend = function (t) {
        if (this.length + t.length <= Si)
          return new e(t.flatten().concat(this.values));
      }),
      (n.length.get = function () {
        return this.values.length;
      }),
      (n.depth.get = function () {
        return 0;
      }),
      Object.defineProperties(e.prototype, n),
      e
    );
  })(Mi);
  Mi.empty = new Ci([]);
  var Oi = (function (t) {
    function e(e, n) {
      t.call(this),
        (this.left = e),
        (this.right = n),
        (this.length = e.length + n.length),
        (this.depth = Math.max(e.depth, n.depth) + 1);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.flatten = function () {
        return this.left.flatten().concat(this.right.flatten());
      }),
      (e.prototype.getInner = function (t) {
        return t < this.left.length
          ? this.left.get(t)
          : this.right.get(t - this.left.length);
      }),
      (e.prototype.forEachInner = function (t, e, n, r) {
        const o = this.left.length;
        return (
          !(e < o && !1 === this.left.forEachInner(t, e, Math.min(n, o), r)) &&
          !(
            n > o &&
            !1 ===
              this.right.forEachInner(
                t,
                Math.max(e - o, 0),
                Math.min(this.length, n) - o,
                r + o,
              )
          ) &&
          void 0
        );
      }),
      (e.prototype.forEachInvertedInner = function (t, e, n, r) {
        const o = this.left.length;
        return (
          !(
            e > o &&
            !1 ===
              this.right.forEachInvertedInner(
                t,
                e - o,
                Math.max(n, o) - o,
                r + o,
              )
          ) &&
          !(
            n < o &&
            !1 === this.left.forEachInvertedInner(t, Math.min(e, o), n, r)
          ) &&
          void 0
        );
      }),
      (e.prototype.sliceInner = function (t, e) {
        if (t == 0 && e == this.length) return this;
        const n = this.left.length;
        return e <= n
          ? this.left.slice(t, e)
          : t >= n
          ? this.right.slice(t - n, e - n)
          : this.left.slice(t, n).append(this.right.slice(0, e - n));
      }),
      (e.prototype.leafAppend = function (t) {
        const n = this.right.leafAppend(t);
        if (n) return new e(this.left, n);
      }),
      (e.prototype.leafPrepend = function (t) {
        const n = this.left.leafPrepend(t);
        if (n) return new e(n, this.right);
      }),
      (e.prototype.appendInner = function (t) {
        return this.left.depth >= Math.max(this.right.depth, t.depth) + 1
          ? new e(this.left, new e(this.right, t))
          : new e(this, t);
      }),
      e
    );
  })(Mi);
  const Ni = Mi;
  const Di = function (t, e) {
    (this.items = t), (this.eventCount = e);
  };
  (Di.prototype.popEvent = function (t, e) {
    const n = this;
    if (this.eventCount == 0) return null;
    for (var r, o, i = this.items.length; ; i--) {
      if (this.items.get(i - 1).selection) {
        --i;
        break;
      }
    }
    e && ((r = this.remapping(i, this.items.length)), (o = r.maps.length));
    let s;
    let a;
    const c = t.tr;
    const l = [];
    const p = [];
    return (
      this.items.forEach(
        function (t, e) {
          if (!t.step)
            return (
              r || ((r = n.remapping(i, e + 1)), (o = r.maps.length)),
              o--,
              void p.push(t)
            );
          if (r) {
            p.push(new Ti(t.map));
            let h;
            const u = t.step.map(r.slice(o));
            u &&
              c.maybeStep(u).doc &&
              ((h = c.mapping.maps[c.mapping.maps.length - 1]),
              l.push(new Ti(h, void 0, void 0, l.length + p.length))),
              o--,
              h && r.appendMap(h, o);
          } else c.maybeStep(t.step);
          return t.selection
            ? ((s = r ? t.selection.map(r.slice(o)) : t.selection),
              (a = new Di(
                n.items.slice(0, i).append(p.reverse().concat(l)),
                n.eventCount - 1,
              )),
              !1)
            : void 0;
        },
        this.items.length,
        0,
      ),
      { remaining: a, transform: c, selection: s }
    );
  }),
    (Di.prototype.addTransform = function (t, e, n, r) {
      for (
        var o = [],
          i = this.eventCount,
          s = this.items,
          a = !r && s.length ? s.get(s.length - 1) : null,
          c = 0;
        c < t.steps.length;
        c++
      ) {
        var l;
        const p = t.steps[c].invert(t.docs[c]);
        let h = new Ti(t.mapping.maps[c], p, e);
        (l = a && a.merge(h)) &&
          ((h = l), c ? o.pop() : (s = s.slice(0, s.length - 1))),
          o.push(h),
          e && (i++, (e = void 0)),
          r || (a = h);
      }
      let u;
      let f;
      let d;
      const m = i - n.depth;
      return (
        m > Ei &&
          ((f = m),
          (u = s).forEach(function (t, e) {
            if (t.selection && f-- == 0) return (d = e), !1;
          }),
          (s = u.slice(d)),
          (i -= m)),
        new Di(s.append(o), i)
      );
    }),
    (Di.prototype.remapping = function (t, e) {
      const n = new xt();
      return (
        this.items.forEach(
          function (e, r) {
            const o =
              null != e.mirrorOffset && r - e.mirrorOffset >= t
                ? n.maps.length - e.mirrorOffset
                : void 0;
            n.appendMap(e.map, o);
          },
          t,
          e,
        ),
        n
      );
    }),
    (Di.prototype.addMaps = function (t) {
      return this.eventCount == 0
        ? this
        : new Di(
            this.items.append(
              t.map(function (t) {
                return new Ti(t);
              }),
            ),
            this.eventCount,
          );
    }),
    (Di.prototype.rebased = function (t, e) {
      if (!this.eventCount) return this;
      const n = [];
      const r = Math.max(0, this.items.length - e);
      const o = t.mapping;
      let i = t.steps.length;
      let s = this.eventCount;
      this.items.forEach(function (t) {
        t.selection && s--;
      }, r);
      let a = e;
      this.items.forEach(function (e) {
        const r = o.getMirror(--a);
        if (null != r) {
          i = Math.min(i, r);
          const c = o.maps[r];
          if (e.step) {
            const l = t.steps[r].invert(t.docs[r]);
            const p = e.selection && e.selection.map(o.slice(a + 1, r));
            p && s++, n.push(new Ti(c, l, p));
          } else n.push(new Ti(c));
        }
      }, r);
      for (var c = [], l = e; l < i; l++) c.push(new Ti(o.maps[l]));
      const p = this.items.slice(0, r).append(c).append(n);
      let h = new Di(p, s);
      return (
        h.emptyItemCount() > 500 &&
          (h = h.compress(this.items.length - n.length)),
        h
      );
    }),
    (Di.prototype.emptyItemCount = function () {
      let t = 0;
      return (
        this.items.forEach(function (e) {
          e.step || t++;
        }),
        t
      );
    }),
    (Di.prototype.compress = function (t) {
      void 0 === t && (t = this.items.length);
      const e = this.remapping(0, t);
      let n = e.maps.length;
      const r = [];
      let o = 0;
      return (
        this.items.forEach(
          function (i, s) {
            if (s >= t) r.push(i), i.selection && o++;
            else if (i.step) {
              const a = i.step.map(e.slice(n));
              const c = a && a.getMap();
              if ((n--, c && e.appendMap(c, n), a)) {
                const l = i.selection && i.selection.map(e.slice(n));
                l && o++;
                let p;
                const h = new Ti(c.invert(), a, l);
                const u = r.length - 1;
                (p = r.length && r[u].merge(h)) ? (r[u] = p) : r.push(h);
              }
            } else i.map && n--;
          },
          this.items.length,
          0,
        ),
        new Di(Ni.from(r.reverse()), o)
      );
    }),
    (Di.empty = new Di(Ni.empty, 0));
  var Ti = function (t, e, n, r) {
    (this.map = t),
      (this.step = e),
      (this.selection = n),
      (this.mirrorOffset = r);
  };
  Ti.prototype.merge = function (t) {
    if (this.step && t.step && !t.selection) {
      const e = t.step.merge(this.step);
      if (e) return new Ti(e.getMap().invert(), e, this.selection);
    }
  };
  const Ai = function (t, e, n, r) {
    (this.done = t),
      (this.undone = e),
      (this.prevRanges = n),
      (this.prevTime = r);
  };
  var Ei = 20;
  function Ii(t) {
    const e = [];
    return (
      t.forEach(function (t, n, r, o) {
        return e.push(r, o);
      }),
      e
    );
  }
  function Ri(t, e) {
    if (!t) return null;
    for (var n = [], r = 0; r < t.length; r += 2) {
      const o = e.map(t[r], 1);
      const i = e.map(t[r + 1], -1);
      o <= i && n.push(o, i);
    }
    return n;
  }
  function zi(t, e, n, r) {
    const o = _i(e);
    const i = Vi.get(e).spec.config;
    const s = (r ? t.undone : t.done).popEvent(e, o);
    if (s) {
      const a = s.selection.resolve(s.transform.doc);
      const c = (r ? t.done : t.undone).addTransform(
        s.transform,
        e.selection.getBookmark(),
        i,
        o,
      );
      const l = new Ai(r ? c : s.remaining, r ? s.remaining : c, null, 0);
      n(
        s.transform
          .setSelection(a)
          .setMeta(Vi, { redo: r, historyState: l })
          .scrollIntoView(),
      );
    }
  }
  let Pi = !1;
  let Bi = null;
  function _i(t) {
    const e = t.plugins;
    if (Bi != e) {
      (Pi = !1), (Bi = e);
      for (let n = 0; n < e.length; n++)
        if (e[n].spec.historyPreserveItems) {
          Pi = !0;
          break;
        }
    }
    return Pi;
  }
  var Vi = new Ie('history');
  const Fi = new Ie('closeHistory');
  function $i(t) {
    return (
      void 0 === t && (t = {}),
      (t = { depth: t.depth || 100, newGroupDelay: t.newGroupDelay || 500 }),
      new Te({
        key: Vi,
        state: {
          init: function () {
            return new Ai(Di.empty, Di.empty, null, 0);
          },
          apply: function (e, n, r) {
            return (function (t, e, n, r) {
              let o;
              const i = n.getMeta(Vi);
              if (i) return i.historyState;
              n.getMeta(Fi) && (t = new Ai(t.done, t.undone, null, 0));
              const s = n.getMeta('appendedTransaction');
              if (n.steps.length == 0) return t;
              if (s && s.getMeta(Vi))
                return s.getMeta(Vi).redo
                  ? new Ai(
                      t.done.addTransform(n, void 0, r, _i(e)),
                      t.undone,
                      Ii(n.mapping.maps[n.steps.length - 1]),
                      t.prevTime,
                    )
                  : new Ai(
                      t.done,
                      t.undone.addTransform(n, void 0, r, _i(e)),
                      null,
                      t.prevTime,
                    );
              if (
                !1 === n.getMeta('addToHistory') ||
                (s && !1 === s.getMeta('addToHistory'))
              )
                return (o = n.getMeta('rebased'))
                  ? new Ai(
                      t.done.rebased(n, o),
                      t.undone.rebased(n, o),
                      Ri(t.prevRanges, n.mapping),
                      t.prevTime,
                    )
                  : new Ai(
                      t.done.addMaps(n.mapping.maps),
                      t.undone.addMaps(n.mapping.maps),
                      Ri(t.prevRanges, n.mapping),
                      t.prevTime,
                    );
              const a =
                t.prevTime == 0 ||
                (!s &&
                  (t.prevTime < (n.time || 0) - r.newGroupDelay ||
                    !(function (t, e) {
                      if (!e) return !1;
                      if (!t.docChanged) return !0;
                      let n = !1;
                      return (
                        t.mapping.maps[0].forEach(function (t, r) {
                          for (let o = 0; o < e.length; o += 2)
                            t <= e[o + 1] && r >= e[o] && (n = !0);
                        }),
                        n
                      );
                    })(n, t.prevRanges)));
              const c = s
                ? Ri(t.prevRanges, n.mapping)
                : Ii(n.mapping.maps[n.steps.length - 1]);
              return new Ai(
                t.done.addTransform(
                  n,
                  a ? e.selection.getBookmark() : void 0,
                  r,
                  _i(e),
                ),
                Di.empty,
                c,
                n.time,
              );
            })(n, r, e, t);
          },
        },
        config: t,
        props: {
          handleDOMEvents: {
            beforeinput: function (t, e) {
              const n = e.inputType;
              const r =
                n == 'historyUndo' ? qi : n == 'historyRedo' ? Li : null;
              return !!r && (e.preventDefault(), r(t.state, t.dispatch));
            },
          },
        },
      })
    );
  }
  var qi = function (t, e) {
    const n = Vi.getState(t);
    return !(!n || n.done.eventCount == 0) && (e && zi(n, t, e, !1), !0);
  };
  var Li = function (t, e) {
    const n = Vi.getState(t);
    return !(!n || n.undone.eventCount == 0) && (e && zi(n, t, e, !0), !0);
  };
  const ji = Object.freeze({
    __proto__: null,
    closeHistory: function (t) {
      return t.setMeta(Fi, !0);
    },
    history: $i,
    redo: Li,
    redoDepth: function (t) {
      const e = Vi.getState(t);
      return e ? e.undone.eventCount : 0;
    },
    undo: qi,
    undoDepth: function (t) {
      const e = Vi.getState(t);
      return e ? e.done.eventCount : 0;
    },
  });
  const Ji = function (t, e) {
    return (
      !t.selection.empty &&
      (e && e(t.tr.deleteSelection().scrollIntoView()), !0)
    );
  };
  const Wi = function (t, e, n) {
    const r = t.selection.$cursor;
    if (!r || (n ? !n.endOfTextblock('backward', t) : r.parentOffset > 0))
      return !1;
    const o = Ui(r);
    if (!o) {
      const i = r.blockRange();
      const s = i && Pt(i);
      return null != s && (e && e(t.tr.lift(i, s).scrollIntoView()), !0);
    }
    const a = o.nodeBefore;
    if (!a.type.spec.isolating && ps(t, o, e)) return !0;
    if (r.parent.content.size == 0 && (Ki(a, 'end') || me.isSelectable(a))) {
      const c = Jt(t.doc, r.before(), r.after(), p.empty);
      if (c && c.slice.size < c.to - c.from) {
        if (e) {
          const l = t.tr.step(c);
          l.setSelection(
            Ki(a, 'end')
              ? ce.findFrom(l.doc.resolve(l.mapping.map(o.pos, -1)), -1)
              : me.create(l.doc, o.pos - a.nodeSize),
          ),
            e(l.scrollIntoView());
        }
        return !0;
      }
    }
    return (
      !(!a.isAtom || o.depth != r.depth - 1) &&
      (e && e(t.tr.delete(o.pos - a.nodeSize, o.pos).scrollIntoView()), !0)
    );
  };
  function Ki(t, e, n) {
    void 0 === n && (n = !1);
    for (let r = t; r; r = e == 'start' ? r.firstChild : r.lastChild) {
      if (r.isTextblock) return !0;
      if (n && 1 != r.childCount) return !1;
    }
    return !1;
  }
  const Hi = function (t, e, n) {
    const r = t.selection;
    const o = r.$head;
    let i = o;
    if (!r.empty) return !1;
    if (o.parent.isTextblock) {
      if (n ? !n.endOfTextblock('backward', t) : o.parentOffset > 0) return !1;
      i = Ui(o);
    }
    const s = i && i.nodeBefore;
    return (
      !(!s || !me.isSelectable(s)) &&
      (e &&
        e(
          t.tr
            .setSelection(me.create(t.doc, i.pos - s.nodeSize))
            .scrollIntoView(),
        ),
      !0)
    );
  };
  function Ui(t) {
    if (!t.parent.type.spec.isolating)
      for (let e = t.depth - 1; e >= 0; e--) {
        if (t.index(e) > 0) return t.doc.resolve(t.before(e + 1));
        if (t.node(e).type.spec.isolating) break;
      }
    return null;
  }
  const Gi = function (t, e, n) {
    const r = t.selection.$cursor;
    if (
      !r ||
      (n
        ? !n.endOfTextblock('forward', t)
        : r.parentOffset < r.parent.content.size)
    )
      return !1;
    const o = Xi(r);
    if (!o) return !1;
    const i = o.nodeAfter;
    if (ps(t, o, e)) return !0;
    if (r.parent.content.size == 0 && (Ki(i, 'start') || me.isSelectable(i))) {
      const s = Jt(t.doc, r.before(), r.after(), p.empty);
      if (s && s.slice.size < s.to - s.from) {
        if (e) {
          const a = t.tr.step(s);
          a.setSelection(
            Ki(i, 'start')
              ? ce.findFrom(a.doc.resolve(a.mapping.map(o.pos)), 1)
              : me.create(a.doc, a.mapping.map(o.pos)),
          ),
            e(a.scrollIntoView());
        }
        return !0;
      }
    }
    return (
      !(!i.isAtom || o.depth != r.depth - 1) &&
      (e && e(t.tr.delete(o.pos, o.pos + i.nodeSize).scrollIntoView()), !0)
    );
  };
  const Qi = function (t, e, n) {
    const r = t.selection;
    const o = r.$head;
    let i = o;
    if (!r.empty) return !1;
    if (o.parent.isTextblock) {
      if (
        n
          ? !n.endOfTextblock('forward', t)
          : o.parentOffset < o.parent.content.size
      )
        return !1;
      i = Xi(o);
    }
    const s = i && i.nodeAfter;
    return (
      !(!s || !me.isSelectable(s)) &&
      (e && e(t.tr.setSelection(me.create(t.doc, i.pos)).scrollIntoView()), !0)
    );
  };
  function Xi(t) {
    if (!t.parent.type.spec.isolating)
      for (let e = t.depth - 1; e >= 0; e--) {
        const n = t.node(e);
        if (t.index(e) + 1 < n.childCount) return t.doc.resolve(t.after(e + 1));
        if (n.type.spec.isolating) break;
      }
    return null;
  }
  const Yi = function (t, e) {
    let n;
    const r = t.selection;
    const o = r instanceof me;
    if (o) {
      if (r.node.isTextblock || !Ft(t.doc, r.from)) return !1;
      n = r.from;
    } else if ((n = qt(t.doc, r.from, -1)) == null) return !1;
    if (e) {
      const i = t.tr.join(n);
      o &&
        i.setSelection(
          me.create(i.doc, n - t.doc.resolve(n).nodeBefore.nodeSize),
        ),
        e(i.scrollIntoView());
    }
    return !0;
  };
  const Zi = function (t, e) {
    let n;
    const r = t.selection;
    if (r instanceof me) {
      if (r.node.isTextblock || !Ft(t.doc, r.to)) return !1;
      n = r.to;
    } else if ((n = qt(t.doc, r.to, 1)) == null) return !1;
    return e && e(t.tr.join(n).scrollIntoView()), !0;
  };
  const ts = function (t, e) {
    const n = t.selection;
    const r = n.$from;
    const o = n.$to;
    const i = r.blockRange(o);
    const s = i && Pt(i);
    return null != s && (e && e(t.tr.lift(i, s).scrollIntoView()), !0);
  };
  const es = function (t, e) {
    const n = t.selection;
    const r = n.$head;
    const o = n.$anchor;
    return (
      !(!r.parent.type.spec.code || !r.sameParent(o)) &&
      (e && e(t.tr.insertText('\n').scrollIntoView()), !0)
    );
  };
  function ns(t) {
    for (let e = 0; e < t.edgeCount; e++) {
      const n = t.edge(e).type;
      if (n.isTextblock && !n.hasRequiredAttrs()) return n;
    }
    return null;
  }
  const rs = function (t, e) {
    const n = t.selection;
    const r = n.$head;
    const o = n.$anchor;
    if (!r.parent.type.spec.code || !r.sameParent(o)) return !1;
    const i = r.node(-1);
    const s = r.indexAfter(-1);
    const a = ns(i.contentMatchAt(s));
    if (!a || !i.canReplaceWith(s, s, a)) return !1;
    if (e) {
      const c = r.after();
      const l = t.tr.replaceWith(c, c, a.createAndFill());
      l.setSelection(ce.near(l.doc.resolve(c), 1)), e(l.scrollIntoView());
    }
    return !0;
  };
  const is = function (t, e) {
    const n = t.selection;
    const r = n.$from;
    const o = n.$to;
    if (n instanceof ge || r.parent.inlineContent || o.parent.inlineContent)
      return !1;
    const i = ns(o.parent.contentMatchAt(o.indexAfter()));
    if (!i || !i.isTextblock) return !1;
    if (e) {
      const s = (!r.parentOffset && o.index() < o.parent.childCount ? r : o)
        .pos;
      const a = t.tr.insert(s, i.createAndFill());
      a.setSelection(fe.create(a.doc, s + 1)), e(a.scrollIntoView());
    }
    return !0;
  };
  const ss = function (t, e) {
    const n = t.selection.$cursor;
    if (!n || n.parent.content.size) return !1;
    if (n.depth > 1 && n.after() != n.end(-1)) {
      const r = n.before();
      if (Vt(t.doc, r)) return e && e(t.tr.split(r).scrollIntoView()), !0;
    }
    const o = n.blockRange();
    const i = o && Pt(o);
    return null != i && (e && e(t.tr.lift(o, i).scrollIntoView()), !0);
  };
  const as = function (t, e) {
    const n = t.selection;
    const r = n.$from;
    const o = n.$to;
    if (t.selection instanceof me && t.selection.node.isBlock)
      return (
        !(!r.parentOffset || !Vt(t.doc, r.pos)) &&
        (e && e(t.tr.split(r.pos).scrollIntoView()), !0)
      );
    if (!r.parent.isBlock) return !1;
    if (e) {
      const i = o.parentOffset == o.parent.content.size;
      const s = t.tr;
      (t.selection instanceof fe || t.selection instanceof ge) &&
        s.deleteSelection();
      const a =
        r.depth == 0 ? null : ns(r.node(-1).contentMatchAt(r.indexAfter(-1)));
      let c = i && a ? [{ type: a }] : void 0;
      let l = Vt(s.doc, s.mapping.map(r.pos), 1, c);
      if (
        (c ||
          l ||
          !Vt(s.doc, s.mapping.map(r.pos), 1, a ? [{ type: a }] : void 0) ||
          (a && (c = [{ type: a }]), (l = !0)),
        l &&
          (s.split(s.mapping.map(r.pos), 1, c),
          !i && !r.parentOffset && r.parent.type != a))
      ) {
        const p = s.mapping.map(r.before());
        const h = s.doc.resolve(p);
        a &&
          r.node(-1).canReplaceWith(h.index(), h.index() + 1, a) &&
          s.setNodeMarkup(s.mapping.map(r.before()), a);
      }
      e(s.scrollIntoView());
    }
    return !0;
  };
  const cs = function (t, e) {
    let n;
    const r = t.selection;
    const o = r.$from;
    const i = r.to;
    const s = o.sharedDepth(i);
    return (
      0 != s &&
      ((n = o.before(s)), e && e(t.tr.setSelection(me.create(t.doc, n))), !0)
    );
  };
  const ls = function (t, e) {
    return e && e(t.tr.setSelection(new ge(t.doc))), !0;
  };
  function ps(t, e, n) {
    let o;
    let i;
    const s = e.nodeBefore;
    const a = e.nodeAfter;
    if (s.type.spec.isolating || a.type.spec.isolating) return !1;
    if (
      (function (t, e, n) {
        const r = e.nodeBefore;
        const o = e.nodeAfter;
        const i = e.index();
        return !(
          !(r && o && r.type.compatibleContent(o.type)) ||
          (!r.content.size && e.parent.canReplace(i - 1, i)
            ? (n && n(t.tr.delete(e.pos - r.nodeSize, e.pos).scrollIntoView()),
              0)
            : !e.parent.canReplace(i, i + 1) ||
              (!o.isTextblock && !Ft(t.doc, e.pos)) ||
              (n &&
                n(
                  t.tr
                    .clearIncompatible(
                      e.pos,
                      r.type,
                      r.contentMatchAt(r.childCount),
                    )
                    .join(e.pos)
                    .scrollIntoView(),
                ),
              0))
        );
      })(t, e, n)
    )
      return !0;
    const c = e.parent.canReplace(e.index(), e.index() + 1);
    if (
      c &&
      (o = (i = s.contentMatchAt(s.childCount)).findWrapping(a.type)) &&
      i.matchType(o[0] || a.type).validEnd
    ) {
      if (n) {
        for (
          var l = e.pos + a.nodeSize, h = r.empty, u = o.length - 1;
          u >= 0;
          u--
        )
          h = r.from(o[u].create(null, h));
        h = r.from(s.copy(h));
        const f = t.tr.step(
          new It(e.pos - 1, l, e.pos, l, new p(h, 1, 0), o.length, !0),
        );
        const d = l + 2 * o.length;
        Ft(f.doc, d) && f.join(d), n(f.scrollIntoView());
      }
      return !0;
    }
    const m = ce.findFrom(e, 1);
    const v = m && m.$from.blockRange(m.$to);
    const g = v && Pt(v);
    if (null != g && g >= e.depth)
      return n && n(t.tr.lift(v, g).scrollIntoView()), !0;
    if (c && Ki(a, 'start', !0) && Ki(s, 'end')) {
      for (var y = s, w = []; w.push(y), !y.isTextblock; ) y = y.lastChild;
      for (var b = a, k = 1; !b.isTextblock; b = b.firstChild) k++;
      if (y.canReplace(y.childCount, y.childCount, b.content)) {
        if (n) {
          for (var x = r.empty, S = w.length - 1; S >= 0; S--)
            x = r.from(w[S].copy(x));
          n(
            t.tr
              .step(
                new It(
                  e.pos - w.length,
                  e.pos + a.nodeSize,
                  e.pos + k,
                  e.pos + a.nodeSize - k,
                  new p(x, w.length, 0),
                  0,
                  !0,
                ),
              )
              .scrollIntoView(),
          );
        }
        return !0;
      }
    }
    return !1;
  }
  function hs(t) {
    return function (e, n) {
      for (
        var r = e.selection, o = t < 0 ? r.$from : r.$to, i = o.depth;
        o.node(i).isInline;

      ) {
        if (!i) return !1;
        i--;
      }
      return (
        !!o.node(i).isTextblock &&
        (n &&
          n(e.tr.setSelection(fe.create(e.doc, t < 0 ? o.start(i) : o.end(i)))),
        !0)
      );
    };
  }
  const us = hs(-1);
  const fs = hs(1);
  function ds(t, e) {
    return (
      void 0 === e && (e = null),
      function (n, r) {
        const o = n.selection;
        const i = o.$from;
        const s = o.$to;
        const a = i.blockRange(s);
        const c = a && Bt(a, t, e);
        return !!c && (r && r(n.tr.wrap(a, c).scrollIntoView()), !0);
      }
    );
  }
  function ms(t, e) {
    return (
      void 0 === e && (e = null),
      function (n, r) {
        const o = n.selection;
        const i = o.from;
        const s = o.to;
        let a = !1;
        return (
          n.doc.nodesBetween(i, s, function (r, o) {
            if (a) return !1;
            if (r.isTextblock && !r.hasMarkup(t, e))
              if (r.type == t) a = !0;
              else {
                const i = n.doc.resolve(o);
                const s = i.index();
                a = i.parent.canReplaceWith(s, s + 1, t);
              }
          }),
          !!a && (r && r(n.tr.setBlockType(i, s, t, e).scrollIntoView()), !0)
        );
      }
    );
  }
  function vs(t, e) {
    return (
      void 0 === e && (e = null),
      function (n, r) {
        const o = n.selection;
        const i = o.empty;
        const s = o.$cursor;
        const a = o.ranges;
        if (
          (i && !s) ||
          !(function (t, e, n) {
            for (
              let r = function (r) {
                  const o = e[r];
                  const i = o.$from;
                  const s = o.$to;
                  let a = i.depth == 0 && t.type.allowsMarkType(n);
                  if (
                    (t.nodesBetween(i.pos, s.pos, function (t) {
                      if (a) return !1;
                      a = t.inlineContent && t.type.allowsMarkType(n);
                    }),
                    a)
                  )
                    return { v: !0 };
                },
                o = 0;
              o < e.length;
              o++
            ) {
              const i = r(o);
              if (i) return i.v;
            }
            return !1;
          })(n.doc, a, t)
        )
          return !1;
        if (r)
          if (s)
            t.isInSet(n.storedMarks || s.marks())
              ? r(n.tr.removeStoredMark(t))
              : r(n.tr.addStoredMark(t.create(e)));
          else {
            for (var c = !1, l = n.tr, p = 0; !c && p < a.length; p++) {
              const h = a[p];
              const u = h.$from;
              const f = h.$to;
              c = n.doc.rangeHasMark(u.pos, f.pos, t);
            }
            for (let d = 0; d < a.length; d++) {
              const m = a[d];
              const v = m.$from;
              const g = m.$to;
              if (c) l.removeMark(v.pos, g.pos, t);
              else {
                let y = v.pos;
                let w = g.pos;
                const b = v.nodeAfter;
                const k = g.nodeBefore;
                const x = b && b.isText ? /^\s*/.exec(b.text)[0].length : 0;
                const S = k && k.isText ? /\s*$/.exec(k.text)[0].length : 0;
                y + x < w && ((y += x), (w -= S)), l.addMark(y, w, t.create(e));
              }
            }
            r(l.scrollIntoView());
          }
        return !0;
      }
    );
  }
  function gs(t, e) {
    return function (n) {
      if (!n.isGeneric) return t(n);
      for (var r = [], o = 0; o < n.mapping.maps.length; o++) {
        for (var i = n.mapping.maps[o], s = 0; s < r.length; s++)
          r[s] = i.map(r[s]);
        i.forEach(function (t, e, n, o) {
          return r.push(n, o);
        });
      }
      for (var a = [], c = 0; c < r.length; c += 2)
        for (
          let l = r[c],
            p = r[c + 1],
            h = n.doc.resolve(l),
            u = h.sharedDepth(p),
            f = h.node(u),
            d = h.indexAfter(u),
            m = h.after(u + 1);
          m <= p;
          ++d
        ) {
          const v = f.maybeChild(d);
          if (!v) break;
          if (d && a.indexOf(m) == -1) {
            const g = f.child(d - 1);
            g.type == v.type && e(g, v) && a.push(m);
          }
          m += v.nodeSize;
        }
      a.sort(function (t, e) {
        return t - e;
      });
      for (let y = a.length - 1; y >= 0; y--) Ft(n.doc, a[y]) && n.join(a[y]);
      t(n);
    };
  }
  function ys() {
    for (var t = [], e = arguments.length; e--; ) t[e] = arguments[e];
    return function (e, n, r) {
      for (let o = 0; o < t.length; o++) if (t[o](e, n, r)) return !0;
      return !1;
    };
  }
  const ws = ys(Ji, Wi, Hi);
  const bs = ys(Ji, Gi, Qi);
  const ks = {
    Enter: ys(es, is, ss, as),
    'Mod-Enter': rs,
    Backspace: ws,
    'Mod-Backspace': ws,
    'Shift-Backspace': ws,
    Delete: bs,
    'Mod-Delete': bs,
    'Mod-a': ls,
  };
  const xs = {
    'Ctrl-h': ks.Backspace,
    'Alt-Backspace': ks['Mod-Backspace'],
    'Ctrl-d': ks.Delete,
    'Ctrl-Alt-Backspace': ks['Mod-Delete'],
    'Alt-Delete': ks['Mod-Delete'],
    'Alt-d': ks['Mod-Delete'],
    'Ctrl-a': us,
    'Ctrl-e': fs,
  };
  for (const Ss in ks) xs[Ss] = ks[Ss];
  const Ms = (
    'undefined' !== typeof navigator
      ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
      : !(typeof os === 'undefined' || !os.platform) &&
        os.platform() == 'darwin'
  )
    ? xs
    : ks;
  const Cs = Object.freeze({
    __proto__: null,
    autoJoin: function (t, e) {
      const n = Array.isArray(e)
        ? function (t) {
            return e.indexOf(t.type.name) > -1;
          }
        : e;
      return function (e, r, o) {
        return t(e, r && gs(r, n), o);
      };
    },
    baseKeymap: Ms,
    chainCommands: ys,
    createParagraphNear: is,
    deleteSelection: Ji,
    exitCode: rs,
    joinBackward: Wi,
    joinDown: Zi,
    joinForward: Gi,
    joinUp: Yi,
    lift: ts,
    liftEmptyBlock: ss,
    macBaseKeymap: xs,
    newlineInCode: es,
    pcBaseKeymap: ks,
    selectAll: ls,
    selectNodeBackward: Hi,
    selectNodeForward: Qi,
    selectParentNode: cs,
    selectTextblockEnd: fs,
    selectTextblockStart: us,
    setBlockType: ms,
    splitBlock: as,
    splitBlockKeepMarks: function (t, e) {
      return as(
        t,
        e &&
          function (n) {
            const r =
              t.storedMarks ||
              (t.selection.$to.parentOffset && t.selection.$from.marks());
            r && n.ensureMarks(r), e(n);
          },
      );
    },
    toggleMark: vs,
    wrapIn: ds,
  });
  const Os = ['p', 0];
  const Ns = ['blockquote', 0];
  const Ds = ['hr'];
  const Ts = ['pre', ['code', 0]];
  const As = ['br'];
  const Es = {
    doc: { content: 'block+' },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: function () {
        return Os;
      },
    },
    blockquote: {
      content: 'block+',
      group: 'block',
      defining: !0,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM: function () {
        return Ns;
      },
    },
    horizontal_rule: {
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM: function () {
        return Ds;
      },
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      group: 'block',
      defining: !0,
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } },
      ],
      toDOM: function (t) {
        return ['h' + t.attrs.level, 0];
      },
    },
    code_block: {
      content: 'text*',
      marks: '',
      group: 'block',
      code: !0,
      defining: !0,
      parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
      toDOM: function () {
        return Ts;
      },
    },
    text: { group: 'inline' },
    image: {
      inline: !0,
      attrs: { src: {}, alt: { default: null }, title: { default: null } },
      group: 'inline',
      draggable: !0,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: function (t) {
            return {
              src: t.getAttribute('src'),
              title: t.getAttribute('title'),
              alt: t.getAttribute('alt'),
            };
          },
        },
      ],
      toDOM: function (t) {
        const e = t.attrs;
        return ['img', { src: e.src, alt: e.alt, title: e.title }];
      },
    },
    hard_break: {
      inline: !0,
      group: 'inline',
      selectable: !1,
      parseDOM: [{ tag: 'br' }],
      toDOM: function () {
        return As;
      },
    },
  };
  const Is = ['em', 0];
  const Rs = ['strong', 0];
  const zs = ['code', 0];
  const Ps = {
    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: !1,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: function (t) {
            return {
              href: t.getAttribute('href'),
              title: t.getAttribute('title'),
            };
          },
        },
      ],
      toDOM: function (t) {
        const e = t.attrs;
        return ['a', { href: e.href, title: e.title }, 0];
      },
    },
    em: {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: function () {
        return Is;
      },
    },
    strong: {
      parseDOM: [
        { tag: 'strong' },
        {
          tag: 'b',
          getAttrs: function (t) {
            return 'normal' != t.style.fontWeight && null;
          },
        },
        {
          style: 'font-weight',
          getAttrs: function (t) {
            return /^(bold(er)?|[5-9]\d{2,})$/.test(t) && null;
          },
        },
      ],
      toDOM: function () {
        return Rs;
      },
    },
    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM: function () {
        return zs;
      },
    },
  };
  const Bs = new tt({ nodes: Es, marks: Ps });
  const _s = Object.freeze({
    __proto__: null,
    marks: Ps,
    nodes: Es,
    schema: Bs,
  });
  const Vs = ['ol', 0];
  const Fs = ['ul', 0];
  const $s = ['li', 0];
  const qs = {
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: function (t) {
          return {
            order: t.hasAttribute('start')
              ? Number(t.getAttribute('start'))
              : 1,
          };
        },
      },
    ],
    toDOM: function (t) {
      return t.attrs.order == 1 ? Vs : ['ol', { start: t.attrs.order }, 0];
    },
  };
  const Ls = {
    parseDOM: [{ tag: 'ul' }],
    toDOM: function () {
      return Fs;
    },
  };
  const js = {
    parseDOM: [{ tag: 'li' }],
    toDOM: function () {
      return $s;
    },
    defining: !0,
  };
  function Js(t, e) {
    const n = {};
    for (const r in t) n[r] = t[r];
    for (const o in e) n[o] = e[o];
    return n;
  }
  function Ws(t, e) {
    return (
      void 0 === e && (e = null),
      function (n, o) {
        const i = n.selection;
        const s = i.$from;
        const a = i.$to;
        let c = s.blockRange(a);
        let l = !1;
        let h = c;
        if (!c) return !1;
        if (
          c.depth >= 2 &&
          s.node(c.depth - 1).type.compatibleContent(t) &&
          c.startIndex == 0
        ) {
          if (s.index(c.depth - 1) == 0) return !1;
          const u = n.doc.resolve(c.start - 2);
          (h = new D(u, u, c.depth)),
            c.endIndex < c.parent.childCount &&
              (c = new D(s, n.doc.resolve(a.end(c.depth)), c.depth)),
            (l = !0);
        }
        const f = Bt(h, t, e, c);
        return (
          !!f &&
          (o &&
            o(
              (function (t, e, n, o, i) {
                for (var s = r.empty, a = n.length - 1; a >= 0; a--)
                  s = r.from(n[a].type.create(n[a].attrs, s));
                t.step(
                  new It(
                    e.start - (o ? 2 : 0),
                    e.end,
                    e.start,
                    e.end,
                    new p(s, 0, 0),
                    n.length,
                    !0,
                  ),
                );
                for (var c = 0, l = 0; l < n.length; l++)
                  n[l].type == i && (c = l + 1);
                for (
                  let h = n.length - c,
                    u = e.start + n.length - (o ? 2 : 0),
                    f = e.parent,
                    d = e.startIndex,
                    m = e.endIndex,
                    v = !0;
                  d < m;
                  d++, v = !1
                )
                  !v && Vt(t.doc, u, h) && (t.split(u, h), (u += 2 * h)),
                    (u += f.child(d).nodeSize);
                return t;
              })(n.tr, c, f, l, t).scrollIntoView(),
            ),
          !0)
        );
      }
    );
  }
  function Ks(t) {
    return function (e, n) {
      const o = e.selection;
      const i = o.$from;
      const s = o.$to;
      const a = o.node;
      if ((a && a.isBlock) || i.depth < 2 || !i.sameParent(s)) return !1;
      const c = i.node(-1);
      if (c.type != t) return !1;
      if (
        i.parent.content.size == 0 &&
        i.node(-1).childCount == i.indexAfter(-1)
      ) {
        if (
          i.depth == 3 ||
          i.node(-3).type != t ||
          i.index(-2) != i.node(-2).childCount - 1
        )
          return !1;
        if (n) {
          for (
            var l = r.empty,
              h = i.index(-1) ? 1 : i.index(-2) ? 2 : 3,
              u = i.depth - h;
            u >= i.depth - 3;
            u--
          )
            l = r.from(i.node(u).copy(l));
          const f =
            i.indexAfter(-1) < i.node(-2).childCount
              ? 1
              : i.indexAfter(-2) < i.node(-3).childCount
              ? 2
              : 3;
          l = l.append(r.from(t.createAndFill()));
          const d = i.before(i.depth - (h - 1));
          const m = e.tr.replace(d, i.after(-f), new p(l, 4 - h, 0));
          let v = -1;
          m.doc.nodesBetween(d, m.doc.content.size, function (t, e) {
            if (v > -1) return !1;
            t.isTextblock && t.content.size == 0 && (v = e + 1);
          }),
            v > -1 && m.setSelection(ce.near(m.doc.resolve(v))),
            n(m.scrollIntoView());
        }
        return !0;
      }
      const g = s.pos == i.end() ? c.contentMatchAt(0).defaultType : null;
      const y = e.tr.delete(i.pos, s.pos);
      const w = g ? [null, { type: g }] : void 0;
      return (
        !!Vt(y.doc, i.pos, 2, w) &&
        (n && n(y.split(i.pos, 2, w).scrollIntoView()), !0)
      );
    };
  }
  function Hs(t) {
    return function (e, n) {
      const o = e.selection;
      const i = o.$from;
      const s = o.$to;
      const a = i.blockRange(s, function (e) {
        return e.childCount > 0 && e.firstChild.type == t;
      });
      return (
        !!a &&
        (!n ||
          (i.node(a.depth - 1).type == t
            ? (function (t, e, n, o) {
                const i = t.tr;
                const s = o.end;
                const a = o.$to.end(o.depth);
                s < a &&
                  (i.step(
                    new It(
                      s - 1,
                      a,
                      s,
                      a,
                      new p(r.from(n.create(null, o.parent.copy())), 1, 0),
                      1,
                      !0,
                    ),
                  ),
                  (o = new D(
                    i.doc.resolve(o.$from.pos),
                    i.doc.resolve(a),
                    o.depth,
                  )));
                const c = Pt(o);
                if (c == null) return !1;
                return e(i.lift(o, c).scrollIntoView()), !0;
              })(e, n, t, a)
            : (function (t, e, n) {
                for (
                  var o = t.tr,
                    i = n.parent,
                    s = n.end,
                    a = n.endIndex - 1,
                    c = n.startIndex;
                  a > c;
                  a--
                )
                  (s -= i.child(a).nodeSize), o.delete(s - 1, s + 1);
                const l = o.doc.resolve(n.start);
                const h = l.nodeAfter;
                if (o.mapping.map(n.end) != n.start + l.nodeAfter.nodeSize)
                  return !1;
                const u = n.startIndex == 0;
                const f = n.endIndex == i.childCount;
                const d = l.node(-1);
                const m = l.index(-1);
                if (
                  !d.canReplace(
                    m + (u ? 0 : 1),
                    m + 1,
                    h.content.append(f ? r.empty : r.from(i)),
                  )
                )
                  return !1;
                const v = l.pos;
                const g = v + h.nodeSize;
                return (
                  o.step(
                    new It(
                      v - (u ? 1 : 0),
                      g + (f ? 1 : 0),
                      v + 1,
                      g - 1,
                      new p(
                        (u ? r.empty : r.from(i.copy(r.empty))).append(
                          f ? r.empty : r.from(i.copy(r.empty)),
                        ),
                        u ? 0 : 1,
                        f ? 0 : 1,
                      ),
                      u ? 0 : 1,
                    ),
                  ),
                  e(o.scrollIntoView()),
                  !0
                );
              })(e, n, a)))
      );
    };
  }
  function Us(t) {
    return function (e, n) {
      const o = e.selection;
      const i = o.$from;
      const s = o.$to;
      const a = i.blockRange(s, function (e) {
        return e.childCount > 0 && e.firstChild.type == t;
      });
      if (!a) return !1;
      const c = a.startIndex;
      if (c == 0) return !1;
      const l = a.parent;
      const h = l.child(c - 1);
      if (h.type != t) return !1;
      if (n) {
        const u = h.lastChild && h.lastChild.type == l.type;
        const f = r.from(u ? t.create() : null);
        const d = new p(
          r.from(t.create(null, r.from(l.type.create(null, f)))),
          u ? 3 : 1,
          0,
        );
        const m = a.start;
        const v = a.end;
        n(
          e.tr
            .step(new It(m - (u ? 3 : 1), v, m, v, d, 1, !0))
            .scrollIntoView(),
        );
      }
      return !0;
    };
  }
  const Gs = Object.freeze({
    __proto__: null,
    addListNodes: function (t, e, n) {
      return t.append({
        ordered_list: Js(qs, { content: 'list_item+', group: n }),
        bullet_list: Js(Ls, { content: 'list_item+', group: n }),
        list_item: Js(js, { content: e }),
      });
    },
    bulletList: Ls,
    liftListItem: Hs,
    listItem: js,
    orderedList: qs,
    sinkListItem: Us,
    splitListItem: Ks,
    wrapInList: Ws,
  });
  function Qs(t) {
    return (
      void 0 === t && (t = {}),
      new Te({
        view: function (e) {
          return new Xs(e, t);
        },
      })
    );
  }
  var Xs = function (t, e) {
    const n = this;
    (this.editorView = t),
      (this.cursorPos = null),
      (this.element = null),
      (this.timeout = -1),
      (this.width = e.width || 1),
      (this.color = e.color || 'black'),
      (this.class = e.class),
      (this.handlers = ['dragover', 'dragend', 'drop', 'dragleave'].map(
        function (e) {
          const r = function (t) {
            n[e](t);
          };
          return t.dom.addEventListener(e, r), { name: e, handler: r };
        },
      ));
  };
  (Xs.prototype.destroy = function () {
    const t = this;
    this.handlers.forEach(function (e) {
      const n = e.name;
      const r = e.handler;
      return t.editorView.dom.removeEventListener(n, r);
    });
  }),
    (Xs.prototype.update = function (t, e) {
      null != this.cursorPos &&
        e.doc != t.state.doc &&
        (this.cursorPos > t.state.doc.content.size
          ? this.setCursor(null)
          : this.updateOverlay());
    }),
    (Xs.prototype.setCursor = function (t) {
      t != this.cursorPos &&
        ((this.cursorPos = t),
        t == null
          ? (this.element.parentNode.removeChild(this.element),
            (this.element = null))
          : this.updateOverlay());
    }),
    (Xs.prototype.updateOverlay = function () {
      let t;
      const e = this.editorView.state.doc.resolve(this.cursorPos);
      if (!e.parent.inlineContent) {
        const n = e.nodeBefore;
        const r = e.nodeAfter;
        if (n || r) {
          const o = this.editorView
            .nodeDOM(this.cursorPos - (n ? n.nodeSize : 0))
            .getBoundingClientRect();
          let i = n ? o.bottom : o.top;
          n &&
            r &&
            (i =
              (i +
                this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect()
                  .top) /
              2),
            (t = {
              left: o.left,
              right: o.right,
              top: i - this.width / 2,
              bottom: i + this.width / 2,
            });
        }
      }
      if (!t) {
        const s = this.editorView.coordsAtPos(this.cursorPos);
        t = {
          left: s.left - this.width / 2,
          right: s.left + this.width / 2,
          top: s.top,
          bottom: s.bottom,
        };
      }
      let a;
      let c;
      const l = this.editorView.dom.offsetParent;
      if (
        (this.element ||
          ((this.element = l.appendChild(document.createElement('div'))),
          this.class && (this.element.className = this.class),
          (this.element.style.cssText =
            'position: absolute; z-index: 50; pointer-events: none; background-color: ' +
            this.color)),
        !l || (l == document.body && getComputedStyle(l).position == 'static'))
      )
        (a = -pageXOffset), (c = -pageYOffset);
      else {
        const p = l.getBoundingClientRect();
        (a = p.left - l.scrollLeft), (c = p.top - l.scrollTop);
      }
      (this.element.style.left = t.left - a + 'px'),
        (this.element.style.top = t.top - c + 'px'),
        (this.element.style.width = t.right - t.left + 'px'),
        (this.element.style.height = t.bottom - t.top + 'px');
    }),
    (Xs.prototype.scheduleRemoval = function (t) {
      const e = this;
      clearTimeout(this.timeout),
        (this.timeout = setTimeout(function () {
          return e.setCursor(null);
        }, t));
    }),
    (Xs.prototype.dragover = function (t) {
      if (this.editorView.editable) {
        const e = this.editorView.posAtCoords({
          left: t.clientX,
          top: t.clientY,
        });
        const n =
          e && e.inside >= 0 && this.editorView.state.doc.nodeAt(e.inside);
        const r = n && n.type.spec.disableDropCursor;
        const o = typeof r === 'function' ? r(this.editorView, e, t) : r;
        if (e && !o) {
          let i = e.pos;
          if (
            this.editorView.dragging &&
            this.editorView.dragging.slice &&
            (i = jt(
              this.editorView.state.doc,
              i,
              this.editorView.dragging.slice,
            )) == null
          )
            return this.setCursor(null);
          this.setCursor(i), this.scheduleRemoval(5e3);
        }
      }
    }),
    (Xs.prototype.dragend = function () {
      this.scheduleRemoval(20);
    }),
    (Xs.prototype.drop = function () {
      this.scheduleRemoval(20);
    }),
    (Xs.prototype.dragleave = function (t) {
      (t.target != this.editorView.dom &&
        this.editorView.dom.contains(t.relatedTarget)) ||
        this.setCursor(null);
    });
  const Ys = Object.freeze({ __proto__: null, dropCursor: Qs });
  const Zs = (function (t) {
    function e(e) {
      t.call(this, e, e);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.map = function (n, r) {
        const o = n.resolve(r.map(this.head));
        return e.valid(o) ? new e(o) : t.near(o);
      }),
      (e.prototype.content = function () {
        return p.empty;
      }),
      (e.prototype.eq = function (t) {
        return t instanceof e && t.head == this.head;
      }),
      (e.prototype.toJSON = function () {
        return { type: 'gapcursor', pos: this.head };
      }),
      (e.fromJSON = function (t, n) {
        if ('number' !== typeof n.pos)
          throw new RangeError('Invalid input for GapCursor.fromJSON');
        return new e(t.resolve(n.pos));
      }),
      (e.prototype.getBookmark = function () {
        return new ta(this.anchor);
      }),
      (e.valid = function (t) {
        const e = t.parent;
        if (
          e.isTextblock ||
          !(function (t) {
            for (let e = t.depth; e >= 0; e--) {
              const n = t.index(e);
              const r = t.node(e);
              if (0 != n)
                for (let o = r.child(n - 1); ; o = o.lastChild) {
                  if (
                    (o.childCount == 0 && !o.inlineContent) ||
                    o.isAtom ||
                    o.type.spec.isolating
                  )
                    return !0;
                  if (o.inlineContent) return !1;
                }
              else if (r.type.spec.isolating) return !0;
            }
            return !0;
          })(t) ||
          !(function (t) {
            for (let e = t.depth; e >= 0; e--) {
              const n = t.indexAfter(e);
              const r = t.node(e);
              if (n != r.childCount)
                for (let o = r.child(n); ; o = o.firstChild) {
                  if (
                    (o.childCount == 0 && !o.inlineContent) ||
                    o.isAtom ||
                    o.type.spec.isolating
                  )
                    return !0;
                  if (o.inlineContent) return !1;
                }
              else if (r.type.spec.isolating) return !0;
            }
            return !0;
          })(t)
        )
          return !1;
        const n = e.type.spec.allowGapCursor;
        if (null != n) return n;
        const r = e.contentMatchAt(t.index()).defaultType;
        return r && r.isTextblock;
      }),
      (e.findGapCursorFrom = function (t, n, r) {
        void 0 === r && (r = !1);
        t: for (;;) {
          if (!r && e.valid(t)) return t;
          for (var o = t.pos, i = null, s = t.depth; ; s--) {
            const a = t.node(s);
            if (n > 0 ? t.indexAfter(s) < a.childCount : t.index(s) > 0) {
              i = a.child(n > 0 ? t.indexAfter(s) : t.index(s) - 1);
              break;
            }
            if (s == 0) return null;
            o += n;
            const c = t.doc.resolve(o);
            if (e.valid(c)) return c;
          }
          for (;;) {
            const l = n > 0 ? i.firstChild : i.lastChild;
            if (!l) {
              if (i.isAtom && !i.isText && !me.isSelectable(i)) {
                (t = t.doc.resolve(o + i.nodeSize * n)), (r = !1);
                continue t;
              }
              break;
            }
            (i = l), (o += n);
            const p = t.doc.resolve(o);
            if (e.valid(p)) return p;
          }
          return null;
        }
      }),
      e
    );
  })(ce);
  (Zs.prototype.visible = !1),
    (Zs.findFrom = Zs.findGapCursorFrom),
    ce.jsonID('gapcursor', Zs);
  var ta = function (t) {
    this.pos = t;
  };
  function ea() {
    return new Te({
      props: {
        decorations: sa,
        createSelectionBetween: function (t, e, n) {
          return e.pos == n.pos && Zs.valid(n) ? new Zs(n) : null;
        },
        handleClick: oa,
        handleKeyDown: na,
        handleDOMEvents: { beforeinput: ia },
      },
    });
  }
  (ta.prototype.map = function (t) {
    return new ta(t.map(this.pos));
  }),
    (ta.prototype.resolve = function (t) {
      const e = t.resolve(this.pos);
      return Zs.valid(e) ? new Zs(e) : ce.near(e);
    });
  var na = ai({
    ArrowLeft: ra('horiz', -1),
    ArrowRight: ra('horiz', 1),
    ArrowUp: ra('vert', -1),
    ArrowDown: ra('vert', 1),
  });
  function ra(t, e) {
    const n = t == 'vert' ? (e > 0 ? 'down' : 'up') : e > 0 ? 'right' : 'left';
    return function (t, r, o) {
      const i = t.selection;
      let s = e > 0 ? i.$to : i.$from;
      let a = i.empty;
      if (i instanceof fe) {
        if (!o.endOfTextblock(n) || s.depth == 0) return !1;
        (a = !1), (s = t.doc.resolve(e > 0 ? s.after() : s.before()));
      }
      const c = Zs.findGapCursorFrom(s, e, a);
      return !!c && (r && r(t.tr.setSelection(new Zs(c))), !0);
    };
  }
  function oa(t, e, n) {
    if (!t || !t.editable) return !1;
    const r = t.state.doc.resolve(e);
    if (!Zs.valid(r)) return !1;
    const o = t.posAtCoords({ left: n.clientX, top: n.clientY });
    return (
      !(o && o.inside > -1 && me.isSelectable(t.state.doc.nodeAt(o.inside))) &&
      (t.dispatch(t.state.tr.setSelection(new Zs(r))), !0)
    );
  }
  function ia(t, e) {
    if (
      'insertCompositionText' != e.inputType ||
      !(t.state.selection instanceof Zs)
    )
      return !1;
    const n = t.state.selection.$from;
    const o = n.parent
      .contentMatchAt(n.index())
      .findWrapping(t.state.schema.nodes.text);
    if (!o) return !1;
    for (var i = r.empty, s = o.length - 1; s >= 0; s--)
      i = r.from(o[s].createAndFill(null, i));
    const a = t.state.tr.replace(n.pos, n.pos, new p(i, 0, 0));
    return a.setSelection(fe.near(a.doc.resolve(n.pos + 1))), t.dispatch(a), !1;
  }
  function sa(t) {
    if (!(t.selection instanceof Zs)) return null;
    const e = document.createElement('div');
    return (
      (e.className = 'ProseMirror-gapcursor'),
      go.create(t.doc, [uo.widget(t.selection.head, e, { key: 'gapcursor' })])
    );
  }
  const aa = Object.freeze({ __proto__: null, GapCursor: Zs, gapCursor: ea });
  function ca() {
    const t = arguments;
    let e = arguments[0];
    typeof e === 'string' && (e = document.createElement(e));
    let n = 1;
    const r = arguments[1];
    if (r && typeof r === 'object' && r.nodeType == null && !Array.isArray(r)) {
      for (const o in r)
        if (Object.hasOwn(r, o)) {
          const i = r[o];
          typeof i === 'string'
            ? e.setAttribute(o, i)
            : null != i && (e[o] = i);
        }
      n++;
    }
    for (; n < arguments.length; n++) la(e, t[n]);
    return e;
  }
  function la(t, e) {
    if (typeof e === 'string') t.appendChild(document.createTextNode(e));
    else if (e == null);
    else if (null != e.nodeType) t.appendChild(e);
    else {
      if (!Array.isArray(e))
        throw new RangeError('Unsupported child node: ' + e);
      for (let n = 0; n < e.length; n++) la(t, e[n]);
    }
  }
  const pa = 'http://www.w3.org/2000/svg';
  const ha = 'ProseMirror-icon';
  function ua(t) {
    const e = document.createElement('div');
    if (((e.className = ha), t.path)) {
      const n = t.path;
      const r = t.width;
      const o = t.height;
      const i =
        'pm-icon-' +
        (function (t) {
          for (var e = 0, n = 0; n < t.length; n++)
            e = ((e << 5) - e + t.charCodeAt(n)) | 0;
          return e;
        })(n).toString(16);
      document.getElementById(i) ||
        (function (t, e) {
          let n = document.getElementById(ha + '-collection');
          n ||
            (((n = document.createElementNS(pa, 'svg')).id =
              ha + '-collection'),
            (n.style.display = 'none'),
            document.body.insertBefore(n, document.body.firstChild));
          const r = document.createElementNS(pa, 'symbol');
          (r.id = t),
            r.setAttribute('viewBox', '0 0 ' + e.width + ' ' + e.height),
            r
              .appendChild(document.createElementNS(pa, 'path'))
              .setAttribute('d', e.path),
            n.appendChild(r);
        })(i, t);
      const s = e.appendChild(document.createElementNS(pa, 'svg'));
      (s.style.width = r / o + 'em'),
        s
          .appendChild(document.createElementNS(pa, 'use'))
          .setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href',
            /([^#]*)/.exec(document.location.toString())[1] + '#' + i,
          );
    } else if (t.dom) e.appendChild(t.dom.cloneNode(!0));
    else {
      const a = t.text;
      const c = t.css;
      (e.appendChild(document.createElement('span')).textContent = a || ''),
        c && (e.firstChild.style.cssText = c);
    }
    return e;
  }
  const fa = 'ProseMirror-menu';
  const da = function (t) {
    this.spec = t;
  };
  function ma(t, e) {
    return t._props.translate ? t._props.translate(e) : e;
  }
  da.prototype.render = function (t) {
    const e = this.spec;
    const n = e.render
      ? e.render(t)
      : e.icon
      ? ua(e.icon)
      : e.label
      ? ca('div', null, ma(t, e.label))
      : null;
    if (!n) throw new RangeError('MenuItem without icon or label property');
    if (e.title) {
      const r = typeof e.title === 'function' ? e.title(t.state) : e.title;
      n.setAttribute('title', ma(t, r));
    }
    return (
      e.class && n.classList.add(e.class),
      e.css && (n.style.cssText += e.css),
      n.addEventListener('mousedown', function (r) {
        r.preventDefault(),
          n.classList.contains(fa + '-disabled') ||
            e.run(t.state, t.dispatch, t, r);
      }),
      {
        dom: n,
        update: function (t) {
          if (e.select) {
            const r = e.select(t);
            if (((n.style.display = r ? '' : 'none'), !r)) return !1;
          }
          let o = !0;
          if (
            (e.enable && ((o = e.enable(t) || !1), Ia(n, fa + '-disabled', !o)),
            e.active)
          ) {
            const i = (o && e.active(t)) || !1;
            Ia(n, fa + '-active', i);
          }
          return !0;
        },
      }
    );
  };
  const va = { time: 0, node: null };
  function ga(t) {
    (va.time = Date.now()), (va.node = t.target);
  }
  function ya(t) {
    return Date.now() - 100 < va.time && va.node && t.contains(va.node);
  }
  const wa = function (t, e) {
    void 0 === e && (e = {}),
      (this.options = e),
      (this.options = e || {}),
      (this.content = Array.isArray(t) ? t : [t]);
  };
  function ba(t, e) {
    for (var n = [], r = [], o = 0; o < t.length; o++) {
      const i = t[o].render(e);
      const s = i.dom;
      const a = i.update;
      n.push(ca('div', { class: fa + '-dropdown-item' }, s)), r.push(a);
    }
    return { dom: n, update: ka(r, n) };
  }
  function ka(t, e) {
    return function (n) {
      for (var r = !1, o = 0; o < t.length; o++) {
        const i = t[o](n);
        (e[o].style.display = i ? '' : 'none'), i && (r = !0);
      }
      return r;
    };
  }
  (wa.prototype.render = function (t) {
    const e = this;
    const n = ba(this.content, t);
    const r = ca(
      'div',
      {
        class: fa + '-dropdown ' + (this.options.class || ''),
        style: this.options.css,
      },
      ma(t, this.options.label || ''),
    );
    this.options.title && r.setAttribute('title', ma(t, this.options.title));
    const o = ca('div', { class: fa + '-dropdown-wrap' }, r);
    let i = null;
    let s = null;
    const a = function () {
      i &&
        i.close() &&
        ((i = null), window.removeEventListener('mousedown', s));
    };
    return (
      r.addEventListener('mousedown', function (t) {
        t.preventDefault(),
          ga(t),
          i
            ? a()
            : ((i = e.expand(o, n.dom)),
              window.addEventListener(
                'mousedown',
                (s = function () {
                  ya(o) || a();
                }),
              ));
      }),
      {
        dom: o,
        update: function (t) {
          const e = n.update(t);
          return (o.style.display = e ? '' : 'none'), e;
        },
      }
    );
  }),
    (wa.prototype.expand = function (t, e) {
      const n = ca(
        'div',
        { class: fa + '-dropdown-menu ' + (this.options.class || '') },
        e,
      );
      let r = !1;
      return (
        t.appendChild(n),
        {
          close: function () {
            if (!r) return (r = !0), t.removeChild(n), !0;
          },
          node: n,
        }
      );
    });
  const xa = function (t, e) {
    void 0 === e && (e = {}),
      (this.options = e),
      (this.content = Array.isArray(t) ? t : [t]);
  };
  function Sa(t, e) {
    for (
      var n = document.createDocumentFragment(), r = [], o = [], i = 0;
      i < e.length;
      i++
    ) {
      for (var s = e[i], a = [], c = [], l = 0; l < s.length; l++) {
        const p = s[l].render(t);
        const h = p.dom;
        const u = p.update;
        const f = ca('span', { class: fa + 'item' }, h);
        n.appendChild(f), c.push(f), a.push(u);
      }
      a.length &&
        (r.push(ka(a, c)),
        i < e.length - 1 &&
          o.push(n.appendChild(ca('span', { class: fa + 'separator' }))));
    }
    return {
      dom: n,
      update: function (t) {
        for (var e = !1, n = !1, i = 0; i < r.length; i++) {
          const s = r[i](t);
          i && (o[i - 1].style.display = n && s ? '' : 'none'),
            (n = s),
            s && (e = !0);
        }
        return e;
      },
    };
  }
  xa.prototype.render = function (t) {
    const e = ba(this.content, t);
    const n = ca(
      'div',
      { class: fa + '-submenu-label' },
      ma(t, this.options.label || ''),
    );
    const r = ca(
      'div',
      { class: fa + '-submenu-wrap' },
      n,
      ca('div', { class: fa + '-submenu' }, e.dom),
    );
    let o = null;
    return (
      n.addEventListener('mousedown', function (t) {
        t.preventDefault(),
          ga(t),
          Ia(r, fa + '-submenu-wrap-active', !1),
          o ||
            window.addEventListener(
              'mousedown',
              (o = function () {
                ya(r) ||
                  (r.classList.remove(fa + '-submenu-wrap-active'),
                  window.removeEventListener('mousedown', o),
                  (o = null));
              }),
            );
      }),
      {
        dom: r,
        update: function (t) {
          const n = e.update(t);
          return (r.style.display = n ? '' : 'none'), n;
        },
      }
    );
  };
  const Ma = {
    join: {
      width: 800,
      height: 900,
      path: 'M0 75h800v125h-800z M0 825h800v-125h-800z M250 400h100v-100h100v100h100v100h-100v100h-100v-100h-100z',
    },
    lift: {
      width: 1024,
      height: 1024,
      path: 'M219 310v329q0 7-5 12t-12 5q-8 0-13-5l-164-164q-5-5-5-13t5-13l164-164q5-5 13-5 7 0 12 5t5 12zM1024 749v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12zM1024 530v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 310v109q0 7-5 12t-12 5h-621q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h621q7 0 12 5t5 12zM1024 91v109q0 7-5 12t-12 5h-987q-7 0-12-5t-5-12v-109q0-7 5-12t12-5h987q7 0 12 5t5 12z',
    },
    selectParentNode: { text: '⬚', css: 'font-weight: bold' },
    undo: {
      width: 1024,
      height: 1024,
      path: 'M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z',
    },
    redo: {
      width: 1024,
      height: 1024,
      path: 'M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z',
    },
    strong: {
      width: 805,
      height: 1024,
      path: 'M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z',
    },
    em: {
      width: 585,
      height: 1024,
      path: 'M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z',
    },
    code: {
      width: 896,
      height: 1024,
      path: 'M608 192l-96 96 224 224-224 224 96 96 288-320-288-320zM288 192l-288 320 288 320 96-96-224-224 224-224-96-96z',
    },
    link: {
      width: 951,
      height: 1024,
      path: 'M832 694q0-22-16-38l-118-118q-16-16-38-16-24 0-41 18 1 1 10 10t12 12 8 10 7 14 2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM430 292q0-22-16-38l-117-118q-16-16-38-16-22 0-38 15l-84 83q-16 16-16 38 0 22 16 38l118 118q15 15 38 15 24 0 41-17-1-1-10-10t-12-12-8-10-7-14-2-15q0-22 16-38t38-16q8 0 15 2t14 7 10 8 12 12 10 10q18-17 18-41zM941 694q0 68-48 116l-84 83q-47 47-116 47-69 0-116-48l-117-118q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48l-118-118q-48-48-48-116t48-116l84-83q47-47 116-47 69 0 116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z',
    },
    bulletList: {
      width: 768,
      height: 896,
      path: 'M0 512h128v-128h-128v128zM0 256h128v-128h-128v128zM0 768h128v-128h-128v128zM256 512h512v-128h-512v128zM256 256h512v-128h-512v128zM256 768h512v-128h-512v128z',
    },
    orderedList: {
      width: 768,
      height: 896,
      path: 'M320 512h448v-128h-448v128zM320 768h448v-128h-448v128zM320 128v128h448v-128h-448zM79 384h78v-256h-36l-85 23v50l43-2v185zM189 590c0-36-12-78-96-78-33 0-64 6-83 16l1 66c21-10 42-15 67-15s32 11 32 28c0 26-30 58-110 112v50h192v-67l-91 2c49-30 87-66 87-113l1-1z',
    },
    blockquote: {
      width: 640,
      height: 896,
      path: 'M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z',
    },
  };
  const Ca = new da({
    title: 'Join with above block',
    run: Yi,
    select: function (t) {
      return Yi(t);
    },
    icon: Ma.join,
  });
  const Oa = new da({
    title: 'Lift out of enclosing block',
    run: ts,
    select: function (t) {
      return ts(t);
    },
    icon: Ma.lift,
  });
  const Na = new da({
    title: 'Select parent node',
    run: cs,
    select: function (t) {
      return cs(t);
    },
    icon: Ma.selectParentNode,
  });
  const Da = new da({
    title: 'Undo last change',
    run: qi,
    enable: function (t) {
      return qi(t);
    },
    icon: Ma.undo,
  });
  const Ta = new da({
    title: 'Redo last undone change',
    run: Li,
    enable: function (t) {
      return Li(t);
    },
    icon: Ma.redo,
  });
  function Aa(t, e) {
    const n = {
      run: function (n, r) {
        return ds(t, e.attrs)(n, r);
      },
      select: function (n) {
        return ds(t, e.attrs)(n);
      },
    };
    for (const r in e) n[r] = e[r];
    return new da(n);
  }
  function Ea(t, e) {
    const n = ms(t, e.attrs);
    const r = {
      run: n,
      enable: function (t) {
        return n(t);
      },
      active: function (n) {
        const r = n.selection;
        const o = r.$from;
        const i = r.to;
        const s = r.node;
        return s
          ? s.hasMarkup(t, e.attrs)
          : i <= o.end() && o.parent.hasMarkup(t, e.attrs);
      },
    };
    for (const o in e) r[o] = e[o];
    return new da(r);
  }
  function Ia(t, e, n) {
    n ? t.classList.add(e) : t.classList.remove(e);
  }
  const Ra = 'ProseMirror-menubar';
  function za(t) {
    return new Te({
      view: function (e) {
        return new Pa(e, t);
      },
    });
  }
  var Pa = function (t, e) {
    const n = this;
    (this.editorView = t),
      (this.options = e),
      (this.spacer = null),
      (this.maxHeight = 0),
      (this.widthForMaxHeight = 0),
      (this.floating = !1),
      (this.scrollHandler = null),
      (this.wrapper = ca('div', { class: Ra + '-wrapper' })),
      (this.menu = this.wrapper.appendChild(ca('div', { class: Ra }))),
      (this.menu.className = Ra),
      t.dom.parentNode && t.dom.parentNode.replaceChild(this.wrapper, t.dom),
      this.wrapper.appendChild(t.dom);
    const r = Sa(this.editorView, this.options.content);
    const o = r.dom;
    const i = r.update;
    if (
      ((this.contentUpdate = i),
      this.menu.appendChild(o),
      this.update(),
      e.floating &&
        !(function () {
          if (typeof navigator === 'undefined') return !1;
          const t = navigator.userAgent;
          return (
            !/Edge\/\d/.test(t) &&
            /AppleWebKit/.test(t) &&
            /Mobile\/\w+/.test(t)
          );
        })())
    ) {
      this.updateFloat();
      const s = (function (t) {
        for (var e = [window], n = t.parentNode; n; n = n.parentNode) e.push(n);
        return e;
      })(this.wrapper);
      (this.scrollHandler = function (t) {
        const e = n.editorView.root;
        (e.body || e).contains(n.wrapper)
          ? n.updateFloat(t.target.getBoundingClientRect ? t.target : void 0)
          : s.forEach(function (t) {
              return t.removeEventListener('scroll', n.scrollHandler);
            });
      }),
        s.forEach(function (t) {
          return t.addEventListener('scroll', n.scrollHandler);
        });
    }
  };
  (Pa.prototype.update = function () {
    this.contentUpdate(this.editorView.state),
      this.floating
        ? this.updateScrollCursor()
        : (this.menu.offsetWidth != this.widthForMaxHeight &&
            ((this.widthForMaxHeight = this.menu.offsetWidth),
            (this.maxHeight = 0)),
          this.menu.offsetHeight > this.maxHeight &&
            ((this.maxHeight = this.menu.offsetHeight),
            (this.menu.style.minHeight = this.maxHeight + 'px')));
  }),
    (Pa.prototype.updateScrollCursor = function () {
      const t = this.editorView.root.getSelection();
      if (t.focusNode) {
        const e = t.getRangeAt(0).getClientRects();
        const n =
          e[
            (function (t) {
              if (t.anchorNode == t.focusNode)
                return t.anchorOffset > t.focusOffset;
              return (
                t.anchorNode.compareDocumentPosition(t.focusNode) ==
                Node.DOCUMENT_POSITION_FOLLOWING
              );
            })(t)
              ? 0
              : e.length - 1
          ];
        if (n) {
          const r = this.menu.getBoundingClientRect();
          if (n.top < r.bottom && n.bottom > r.top) {
            const o = (function (t) {
              for (let e = t.parentNode; e; e = e.parentNode)
                if (e.scrollHeight > e.clientHeight) return e;
            })(this.wrapper);
            o && (o.scrollTop -= r.bottom - n.top);
          }
        }
      }
    }),
    (Pa.prototype.updateFloat = function (t) {
      const e = this.wrapper;
      const n = e.getBoundingClientRect();
      const r = t ? Math.max(0, t.getBoundingClientRect().top) : 0;
      if (this.floating)
        if (n.top >= r || n.bottom < this.menu.offsetHeight + 10)
          (this.floating = !1),
            (this.menu.style.position =
              this.menu.style.left =
              this.menu.style.top =
              this.menu.style.width =
                ''),
            (this.menu.style.display = ''),
            this.spacer.parentNode.removeChild(this.spacer),
            (this.spacer = null);
        else {
          const o = (e.offsetWidth - e.clientWidth) / 2;
          (this.menu.style.left = n.left + o + 'px'),
            (this.menu.style.display =
              n.top > window.innerHeight ? 'none' : ''),
            t && (this.menu.style.top = r + 'px');
        }
      else if (n.top < r && n.bottom >= this.menu.offsetHeight + 10) {
        this.floating = !0;
        const i = this.menu.getBoundingClientRect();
        (this.menu.style.left = i.left + 'px'),
          (this.menu.style.width = i.width + 'px'),
          t && (this.menu.style.top = r + 'px'),
          (this.menu.style.position = 'fixed'),
          (this.spacer = ca('div', {
            class: Ra + '-spacer',
            style: 'height: ' + i.height + 'px',
          })),
          e.insertBefore(this.spacer, this.menu);
      }
    }),
    (Pa.prototype.destroy = function () {
      this.wrapper.parentNode &&
        this.wrapper.parentNode.replaceChild(this.editorView.dom, this.wrapper);
    });
  const Ba = Object.freeze({
    __proto__: null,
    Dropdown: wa,
    DropdownSubmenu: xa,
    MenuItem: da,
    blockTypeItem: Ea,
    icons: Ma,
    joinUpItem: Ca,
    liftItem: Oa,
    menuBar: za,
    redoItem: Ta,
    renderGrouped: Sa,
    selectParentNodeItem: Na,
    undoItem: Da,
    wrapItem: Aa,
  });
  const _a = 'ProseMirror-prompt';
  function Va(t) {
    const e = document.body.appendChild(document.createElement('div'));
    e.className = _a;
    const n = function (t) {
      e.contains(t.target) || r();
    };
    setTimeout(function () {
      return window.addEventListener('mousedown', n);
    }, 50);
    var r = function () {
      window.removeEventListener('mousedown', n),
        e.parentNode && e.parentNode.removeChild(e);
    };
    const o = [];
    for (const i in t.fields) o.push(t.fields[i].render());
    const s = document.createElement('button');
    (s.type = 'submit'), (s.className = _a + '-submit'), (s.textContent = 'OK');
    const a = document.createElement('button');
    (a.type = 'button'),
      (a.className = _a + '-cancel'),
      (a.textContent = 'Cancel'),
      a.addEventListener('click', r);
    const c = e.appendChild(document.createElement('form'));
    t.title &&
      (c.appendChild(document.createElement('h5')).textContent = t.title),
      o.forEach(function (t) {
        c.appendChild(document.createElement('div')).appendChild(t);
      });
    const l = c.appendChild(document.createElement('div'));
    (l.className = _a + '-buttons'),
      l.appendChild(s),
      l.appendChild(document.createTextNode(' ')),
      l.appendChild(a);
    const p = e.getBoundingClientRect();
    (e.style.top = (window.innerHeight - p.height) / 2 + 'px'),
      (e.style.left = (window.innerWidth - p.width) / 2 + 'px');
    const h = function () {
      const e = (function (t, e) {
        const n = Object.create(null);
        let r = 0;
        for (const o in t) {
          const i = t[o];
          const s = e[r++];
          const a = i.read(s);
          const c = i.validate(a);
          if (c) return Fa(s, c), null;
          n[o] = i.clean(a);
        }
        return n;
      })(t.fields, o);
      e && (r(), t.callback(e));
    };
    c.addEventListener('submit', function (t) {
      t.preventDefault(), h();
    }),
      c.addEventListener('keydown', function (t) {
        t.keyCode == 27
          ? (t.preventDefault(), r())
          : 13 != t.keyCode || t.ctrlKey || t.metaKey || t.shiftKey
          ? t.keyCode == 9 &&
            window.setTimeout(function () {
              e.contains(document.activeElement) || r();
            }, 500)
          : (t.preventDefault(), h());
      });
    const u = c.elements[0];
    u && u.focus();
  }
  function Fa(t, e) {
    const n = t.parentNode;
    const r = n.appendChild(document.createElement('div'));
    (r.style.left = t.offsetLeft + t.offsetWidth + 2 + 'px'),
      (r.style.top = t.offsetTop - 5 + 'px'),
      (r.className = 'ProseMirror-invalid'),
      (r.textContent = e),
      setTimeout(function () {
        return n.removeChild(r);
      }, 1500);
  }
  const $a = function (t) {
    this.options = t;
  };
  ($a.prototype.read = function (t) {
    return t.value;
  }),
    ($a.prototype.validateType = function (t) {
      return null;
    }),
    ($a.prototype.validate = function (t) {
      return !t && this.options.required
        ? 'Required field'
        : this.validateType(t) ||
            (this.options.validate ? this.options.validate(t) : null);
    }),
    ($a.prototype.clean = function (t) {
      return this.options.clean ? this.options.clean(t) : t;
    });
  const qa = (function (t) {
    function e() {
      t.apply(this, arguments);
    }
    return (
      t && (e.__proto__ = t),
      (e.prototype = Object.create(t && t.prototype)),
      (e.prototype.constructor = e),
      (e.prototype.render = function () {
        const t = document.createElement('input');
        return (
          (t.type = 'text'),
          (t.placeholder = this.options.label),
          (t.value = this.options.value || ''),
          (t.autocomplete = 'off'),
          t
        );
      }),
      e
    );
  })($a);
  function La(t, e) {
    for (let n = t.selection.$from, r = n.depth; r >= 0; r--) {
      const o = n.index(r);
      if (n.node(r).canReplaceWith(o, o, e)) return !0;
    }
    return !1;
  }
  function ja(t, e) {
    const n = { label: e.title, run: t };
    for (const r in e) n[r] = e[r];
    return (
      e.enable ||
        e.select ||
        (n[e.enable ? 'enable' : 'select'] = function (e) {
          return t(e);
        }),
      new da(n)
    );
  }
  function Ja(t, e) {
    const n = t.selection;
    const r = n.from;
    const o = n.$from;
    const i = n.to;
    return n.empty
      ? !!e.isInSet(t.storedMarks || o.marks())
      : t.doc.rangeHasMark(r, i, e);
  }
  function Wa(t, e) {
    const n = {
      active: function (e) {
        return Ja(e, t);
      },
    };
    for (const r in e) n[r] = e[r];
    return ja(vs(t), n);
  }
  function Ka(t, e) {
    return ja(Ws(t, e.attrs), e);
  }
  function Ha(t) {
    let e;
    let n;
    let r;
    let o;
    const i = {};
    if (
      ((e = t.marks.strong) &&
        (i.toggleStrong = Wa(e, {
          title: 'Toggle strong style',
          icon: Ma.strong,
        })),
      (e = t.marks.em) &&
        (i.toggleEm = Wa(e, { title: 'Toggle emphasis', icon: Ma.em })),
      (e = t.marks.code) &&
        (i.toggleCode = Wa(e, { title: 'Toggle code font', icon: Ma.code })),
      (e = t.marks.link) &&
        (i.toggleLink =
          ((n = e),
          new da({
            title: 'Add or remove link',
            icon: Ma.link,
            active: function (t) {
              return Ja(t, n);
            },
            enable: function (t) {
              return !t.selection.empty;
            },
            run: function (t, e, r) {
              if (Ja(t, n)) return vs(n)(t, e), !0;
              Va({
                title: 'Create a link',
                fields: {
                  href: new qa({ label: 'Link target', required: !0 }),
                  title: new qa({ label: 'Title' }),
                },
                callback: function (t) {
                  vs(n, t)(r.state, r.dispatch), r.focus();
                },
              });
            },
          }))),
      (r = t.nodes.image) &&
        (i.insertImage =
          ((o = r),
          new da({
            title: 'Insert image',
            label: 'Image',
            enable: function (t) {
              return La(t, o);
            },
            run: function (t, e, n) {
              const r = t.selection;
              const i = r.from;
              const s = r.to;
              let a = null;
              t.selection instanceof me &&
                t.selection.node.type == o &&
                (a = t.selection.node.attrs),
                Va({
                  title: 'Insert image',
                  fields: {
                    src: new qa({
                      label: 'Location',
                      required: !0,
                      value: a && a.src,
                    }),
                    title: new qa({ label: 'Title', value: a && a.title }),
                    alt: new qa({
                      label: 'Description',
                      value: a ? a.alt : t.doc.textBetween(i, s, ' '),
                    }),
                  },
                  callback: function (t) {
                    n.dispatch(
                      n.state.tr.replaceSelectionWith(o.createAndFill(t)),
                    ),
                      n.focus();
                  },
                });
            },
          }))),
      (r = t.nodes.bullet_list) &&
        (i.wrapBulletList = Ka(r, {
          title: 'Wrap in bullet list',
          icon: Ma.bulletList,
        })),
      (r = t.nodes.ordered_list) &&
        (i.wrapOrderedList = Ka(r, {
          title: 'Wrap in ordered list',
          icon: Ma.orderedList,
        })),
      (r = t.nodes.blockquote) &&
        (i.wrapBlockQuote = Aa(r, {
          title: 'Wrap in block quote',
          icon: Ma.blockquote,
        })),
      (r = t.nodes.paragraph) &&
        (i.makeParagraph = Ea(r, {
          title: 'Change to paragraph',
          label: 'Plain',
        })),
      (r = t.nodes.code_block) &&
        (i.makeCodeBlock = Ea(r, {
          title: 'Change to code block',
          label: 'Code',
        })),
      (r = t.nodes.heading))
    )
      for (let s = 1; s <= 10; s++)
        i['makeHead' + s] = Ea(r, {
          title: 'Change to heading ' + s,
          label: 'Level ' + s,
          attrs: { level: s },
        });
    if ((r = t.nodes.horizontal_rule)) {
      const a = r;
      i.insertHorizontalRule = new da({
        title: 'Insert horizontal rule',
        label: 'Horizontal rule',
        enable: function (t) {
          return La(t, a);
        },
        run: function (t, e) {
          e(t.tr.replaceSelectionWith(a.create()));
        },
      });
    }
    const c = function (t) {
      return t.filter(function (t) {
        return t;
      });
    };
    return (
      (i.insertMenu = new wa(c([i.insertImage, i.insertHorizontalRule]), {
        label: 'Insert',
      })),
      (i.typeMenu = new wa(
        c([
          i.makeParagraph,
          i.makeCodeBlock,
          i.makeHead1 &&
            new xa(
              c([
                i.makeHead1,
                i.makeHead2,
                i.makeHead3,
                i.makeHead4,
                i.makeHead5,
                i.makeHead6,
              ]),
              { label: 'Heading' },
            ),
        ]),
        { label: 'Type...' },
      )),
      (i.inlineMenu = [
        c([i.toggleStrong, i.toggleEm, i.toggleCode, i.toggleLink]),
      ]),
      (i.blockMenu = [
        c([i.wrapBulletList, i.wrapOrderedList, i.wrapBlockQuote, Ca, Oa, Na]),
      ]),
      (i.fullMenu = i.inlineMenu.concat(
        [[i.insertMenu, i.typeMenu]],
        [[Da, Ta]],
        i.blockMenu,
      )),
      i
    );
  }
  const Ua =
    'undefined' !== typeof navigator &&
    /Mac|iP(hone|[oa]d)/.test(navigator.platform);
  function Ga(t, e) {
    let n;
    const r = {};
    function o(t, n) {
      if (e) {
        const o = e[t];
        if (!1 === o) return;
        o && (t = o);
      }
      r[t] = n;
    }
    if (
      (o('Mod-z', qi),
      o('Shift-Mod-z', Li),
      o('Backspace', ui),
      Ua || o('Mod-y', Li),
      o('Alt-ArrowUp', Yi),
      o('Alt-ArrowDown', Zi),
      o('Mod-BracketLeft', ts),
      o('Escape', cs),
      (n = t.marks.strong) && (o('Mod-b', vs(n)), o('Mod-B', vs(n))),
      (n = t.marks.em) && (o('Mod-i', vs(n)), o('Mod-I', vs(n))),
      (n = t.marks.code) && o('Mod-`', vs(n)),
      (n = t.nodes.bullet_list) && o('Shift-Ctrl-8', Ws(n)),
      (n = t.nodes.ordered_list) && o('Shift-Ctrl-9', Ws(n)),
      (n = t.nodes.blockquote) && o('Ctrl->', ds(n)),
      (n = t.nodes.hard_break))
    ) {
      const i = n;
      const s = ys(rs, function (t, e) {
        return (
          e && e(t.tr.replaceSelectionWith(i.create()).scrollIntoView()), !0
        );
      });
      o('Mod-Enter', s), o('Shift-Enter', s), Ua && o('Ctrl-Enter', s);
    }
    if (
      ((n = t.nodes.list_item) &&
        (o('Enter', Ks(n)), o('Mod-[', Hs(n)), o('Mod-]', Us(n))),
      (n = t.nodes.paragraph) && o('Shift-Ctrl-0', ms(n)),
      (n = t.nodes.code_block) && o('Shift-Ctrl-\\', ms(n)),
      (n = t.nodes.heading))
    )
      for (let a = 1; a <= 6; a++) o('Shift-Ctrl-' + a, ms(n, { level: a }));
    if ((n = t.nodes.horizontal_rule)) {
      const c = n;
      o('Mod-_', function (t, e) {
        return (
          e && e(t.tr.replaceSelectionWith(c.create()).scrollIntoView()), !0
        );
      });
    }
    return r;
  }
  function Qa(t) {
    let e;
    const n = wi.concat(di, fi);
    return (
      (e = t.nodes.blockquote) && n.push(bi(/^\s*>\s$/, e)),
      (e = t.nodes.ordered_list) &&
        n.push(
          (function (t) {
            return bi(
              /^(\d+)\.\s$/,
              t,
              function (t) {
                return { order: Number(t[1]) };
              },
              function (t, e) {
                return e.childCount + e.attrs.order == Number(t[1]);
              },
            );
          })(e),
        ),
      (e = t.nodes.bullet_list) &&
        n.push(
          (function (t) {
            return bi(/^\s*([-+*])\s$/, t);
          })(e),
        ),
      (e = t.nodes.code_block) &&
        n.push(
          (function (t) {
            return ki(/^```$/, t);
          })(e),
        ),
      (e = t.nodes.heading) &&
        n.push(
          (function (t, e) {
            return ki(new RegExp('^(#{1,' + e + '})\\s$'), t, function (t) {
              return { level: t[1].length };
            });
          })(e, 6),
        ),
      pi({ rules: n })
    );
  }
  const Xa = Object.freeze({
    __proto__: null,
    buildInputRules: Qa,
    buildKeymap: Ga,
    buildMenuItems: Ha,
    exampleSetup: function (t) {
      const e = [Qa(t.schema), si(Ga(t.schema, t.mapKeys)), si(Ms), Qs(), ea()];
      return (
        !1 !== t.menuBar &&
          e.push(
            za({
              floating: !1 !== t.floatingMenu,
              content: t.menuContent || Ha(t.schema).fullMenu,
            }),
          ),
        !1 !== t.history && e.push($i()),
        e.concat(
          new Te({
            props: { attributes: { class: 'ProseMirror-example-setup-style' } },
          }),
        )
      );
    },
  });
  window.PM = {
    model: vt,
    transform: se,
    state: Re,
    view: Uo,
    keymap: ci,
    inputrules: xi,
    history: ji,
    commands: Cs,
    schema_basic: _s,
    schema_list: Gs,
    dropcursor: Ys,
    menu: Ba,
    example_setup: Xa,
    gapcursor: aa,
  };
})();
