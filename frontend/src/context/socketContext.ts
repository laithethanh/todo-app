import { createContext } from "react";
import { SocketContextTypes } from "../types";

export const SocketContext = createContext<SocketContextTypes | undefined>(
  undefined,
);
