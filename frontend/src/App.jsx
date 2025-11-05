import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import VoiceDemo from "./pages/VoiceDemo";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/voice-demo" element={<VoiceDemo />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
