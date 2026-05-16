const { Task } = require("../models");

const getAllTasks = async () => {
  return Task.findAll();
};

const getTasksByUserId = async (userId) => {
  return Task.findAll({ where: { user_id: userId } });
};

const updateTaskStatus = async (taskId, userId, status) => {
  const task = await Task.findOne({
    where: { id: taskId, user_id: userId },
  });

  if (!task) {
    return null;
  }

  task.status = status;
  await task.save();

  return task;
};

const updateTask = async (taskId, userId, data) => {
  const task = await Task.findOne({
    where: { id: taskId, user_id: userId },
  });

  if (!task) {
    return null;
  }

  // Cập nhật các trường thông tin từ data
  Object.assign(task, data);
  await task.save();

  return task;
};

const deleteOneTask = async (taskId, userId) => {
  const deleteRow = await Task.destroy({
    where: { id: taskId, user_id: userId },
  });
  if (deleteRow === 0) {
    return null;
  }
  return deleteRow;
};

module.exports = {
  getAllTasks,
  getTasksByUserId,
  updateTaskStatus,
  updateTask,
  deleteOneTask,
};
