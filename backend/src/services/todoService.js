const { Task } = require("../models");

const getAllTasks = async () => {
  return Task.findAll();
};

const getTasksByUserId = async (userId) => {
  return Task.findAll({
    where: { user_id: userId },
    // order: [["created_at", "desc"]],
  });
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

const postCreateOneTask = async (userId, data) => {
  const newTask = await Task.create({
    // nếu làm thế này { data, userId }
    // => {
    //   "data": { "title": "...", "description": "..." }, // DB không hiểu cột "data" là gì
    //   "userId": 10
    // }
    ...data,
    user_id: userId,
    // {
    //   "title": "...",
    //   "description": "...",
    //   "status": "...",
    //   "priority": "...",
    //   "deadline": "...",
    //   "user_id": 10 // DB nhận diện được chuẩn đét tất cả các cột!
    // }
  });
  // const newTask = await Task.create(
  //   {
  //     data,
  //     userId: userId,
  //   },
  //   { fields: ["title", "description", "priority", "deadline", "status"] },
  // );
  // fields để chỉ định nghiêm ngặt những trường nào được phép lọt vào database
  return newTask;
};

module.exports = {
  getAllTasks,
  getTasksByUserId,
  updateTaskStatus,
  updateTask,
  deleteOneTask,
  postCreateOneTask,
};
