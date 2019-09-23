import React, { memo, useState } from "react";
import CellElement, { Cell } from "./Cell";
import { List } from "immutable";

interface GridProps {
  size: number;
  mineCount: number;
}

export type Grid = List<List<Cell>>;

function Grid({ size, mineCount }: GridProps) {
  const [grid, setGrid] = useState(makeGrid(size, mineCount));

  function handleClick(x: number, y: number) {
    let newGrid = revealCell(grid, x, y);
    // Game lost ? win ?

    if (grid.getIn([y, x, "value"]) === 0) {
      newGrid = revealCellAndSurroundings(grid, x, y);
    }
    setGrid(newGrid);
  }

  function handleRightClick(x: number, y: number) {
    setGrid(flagCell(grid, x, y));
  }

  return (
    <div>
      {grid.map((row, y) => {
        return (
          <div className="minesweeper-row" key={y}>
            {row.map((cell, x) => (
              <CellElement
                key={cell.key}
                cell={cell}
                handleClick={() => handleClick(x, y)}
                handleRightClick={e => {
                  e.preventDefault();
                  handleRightClick(x, y);
                  return false;
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function makeGrid(size: number, mineCount: number) {
  function addBombs(grid: Grid) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);

    if (!grid.getIn([y, x, "isBomb"])) {
      grid = grid.setIn([y, x, "isBomb"], true);
      grid = incrementSurroundingCells(grid, x, y);
    } else {
      grid = addBombs(grid);
    }

    return grid;
  }

  let grid = List(
    Array(size)
      .fill(null)
      .map(() =>
        List(
          Array(size)
            .fill(null)
            .map(makeCells)
        )
      )
  );

  for (let i = 0; i < mineCount; i++) {
    grid = addBombs(grid);
  }

  return grid;
}

function makeCells(_: any, index: number): Cell {
  return {
    value: 0,
    key: index,
    isBomb: false,
    isRevealed: false,
    isFlagged: false
  };
}

function incrementIfExists(grid: Grid, x: number, y: number) {
  if (x < 0 || y < 0) {
    // grid.get(-1) with return the last element of array
    return grid;
  }
  const cell = grid.getIn([y, x]);

  if (cell) {
    return grid.setIn([y, x, "value"], cell.value + 1);
  }
  return grid;
}

function incrementSurroundingCells(grid: Grid, x: number, y: number): Grid {
  const shifts = [-1, 0, 1];

  shifts.forEach(xShift => {
    shifts.forEach(yShift => {
      grid = incrementIfExists(grid, x + xShift, y + yShift);
    });
  });

  return grid;
}

function revealCell(grid: Grid, x: number, y: number) {
  return grid.setIn([y, x, "isRevealed"], true);
}

function revealIfExists(grid: Grid, x: number, y: number) {
  if (x < 0 || y < 0) {
    // grid.get(-1) with return the last element of array
    return grid;
  }
  const cell = grid.getIn([y, x]);

  if (cell && !cell.isRevealed) {
    grid = revealCell(grid, x, y);

    if (cell.value === 0) {
      grid = revealCellAndSurroundings(grid, x, y);
    }
  }

  return grid;
}

function revealCellAndSurroundings(grid: Grid, x: number, y: number): Grid {
  const shifts = [-1, 0, 1];

  shifts.forEach(xShift => {
    shifts.forEach(yShift => {
      grid = revealIfExists(grid, x + xShift, y + yShift);
    });
  });

  return grid;
}

function flagCell(grid: Grid, x: number, y: number) {
  const cell = grid.getIn([y, x]);
  if (cell.isRevealed) {
    return grid;
  }

  return grid.setIn([y, x, "isFlagged"], !cell.isFlagged);
}

export default memo(Grid);
