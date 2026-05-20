import { createContext } from "react";
import { ClockContextType } from "../types";

export const ClockContext = createContext<ClockContextType | undefined>(
  undefined,
);
