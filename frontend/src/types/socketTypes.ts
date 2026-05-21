import { Socket } from "socket.io-client";

export interface SocketContextTypes {
  socket: Socket | undefined;
  overdueCount: number;
  setOverdueCount: React.Dispatch<React.SetStateAction<number>>;
}
