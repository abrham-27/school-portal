import React from "react";

function Dashboard({ user }) {
  return (
    <div className="page">
      <h1>Welcome, {user.username}!</h1>
      <p>You are logged in as <b>{user.role}</b>.</p>
    </div>
  );
}

export default Dashboard;
