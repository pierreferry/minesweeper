import React, { useContext, MouseEvent } from "react";
import classNames from "classnames";
import { DebugContext } from "./App";
import { FaBomb, FaFlag } from "react-icons/fa";

export interface Cell {
  value: number;
  isBomb: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
}

interface CellProps {
  cell: Cell;
  handleClick: () => void;
  handleRightClick: (event: MouseEvent<HTMLDivElement>) => void;
}

export default function Cell({
  cell,
  handleClick,
  handleRightClick
}: CellProps) {
  const { isDebug } = useContext(DebugContext);

  function cellContent() {
    if (!cell.isRevealed) {
      if (cell.isFlagged) {
        return <FaFlag />;
      }
      if (!isDebug) {
        return null;
      }
    }
    if (cell.isBomb) {
      return <FaBomb />;
    }
    return cell.value || " ";
  }

  return (
    <div
      onContextMenu={handleRightClick}
      onClick={handleClick}
      className={classNames("minesweeper-cell", {
        "minesweeper-cell--revealed": cell.isRevealed,
        "minesweeper-cell--revealed-bomb": cell.isRevealed && cell.isBomb
      })}
    >
      {cellContent()}
    </div>
  );
}
