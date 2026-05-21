const { Server } = require("socket.io");

let io = null;

const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Có kết nối mới: ${socket.id}`);

    // Lắng nghe khi Frontend gửi yêu cầu vào phòng riêng
    socket.on("join-my-room", (userId) => {
      if (userId) {
        socket.join(`room_user_${userId}`);
        console.log(
          `[SOCKET] User ${userId} đã tham gia vào phòng: room_user_${userId}`,
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Ngắt kết nối: ${socket.id}`);
    });
  });
  return io;
};

// Hàm này giúp các file khác (như cronJob) có thể lấy thực thể io ra để dùng
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

module.exports = { initSocket, getIO };
