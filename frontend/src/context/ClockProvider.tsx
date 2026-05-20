import { useState, useEffect, ReactNode } from "react";
import { ClockContext } from "./clockContext";

export const ClockProvider = ({ children }: { children: ReactNode }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ClockContext.Provider value={{ now }}>{children}</ClockContext.Provider>
  );
};
