"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Cell = "X" | "O" | null;

const WIN_COMBINATIONS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<Cell | "draw" | null>(null);
  const [history, setHistory] = useState<{ wins: number; losses: number; draws: number }>({
    wins: 0,
    losses: 0,
    draws: 0,
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ticTacToeHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Persist history on change
  useEffect(() => {
    localStorage.setItem("ticTacToeHistory", JSON.stringify(history));
  }, [history]);

  const checkWinner = (s: Cell[]): Cell | "draw" | null => {
    for (const combo of WIN_COMBINATIONS) {
      const [a, b, c] = combo;
      if (s[a] && s[a] === s[b] && s[a] === s[c]) {
        return s[a];
      }
    }
    if (s.every((v) => v)) {
      return "draw";
    }
    return null;
  };

  const handleClick = (idx: number) => {
    if (winner || board[idx]) return;
    const newBoard = [...board];
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      updateHistory(result);
    } else {
      setXIsNext(!xIsNext);
    }
  };

  const updateHistory = (result: Cell | "draw") => {
    if (result === "draw") {
      setHistory((h) => ({ ...h, draws: h.draws + 1 }));
    } else if (result === "X") {
      setHistory((h) => ({ ...h, wins: h.wins + 1 }));
    } else if (result === "O") {
      setHistory((h) => ({ ...h, losses: h.losses + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  // Simple AI: pick a random empty cell after human move
  useEffect(() => {
    if (!winner && !xIsNext) {
      const emptyIndices = board
        .map((v, i) => (v === null ? i : null))
        .filter((v): v is number => v !== null);
      if (emptyIndices.length === 0) return;
      const aiIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newBoard = [...board];
      newBoard[aiIdx] = "O";
      setBoard(newBoard);
      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result);
        updateHistory(result);
      } else {
        setXIsNext(true);
      }
    }
  }, [board, winner, xIsNext]);

  const renderCell = (idx: number) => {
    const value = board[idx];
    const isWinningCell = winner && winner !== "draw" && WIN_COMBINATIONS.some((combo) => combo.includes(idx) && combo.every((i) => board[i] === winner));
    return (
      <Button
        key={idx}
        variant="outline"
        className={cn(
          "w-20 h-20 rounded-lg text-4xl font-bold",
          isWinningCell && "bg-gradient-to-r from-cyan-400 to-magenta-400 animate-pulse",
          value && "text-white"
        )}
        onClick={() => handleClick(idx)}
      >
        {value}
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <h1 className="text-3xl font-bold text-white">Tic‑Tac‑Toe Arcade</h1>
      <div className="grid grid-cols-3 gap-2">
        {board.map((_, idx) => renderCell(idx))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-white">
          {winner
            ? winner === "draw"
              ? "Draw!"
              : `${winner} Wins!`
            : `Turn: ${xIsNext ? "X" : "O"}`}
        </span>
        <Button onClick={resetGame} variant="secondary" className="mt-2">
          Reset Game
        </Button>
      </div>
      <div className="flex flex-col items-center gap-1 mt-4">
        <span className="text-white">History</span>
        <div className="flex gap-4 text-white">
          <span>Wins: {history.wins}</span>
          <span>Losses: {history.losses}</span>
          <span>Draws: {history.draws}</span>
        </div>
      </div>
    </div>
  );
}
