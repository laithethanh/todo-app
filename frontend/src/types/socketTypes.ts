import { Socket } from "socket.io-client";

export interface SocketContextTypes {
  socket: Socket | undefined;
}
