const createHttpError = require("../utils/createHttpError");
const todoService = require("../services/todoService");

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await todoService.getAllTasks();
    if (!tasks || tasks.length === 0) {
      return next(createHttpError(404, "No tasks found"));
    }
    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
};

const getAllTasksById = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware
    const tasks = await todoService.getTasksByUserId(userId);
    if (!tasks || tasks.length === 0) {
      return next(createHttpError(404, "No tasks found for this user"));
    }
    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware

    if (!status) {
      return next(createHttpError(400, "Trạng thái (status) là bắt buộc"));
    }

    const validStatuses = ["todo", "done"];
    if (!validStatuses.includes(status)) {
      return next(
        createHttpError(400, "Trạng thái không hợp lệ. Phải là todo hoặc done"),
      );
    }

    const updatedTask = await todoService.updateTaskStatus(id, userId, status);
    if (!updatedTask) {
      return next(
        createHttpError(
          404,
          "Không tìm thấy task hoặc bạn không có quyền chỉnh sửa",
        ),
      );
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, deadline } = req.body;
    const userId = req.user.id;
    if (!title || !priority || !deadline) {
      return next(
        createHttpError(400, "Dữ liệu truyền vào không hợp lệ hoặc thiếu!"),
      );
    }
    const update = await todoService.updateTask(id, userId, {
      title,
      description,
      priority,
      deadline,
    });
    if (!update) {
      return next(
        createHttpError(
          404,
          "Không tìm thấy task hoặc bạn không có quyền chỉnh sửa",
        ),
      );
    }
    return res.status(200).json(update);
  } catch (error) {
    return next(error);
  }
};

const deleteOneTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleteRow = await todoService.deleteOneTask(id, userId);
    if (!deleteRow) {
      return next(
        createHttpError(404, "Không tìm thấy task hoặc bạn không có quyền xóa"),
      );
    }
    return res
      .status(200)
      .json({ message: `Xóa thành công task có id = ${id}` });
  } catch (error) {
    return next(error);
  }
};

const postCreateOneTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, deadline } = req.body;
    if (!title || !priority || !deadline) {
      return next(
        createHttpError(400, "Dữ liệu truyền vào không hợp lệ hoặc thiếu!"),
      );
    }
    if (isNaN(new Date(deadline).getTime())) {
      return next(createHttpError(400, "Ngày đến hạn không hợp lệ!"));
    }
    if (new Date(deadline) <= new Date()) {
      return next(
        createHttpError(400, "Ngày đến hạn không được nhỏ hơn hiện tại!"),
      );
    }
    const newTask = await todoService.postCreateOneTask(userId, {
      title,
      description,
      status: "todo", // Ép trạng thái luôn là 'todo' khi tạo mới theo yêu cầu nghiệp vụ
      priority,
      deadline,
    });
    return res.status(201).json(newTask);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllTasks,
  getAllTasksById,
  updateTaskStatus,
  updateTask,
  deleteOneTask,
  postCreateOneTask,
};
