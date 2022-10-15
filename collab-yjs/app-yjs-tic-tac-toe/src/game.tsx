import * as React from 'react';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import { Board } from './board';
import { calculateWinner } from './calculate-winner';

const ydoc = new Y.Doc();
const provider = new WebrtcProvider(`tutorial-tic-tac-toe`, ydoc);

/**
 * - 井字棋游戏app，仅此文件使用了yjs，其他文件都是普通js逻辑
 * - https://blog.tooljet.com/multiplayer-tic-tac-toe-using-react-crdt-yjs/
 */
export class Game extends React.Component<
  Record<string, any>,
  Record<string, any>
> {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  componentDidMount() {
    const ymap = ydoc.getMap('state');
    ymap.observe(() => {
      this.setState({
        ...ymap.get('state'),
      });
      console.log('helo', ymap.get('state'));
    });
  }

  componentWillUnmount() {
    provider.disconnect();
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState(
      {
        history: history.concat([
          {
            squares: squares,
          },
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      },
      () => {
        const ymap = ydoc.getMap('state');
        ymap.set('state', this.state);
      },
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? 'Move #' + move : 'Game start';
      return (
        <li key={move}>
          <a href='#' onClick={() => this.jumpTo(move)}>
            {desc}
          </a>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className='game'>
        <div className='game-board'>
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className='game-info'>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}
