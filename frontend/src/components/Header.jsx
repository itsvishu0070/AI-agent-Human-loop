import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; 

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span>FrontDesk AI</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/history">History</Link>
          <Link to="/voice-demo"> Voice Demo</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
