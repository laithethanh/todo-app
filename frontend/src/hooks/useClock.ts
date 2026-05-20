import { useContext } from "react";
import { ClockContext } from "../context/clockContext";
import { ClockContextType } from "../types";

export const useClock = (): ClockContextType => {
  const context = useContext(ClockContext);
  if (context === undefined) {
    throw new Error("useClock must be used within a ClockProvider");
  }
  return context;
};
