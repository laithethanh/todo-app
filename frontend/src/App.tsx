// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeaderLayout from "./components/layout/HeaderLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoList from "./pages/TodoList";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Component xử lý chuyển hướng tại trang chủ (/) dựa trên trạng thái auth
const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/auth/todos" : "/login"} replace />;
};

// Component ngăn người dùng đã đăng nhập truy cập lại trang Login/Register
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/auth/todos" replace /> : <>{children}</>;
};

const AppContent = () => {
  const { darkMode } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <ProtectedRoute>
              <HeaderLayout />
            </ProtectedRoute>
          }
        >
          <Route path="todos" element={<TodoList />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode === "true" ? "dark" : "light"}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
