import React, { memo, useContext, useEffect, useState } from "react";
import * as R from "ramda";
import CellElement, { Cell } from "./Cell";
import { List } from "immutable";
import { GameContext, GameStatus } from "./App";

interface GridProps {
  size: number;
  mineCount: number;
}

export type Grid = List<List<Cell>>;

function Grid({ size, mineCount }: GridProps) {
  const [grid, setGrid] = useState(makeGrid(size, mineCount));
  const { isGameOver, setGameContext } = useContext(GameContext);

  useEffect(() => {
    setGameContext(gameStatus(grid));
  }, [grid, setGameContext]);

  function handleClick(x: number, y: number) {
    if (!isGameOver) {
      setGrid(revealCells(x, y, grid));
    }
  }

  function handleRightClick(x: number, y: number) {
    if (!isGameOver) {
      setGrid(flagCell(x, y, grid));
    }
  }

  return (
    <div className="minesweeper-grid">
      {grid.map((row, y) => (
        <div className="minesweeper-row" key={y}>
          {row.map((cell, x) => (
            <CellElement
              key={x}
              cell={cell}
              handleClick={() => handleClick(x, y)}
              handleRightClick={e => {
                e.preventDefault();
                handleRightClick(x, y);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function makeGrid(size: number, mineCount: number): List<List<Cell>> {
  function addBombs(grid: Grid) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);

    return R.ifElse(
      isNotBomb(x, y),
      R.pipe(
        setBomb(x, y),
        incrementSurroundingCells(x, y)
      ),
      addBombs
    )(grid);
  }
  let grid = List(R.repeat(makeRow(size), size));

  grid = R.reduce(addBombs, grid, R.range(0, mineCount));

  return grid;
}

function makeRow(size: number): List<Cell> {
  return List(R.repeat(makeCell(), size));
}

function makeCell(): Cell {
  return {
    value: 0,
    isBomb: false,
    isRevealed: false,
    isFlagged: false
  };
}

const isNotBomb = R.curry(
  (x: number, y: number, grid: Grid): boolean => !grid.getIn([y, x, "isBomb"])
);

const setBomb = R.curry(
  (x: number, y: number, grid: Grid): Grid => grid.setIn([y, x, "isBomb"], true)
);

const incrementValue = R.curry(
  (x: number, y: number, grid: Grid): Grid => {
    const cell = grid.getIn([y, x]);

    return grid.setIn([y, x, "value"], cell.value + 1);
  }
);

const incrementSurroundingCells = R.curry(
  (x: number, y: number, grid: Grid): Grid => {
    const shifts = [-1, 0, 1];

    shifts.forEach(xShift => {
      shifts.forEach(yShift => {
        const nx = x + xShift;
        const ny = y + yShift;

        grid = R.when(cellExists(nx, ny), incrementValue(nx, ny), grid);
      });
    });

    return grid;
  }
);

// List.get(-1) returns last element of List.
const cellExists = R.curry(
  (x: number, y: number, grid: Grid): boolean =>
    x >= 0 && y >= 0 && Boolean(grid.getIn([y, x]))
);

const isNotRevealed = R.curry(
  (x: number, y: number, grid: Grid): boolean =>
    grid.getIn([y, x, "isRevealed"]) === false
);

const isValueZero = R.curry(
  (x: number, y: number, grid: Grid): boolean =>
    grid.getIn([y, x, "value"]) === 0
);

const revealCell = R.curry(
  (x: number, y: number, grid: Grid): Grid =>
    grid.setIn([y, x, "isRevealed"], true)
);

const revealSurroundings = R.curry(
  (x: number, y: number, grid: Grid): Grid => {
    const shifts = [-1, 0, 1];

    shifts.forEach(xShift => {
      shifts.forEach(yShift => {
        const nx = x + xShift;
        const ny = y + yShift;

        grid = R.when(cellExists(nx, ny), revealCells(nx, ny), grid);
      });
    });

    return grid;
  }
);

const revealCells = R.curry(
  (x: number, y: number, grid: Grid): Grid =>
    R.when(
      isNotRevealed(x, y),
      R.pipe(
        revealCell(x, y),
        R.when(isValueZero(x, y), revealSurroundings(x, y))
      ),
      grid
    )
);

const toggleFlag = R.curry((x: number, y: number, grid: Grid) => {
  const cell = grid.getIn([y, x]);
  return grid.setIn([y, x, "isFlagged"], !cell.isFlagged);
});

const flagCell = R.curry((x: number, y: number, grid: Grid) =>
  R.when(isNotRevealed(x, y), toggleFlag(x, y), grid)
);

const gameStatus = (grid: Grid): GameStatus => {
  const size = grid.count();
  let gameStatus = {
    isGameOver: true,
    isGameWon: true
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = grid.getIn([y, x]);
      const { isRevealed, isFlagged, isBomb } = cell;

      if (isRevealed && isBomb) {
        return { isGameOver: true, isGameWon: false };
      }

      if (!isRevealed && !isFlagged) {
        gameStatus = R.assoc("isGameOver", false)(gameStatus);
      }

      if (isFlagged && !isBomb) {
        gameStatus = R.assoc("isGameWon", false)(gameStatus);
      }
    }
  }

  return gameStatus;
};

export default memo(Grid);
