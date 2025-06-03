// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const stockfishRef = useRef(null);

  useEffect(() => {
    // Load Stockfish from CDN
    stockfishRef.current = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
    stockfishRef.current.postMessage('uci');
  }, []);

  const safeGameMutate = (modify) => {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  };

  const onDrop = (sourceSquare, targetSquare) => {
    let move = null;
    safeGameMutate((game) => {
      move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    });

    if (move === null) return false;
    setFen(game.fen());
    evaluateMove(game.fen());
    return true;
  };

  const evaluateMove = (fen) => {
    const stockfish = stockfishRef.current;
    if (!stockfish) return;

    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage('go depth 12');

    stockfish.onmessage = function (event) {
      const line = event.data;
      if (line.startsWith('info depth')) {
        console.log('Stockfish says:', line);
      }
    };
  };

  return (
    <div>
      <h2>Chess Trainer</h2>
      <Chessboard position={fen} onPieceDrop={onDrop} />
    </div>
  );
};

export default App;
