import React, { useState, createContext } from "react";
import "./App.css";
import Grid from "./Grid";
import { FormControlLabel, Switch } from "@material-ui/core";

export const DebugContext = createContext({
  isDebug: true,
  setIsDebug: (_: boolean) => {}
});

export interface GameStatus {
  isGameOver: boolean;
  isGameWon: boolean;
}

export const GameContext = createContext({
  isGameOver: false,
  isGameWon: false,
  setGameContext: (_: GameStatus) => {}
});

function App() {
  const [isDebug, setIsDebug] = useState<boolean>(true);
  const [gameContext, setGameContext] = useState<GameStatus>({
    isGameOver: false,
    isGameWon: false
  });
  const { isGameOver, isGameWon } = gameContext;

  return (
    <div className="App">
      <DebugContext.Provider value={{ isDebug, setIsDebug }}>
        <GameContext.Provider value={{ ...gameContext, setGameContext }}>
          <Grid size={2} mineCount={2} />
        </GameContext.Provider>
      </DebugContext.Provider>
      {isGameOver && <div>{isGameWon ? "WON" : "LOSE"}</div>}
      <FormControlLabel
        control={
          <Switch
            checked={isDebug}
            onChange={() => setIsDebug(!isDebug)}
            value="isDebug"
          />
        }
        label="Debug"
      />
    </div>
  );
}

export default App;
