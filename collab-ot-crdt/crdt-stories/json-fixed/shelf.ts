// const shelf = {};

function is_obj(o) {
  return o && typeof o === 'object' && !Array.isArray(o);
}
function greater_than(a, b) {
  if (is_obj(b)) return false;
  if (is_obj(a)) return true;
  return JSON.stringify(a) > JSON.stringify(b);
}
function equal(a, b) {
  if (is_obj(a)) return is_obj(b);
  if (is_obj(b)) return false;
  return JSON.stringify(a) == JSON.stringify(b);
}

export const wrap = (s) =>
  is_obj(s)
    ? Object.fromEntries(Object.entries(s).map(([k, v]) => [k, wrap(v)]))
    : [s];

export const create = (init) => {
  const x = [null, -1];
  if (init !== undefined) merge(x, wrap(init));
  return x;
};

export const read = (s, ...path) => {
  s = path.reduce((s, x) => s?.[0]?.[x], s);
  if (s && is_obj(s[0])) {
    return Object.fromEntries(
      Object.entries(s[0])
        .map(([k, v]) => [k, read(v)])
        .filter(([k, v]) => v != null),
    );
  } else return s?.[0];
};

export const get = read;

export const get_change = (a, b) => {
  return merge(a, b, true);
};

export const merge = (a: any, b: any, dont_modify = false) => {
  let change: Record<string, any> | null = null;

  if (!a) a = [null, -1];
  if (!Array.isArray(b)) b = [b];

  const both_objs = is_obj(a[0]) && is_obj(b[0]);
  const eq = equal(a[0], b[0]);

  if (b[1] == null) b = [b[0], a[1] + (eq ? 0 : 1)];
  else if (b[1] == 'add') b = [a[0] + b[0], a[1] + 1];

  if (b[1] > (a[1] ?? -1) || (b[1] == a[1] && greater_than(b[0], a[0]))) {
    if (is_obj(b[0])) {
      if (!dont_modify) {
        a[0] = {};
        a[1] = b[1];
      }
      change = merge(dont_modify ? [{}, b[1]] : a, b, dont_modify);
      if (!change) change = [{}, b[1]];
    } else {
      if (!dont_modify) {
        a[0] = b[0];
        a[1] = b[1];
      }
      change = b;
    }
  } else if (b[1] == a[1] && both_objs) {
    for (const [k, v] of Object.entries(b[0])) {
      if (!dont_modify && !a[0][k]) a[0][k] = [null, -1];
      const diff = merge(a[0][k], v, dont_modify);
      if (diff) {
        if (!change) change = [{}, b[1]];
        change[0][k] = diff;
      }
    }
  }
  return change;
};

export const mask = (s, mask) => {
  return mask == true || !is_obj(s[0])
    ? s
    : [
        Object.fromEntries(
          Object.entries(mask)
            .filter(([k, v]) => s[0][k])
            .map(([k, v]) => [k, mask(s[0][k], v)]),
        ),
        s[1],
      ];
};

export const proxy = (s, cb) => {
  return new Proxy(s[0], {
    get(o, k) {
      if (k == Symbol.toPrimitive) return () => null;
      const x = o[k]?.[0];
      if (x && typeof x === 'object' && !Array.isArray(x)) {
        return proxy(o[k], (delta) => cb([{ [k]: delta }, s[1]]));
      } else return x;
    },
    set(o, k, v) {
      const x = merge(s, { [k]: v });
      if (x) cb(x);
      return true;
    },
    deleteProperty(o, k) {
      const x = merge(s, { [k]: null });
      if (x) cb(x);
      return true;
    },
    ownKeys(o) {
      return Reflect.ownKeys(o).filter((k) => o[k][0] != null);
    },
  });
};

export const local_update = (backend, frontend, override_new_version) => {
  if (equal(backend[0], frontend)) {
    if (is_obj(frontend)) {
      const ret = [{}, backend[1]];
      for (const [k, v] of Object.entries<any>(backend[0])) {
        if (v[0] != null && frontend[k] == null) {
          v[0] = null;
          v[1] = override_new_version || (v[1] ?? -1) + 1;
          ret[0][k] = v;
        }
      }
      for (const [k, v] of Object.entries(frontend)) {
        if (!backend[0][k]) backend[0][k] = [null, -1];
        const changes = local_update(backend[0][k], v, override_new_version);
        if (changes) ret[0][k] = changes;
      }
      return Object.keys(ret[0]).length ? ret : null;
    }
  } else {
    backend[1] = override_new_version || (backend[1] ?? -1) + 1;
    if (is_obj(frontend)) {
      backend[0] = {};
      for (const [k, v] of Object.entries(frontend)) {
        if (is_obj(v)) {
          backend[0][k] = [null, -1];
          local_update(backend[0][k], v, override_new_version);
        } else {
          backend[0][k] = [v, 0];
        }
      }
    } else backend[0] = frontend;
    return backend;
  }
};

export const remote_update = (a, f, b) => {
  if (b[1] > (a[1] ?? -1) || (b[1] == a[1] && greater_than(b[0], a[0]))) {
    a[1] = b[1];
    if (!is_obj(a[0]) && is_obj(f) && is_obj(b[0])) {
      a[0] = {};
      return remote_update(a, f, b);
    }
    if (is_obj(b[0])) {
      a[0] = {};
      merge(a, b);
    } else a[0] = b[0];
    f = read(a);
  } else if (b[1] == a[1] && is_obj(a[0]) && is_obj(b[0])) {
    if (is_obj(f)) {
      for (const [k, v] of Object.entries(b[0])) {
        if (!a[0][k]) a[0][k] = [null, -1];
        f[k] = remote_update(a[0][k], f[k], v);
        if (f[k] == null) delete f[k];
      }
    } else merge(a, b);
  }
  return f;
};

// to_braid = (s) => {
//   const vs = [];
//   const values = [];
//   function f(s) {
//     let x = s[0];
//     if (is_obj(x))
//       x = Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)]));
//     else {
//       values.push(x);
//       x = values.length - 1;
//     }
//     vs.push(s[1]);
//     return x;
//   }
//   return {
//     json_slice: f(s),
//     values,
//     version: `${Math.random().toString(36).slice(2)}:${vs.join(',')}`,
//   };
// };

// from_braid = ({ version, json_slice, values }) => {
//   let f = (x) => {
//     if (typeof x === 'object')
//       return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)]));
//     else return values[x];
//   };
//   const x = f(json_slice);

//   const vs = version
//     .split(':')[1]
//     .split(',')
//     .map((x) => Number(x));
//   f = (x) => {
//     return [
//       is_obj(x)
//         ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)]))
//         : x,
//       vs.shift(),
//     ];
//   };
//   return f(x);
// };
