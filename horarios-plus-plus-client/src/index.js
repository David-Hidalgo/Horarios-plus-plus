import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals.js";

import LandingInterface from "./Interfaces/LandingInterface.tsx";
import GenerationInterface from "./Interfaces/GenerationInterface.tsx";
import TimeBlockInterface from "./Interfaces/TimeBlockInterface.tsx";
import MyScheduleInterface from "./Interfaces/MyScheduleInterface.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "./controller/ControllerDB.ts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<LandingInterface />} />
          <Route path="/generation" element={<GenerationInterface />} />
          <Route path="/time_blocks" element={<TimeBlockInterface />} />
          <Route path="/schedule" element={<MyScheduleInterface />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
