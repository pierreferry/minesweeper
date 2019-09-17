import React, { useContext } from "react";
import classNames from "classnames";
import { DebugContext } from "./App";

export interface Cell {
  value: number;
  key: number;
  isBomb: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
}

interface CellProps {
  cell: Cell;
  handleClick: () => void;
}

export default function Cell({ cell, handleClick }: CellProps) {
  const { isDebug } = useContext(DebugContext);

  function cellContent() {
    if (!cell.isRevealed && !isDebug) {
      return null;
    }
    return cell.isBomb ? "X" : cell.value || " ";
  }

  return (
    <div
      onClick={handleClick}
      className={classNames("minesweeper-cell", {
        "minesweeper-cell--revealed": cell.isRevealed
      })}
    >
      {cellContent()}
    </div>
  );
}
