import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "./socketContext";
import { Socket, io } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

const SOCKET_URL = "http://localhost:8080";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Khởi tạo kết nối tới server backend
    const socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5, // Tự động thử kết nối lại tối đa 5 lần nếu mất mạng
    });

    setSocket(socketInstance);

    // 2. Logic báo danh vào Phòng Riêng khi kết nối thành công
    socketInstance.on("connect", () => {
      console.log(
        "[SOCKET] Đã kết nối tới Server thành công với ID:",
        socketInstance.id,
      );

      // Lấy thông tin user hiện tại từ localStorage (hoặc từ Redux / AuthContext nếu bạn có)
      if (user) {
        const userId = user.id;

        if (userId) {
          // Gửi tín hiệu báo danh lên backend để đưa socket này vào phòng riêng
          socketInstance.emit("join-my-room", userId);
        }
      }
    });

    // 3. Lắng nghe sự kiện báo sắp hết hạn (task-warning-deadline)
    socketInstance.on(
      "task-warning-deadline",
      (data: { id: number; title: string }) => {
        toast.warning(
          ({ closeToast }) => (
            <div className="space-y-2">
              <p className="font-medium">
                ⏳ Task "{data.title}" của bạn sắp hết hạn rồi! Mau hoàn thành
                nhé.
              </p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    navigate(`/auth/todos/${data.id}/deadline`);
                    closeToast?.();
                  }}
                  className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded shadow-sm hover:bg-orange-50 transition-colors"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={closeToast}
                  className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100"
                >
                  Đóng thông báo
                </button>
              </div>
            </div>
          ),
          {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          },
        );
      },
    );

    // 4. Lắng nghe sự kiện báo đã QUÁ HẠN (total-tasks-overdue)
    socketInstance.on("total-tasks-overdue", (data: { total: number }) => {
      toast.error(
        ({ closeToast }) => (
          <div className="space-y-2">
            <p className="font-medium">
              🚨 Quá hạn! Bạn có {data.total} công việc đã quá thời gian hoàn
              thành!
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  navigate("/auth/todos/overdue");
                  closeToast?.();
                }}
                className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded shadow-sm hover:bg-red-50 transition-colors"
              >
                Xem chi tiết
              </button>
              <button
                onClick={closeToast}
                className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        ),
        {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        },
      );
    });

    // 5. Ngắt kết nối khi đóng tab / unmount để tránh rò rỉ bộ nhớ (Memory Leak)
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
