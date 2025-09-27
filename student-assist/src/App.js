import React, { useState, useEffect } from "react";
import StudentSupport from "./components/HomeScreen";

function App() {
  const [userId, setUserId] = useState(() => {
    // Get existing user ID from localStorage or create new one
    return (
      localStorage.getItem("studentSupportUserId") ||
      `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  });

  useEffect(() => {
    // Save user ID to localStorage
    localStorage.setItem("studentSupportUserId", userId);
  }, [userId]);

  return (
    <div className="App">
      <StudentSupport userId={userId} />
    </div>
  );
}

export default App;
