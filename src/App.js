import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

export default function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));

  function handleClick(i) {
    if (squares[i] || calcurateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = "O";

    if (calcurateWinner(nextSquares)) {
      // ユーザーのターンでゲーム終了
      setSquares(nextSquares);
      return;
    }

    // AIのターン
    const state_index = calcurateStateIndex(nextSquares);
    fetch(`http://localhost:8080/api/state_action?state_index=${state_index}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        nextSquares[data.action] = 'X'
        setSquares(nextSquares);
      })
      .catch(error => {
        console.error('Error fetching message:', error.message);
      });
  }

  const winner = calcurateWinner(squares);
  let status;
  if (winner === 'O' || winner === 'X') {
    status = "Winner: " + winner;
  } else if (winner === '_') {
    status = "Draw";
  } else {
    status = "Next player: " + "O";
  }


  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={()=> handleClick(0)} />
        <Square value={squares[1]} onSquareClick={()=> handleClick(1)} />
        <Square value={squares[2]} onSquareClick={()=> handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={()=> handleClick(3)} />
        <Square value={squares[4]} onSquareClick={()=> handleClick(4)} />
        <Square value={squares[5]} onSquareClick={()=> handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={()=> handleClick(6)} />
        <Square value={squares[7]} onSquareClick={()=> handleClick(7)} />
        <Square value={squares[8]} onSquareClick={()=> handleClick(8)} />
      </div>
    </>
  );
}

function calcurateStateIndex(squares) {
  let index = 0;
  for (let i = 0; i < 9; i++) {
    let value;
    const flip_index = [0, 3, 6, 1, 4, 7, 2, 5, 8]
    const cell = squares[flip_index[i]];
    console.log(cell)

    if (cell === null) {
      value = 0;
    } else if (cell === "O") {
      value = 1;
    } else if (cell === "X") {
      value = 2;
    } else {
      console.error(`calcurateStateIndex() state[${Math.floor(i / 3)}][${i % 3}] is invalid '${cell}'`);
      return null; // エラーハンドリングのため関数を終了
    }

    index += value * Math.pow(3, i);
  }
  console.log(index)
  return index;
}

function calcurateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      return null
    }
  }
  return '_'
}