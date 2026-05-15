import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { AuthContextType } from "../types/authTypes";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
