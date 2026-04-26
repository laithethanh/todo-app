// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeaderLayout from "./components/HeaderLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoList from "./pages/TodoList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<HeaderLayout />}>
          <Route path="todos" element={<TodoList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
