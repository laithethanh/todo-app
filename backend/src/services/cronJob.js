const cron = require("node-cron");
const { Op } = require("sequelize");
const { Task } = require("../models");
const { getIO } = require("./socket");
const { sequelize } = require("../config/db");

const scanAndNotifiedTask = async () => {
  try {
    // const now = new Date();
    // const currentTime = now.getTime();
    const currentTime = Date.now();
    const overdueMap = {}; // { userId: count }

    // const currentTime = new Date(getVietnamTimeISO()).getTime();

    const io = getIO();

    const pendingTasks = await Task.findAll({
      where: {
        status: { [Op.ne]: "done" },
        [Op.or]: [{ isDeadlineNotified: false }, { isOverdueNotified: false }],
        deadline: { [Op.lte]: new Date(Date.now() + 48 * 60 * 60 * 1000) },
      },
    });
    if (pendingTasks.length === 0) return;
    for (const task of pendingTasks) {
      const deadlineTime = new Date(task.deadline).getTime();
      const targetUserId = task.user_id;
      if (!targetUserId) continue;

      // ==========================================
      // LOGIC 1: XỬ LÝ THÔNG BÁO SẮP HẾT HẠN
      // ==========================================
      if (!task.isDeadlineNotified) {
        // Thời điểm cần thông báo = Hạn chót trừ đi số phút nhắc nhở (đổi ra miligiây)
        // Nếu remindBefore = 0, hệ thống sẽ tự dùng thuật toán 20% thời gian còn lại làm mặc định
        let notificationTime;

        if (task.remindBefore > 0) {
          notificationTime = deadlineTime - task.remindBefore * 60 * 1000;
        } else {
          const startTime = new Date(task.created_at).getTime();
          const totalDuration = deadlineTime - startTime;
          const warningThreshold = totalDuration * 0.2; // Ngưỡng 20%
          notificationTime = deadlineTime - warningThreshold;
        }

        // Nếu thời gian hiện tại đã vượt qua mốc cần thông báo VÀ chưa quá hạn hẳn
        if (currentTime >= notificationTime && currentTime < deadlineTime) {
          // >>> KHU VỰC GỬI SOCKET / EMAIL SẮP HẾT HẠN <<<
          console.log(
            `[CRON - WARNING] Gửi socket sắp hết hạn tới User Id ${targetUserId} cho task "${task.title}"`,
          );

          // Bắn thế này thì ai cũng có thể nhận được
          // io.emit("task-warning", { id: task.id, title: task.title });

          try {
            // Bắn tín hiệu đích danh vào phòng riêng của User đó
            io.to(`room_user_${targetUserId}`).emit("task-warning", {
              id: task.id,
              title: task.title,
            });
          } catch (error) {
            console.error("Emit warning error:", err);
          }

          // Đánh dấu đã thông báo sắp hết hạn sử dụng transaction
          await sequelize.transaction(async (t) => {
            task.isDeadlineNotified = true;
            await task.save({ transaction: t });
          });
        }
      }

      // ==========================================
      // LOGIC 2: XỬ LÝ THÔNG BÁO ĐÃ QUÁ HẠN
      // ==========================================
      if (!task.isOverdueNotified) {
        // Nếu thời gian hiện tại đã vượt qua Hạn chót
        if (currentTime >= deadlineTime) {
          overdueMap[targetUserId] = (overdueMap[targetUserId] || 0) + 1;

          // // >>> KHU VỰC GỬI SOCKET / EMAIL ĐÃ QUÁ HẠN <<<
          // console.log(
          //   `[CRON - OVERDUE] Gửi socket quá hạn tới User ${targetUserId} cho task "${task.title}"`,
          // );

          // // Bắn thế này thì ai cũng có thể nhận được
          // // io.emit("task-overdue", { id: task.id, title: task.title });

          // io.to(`room_user_${targetUserId}`).emit("task-overdue", {
          //   id: task.id,
          //   title: task.title,
          // });

          await sequelize.transaction(async (t) => {
            // Đánh dấu đã thông báo quá hạn
            task.isOverdueNotified = true;

            // Đảm bảo là nếu họ chưa nhận được thông báo sắp hết hạn (do tạo task quá sát giờ)
            // thì cũng chặn luôn không cho hiện thông báo sắp hết hạn nữa vì đã quá hạn rồi.
            task.isDeadlineNotified = true;

            await task.save({ transaction: t });
          });
        }
      }
    }

    for (const userId in overdueMap) {
      try {
        io.to(`room_user_${userId}`).emit("task-overdue", {
          count: overdueMap[userId],
        });
        console.log(
          `[CRON-OVERDUE-COUNT] Đã gửi tổng ${overdueMap[userId]} task quá hạn cho User Id ${userId}`,
        );
      } catch (error) {
        console.error("Emit overdue error:", err);
      }
    }
  } catch (error) {
    console.log("Lỗi khi chạy Cron Job quét Tasks: ", error);
  }
};

// Kích hoạt Cron Job chạy định kỳ mỗi 30 giây một lần
// Cú pháp "* * * * * *" nghĩa là: Giây | Phút | Giờ | Ngày trong tháng | Tháng | Ngày trong tuần
cron.schedule("*/30 * * * * *", () => {
  console.log(
    `[CRON] Đang quét database lúc: ${new Date().toLocaleTimeString()}`,
  );
  scanAndNotifiedTask();
});
