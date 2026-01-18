import React from "react";
import { Link } from "react-router-dom";

function Navbar({ user, setUser }) {
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="navbar">
      <h2>High School Portal</h2>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/students">Students</Link>
        <Link to="/teachers">Teachers</Link>
        {user.role === "admin" && <Link to="/admin">Admin</Link>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
