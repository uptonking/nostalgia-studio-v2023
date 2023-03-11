import { rga } from './rga-peer';

describe('crdt-rga test', () => {
  it('gets the expected result after applying all the messages', () => {
    const valueAfter = withTypeUtils(rga);
    expect(valueAfter('hello world')).to.equal('hello world');
    expect(valueAfter('he<el<<ello  <world<d')).to.equal('hello world');
    expect(
      valueAfter([
        ['he', 'llo'],
        [' wor', 'ld'],
      ]),
    ).to.equal('hello world');
    expect(valueAfter(new Set(['hello', ' world']))).to.equal(' worldhello');
    expect(
      valueAfter([new Set(['hel', 'lo']), new Set([' wo', 'rld'])]),
    ).to.equal('lohelrld wo');
    expect(valueAfter('hello world0')).to.equal('0hello world');
    expect(valueAfter('hello world1')).to.equal('h1ello world');
  });
});

function withTypeUtils(type) {
  return valueAfter;

  function valueAfter(spec) {
    const state = stateFromOps(type.first(), opsFrom(spec));
    return type.valueOf(state).join('');
  }

  function stateFromOps(state, ops) {
    const changed = () => { };

    if (ops instanceof Set) {
      // concurrent state changes
      return concurrent(state, ops);
    }
    if (Array.isArray(ops)) {
      // sequential state changes
      return sequential(state, ops);
    }

    // one op
    const op = ops;
    const message = messageFromOp(state, op);
    let newState = state;
    if (message) {
      if (typeof message === 'function') {
        let messages;
        // pull(
        //   message,
        //   pull.collect((err, _messages) => {
        //     if (err) {
        //       throw err
        //     }
        //     messages = _messages
        //   }))
        // if (!messages) {
        //   throw new Error('!messages!!')
        // }

        // newState = messages.reduce((state, message) => type.reduce(message, state, changed), state)
      } else {
        newState = type.reduce(message, state, changed);
      }
    }

    return newState;
  }

  function concurrent(state, ops) {
    const changed = () => { };
    const messages = concurrentMessages(state, ops);
    return messages.reduce(
      (state, message) => type.reduce(message, state, changed),
      state,
    );
  }

  function sequential(state, ops) {
    return ops.reduce(stateFromOps, state);
  }

  function concurrentMessages(state, ops) {
    let messages: any[] = [];
    for (let op of ops) {
      if (op instanceof Set) {
        // concurrent state changes
        messages = messages.concat(concurrentMessages(state, op));
      } else if (Array.isArray(op)) {
        // sequential state changes
        messages = messages.concat(sequentialMessages(state, op));
      } else {
        messages.push(messageFromOp(state, op));
      }
    }
    return messages;
  }

  function sequentialMessages(state, ops) {
    const changed = () => { };
    const messages: any[] = [];
    ops.reduce((state, op) => {
      const message = messageFromOp(state, op);
      if (message) {
        messages.push(message);
        return type.reduce(message, state, changed);
      }
    }, state);
    return messages;
  }

  function messageFromOp(state, op) {
    return type.mutators[op.mutator].apply(state, op.args);
  }

  function opsFrom(spec) {
    if (spec instanceof Set) {
      return new Set(Array.from(spec).map(opsFrom));
    }
    if (Array.isArray(spec)) {
      return spec.map(opsFrom);
    }
    let index = -1;
    return spec.split('').map((c) => {
      if (c === '<') {
        const i = index;
        index--;
        return {
          mutator: 'removeAt',
          args: [i],
        };
      } else {
        index++;
        const pos = parseInt(c);
        if (Number.isInteger(pos)) {
          return {
            mutator: 'insertAt',
            args: [pos, c],
          };
        }
        return {
          mutator: 'push',
          args: [c],
        };
      }
    });
  }
}
