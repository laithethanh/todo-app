const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

dotenv.config(); // Phải gọi dòng này trước khi require bất kỳ file nào trong src

const { connectDB, sequelize } = require("./src/config/db");
const { getVietnamTimeISO } = require("./src/utils/time");
const errorHandler = require("./src/middlewares/errorHandler");
const authRoutes = require("./src/routes/auth.routes");
const todoRoutes = require("./src/routes/todo.routes");
const tagRoutes = require("./src/routes/tag.routes");

const { initSocket } = require("./src/services/socket");
// Import file cron job để nó tự động kích hoạt bộ đếm ngầm
require("./src/services/cronJob");

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Tạo HTTP Server từ Express App (Bắt buộc phải làm thế này thì Socket.io mới chạy chung cổng được)
const server = http.createServer(app);

// Khởi tạo cấu hình Socket.io
initSocket(server, CLIENT_URL);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timeUTC: new Date().toISOString(),
    timeVN: new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    }),
    timeCustom: getVietnamTimeISO(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tags", tagRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();

    // Thay thế app.listen thành server.listen
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
