import { useContext } from "react";
import { SocketContext } from "../context/socketContext";
import { SocketContextTypes } from "../types";

export const useSocket = (): SocketContextTypes => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
