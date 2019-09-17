import React, { useState } from "react";
import "./App.css";
import Grid from "./Grid";
import { FormControlLabel, Switch } from "@material-ui/core";

export const DebugContext = React.createContext({
  isDebug: true,
  setIsDebug: (value: boolean) => {}
});

function App() {
  const [isDebug, setIsDebug] = useState<boolean>(true);

  return (
    <DebugContext.Provider value={{ isDebug, setIsDebug }}>
      <div className="App">
        <Grid size={9} mineCount={14} />
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
    </DebugContext.Provider>
  );
}

export default App;
