const { Task, Tag } = require("../models");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

const getAllTasks = async () => {
  return Task.findAll({
    include: [
      {
        model: Tag,
        as: "tags",
        through: { attributes: [] }, // Ẩn các cột của bảng trung gian task_tags
      },
    ],
  });
};

const getTasksByUserId = async (userId, { title, tag, priority }) => {
  const filter = {};
  filter.user_id = userId;
  if (title) filter.title = { [Op.like]: `%${title}%` };
  if (priority)
    filter.priority = {
      [Op.in]: Array.isArray(priority) ? priority : [priority],
    };

  // This include is to fetch ALL tags for the matching tasks
  const includeOptions = [
    {
      model: Tag,
      as: "tags",
      through: { attributes: [] },
    },
  ];

  // If tag is provided, we need to filter tasks that have these tags.
  // This is done by adding a subquery to the main `where` clause of the Task model,
  // ensuring that the Task has at least one of the specified tags.
  // The `includeOptions` will then fetch all tags for the tasks that pass this filter.
  if (tag) {
    const tagIds = Array.isArray(tag) ? tag : [tag];
    // Construct the SQL for the EXISTS subquery to filter tasks by associated tags
    const tagExistsSubquery = `EXISTS (SELECT 1 FROM task_tags WHERE task_tags.task_id = Task.id AND task_tags.tag_id IN (${tagIds.join(",")}))`;
    if (!filter[Op.and]) {
      filter[Op.and] = [];
    }
    filter[Op.and].push(sequelize.literal(tagExistsSubquery));
  }

  return Task.findAll({
    where: filter,
    include: includeOptions,
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

  return task.reload({
    include: [{ model: Tag, as: "tags", through: { attributes: [] } }],
  });
};

const updateTask = async (taskId, userId, data) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: { id: taskId, user_id: userId },
      transaction: t,
    });

    if (!task) {
      await t.rollback();
      return null;
    }

    const { tags, ...taskData } = data;

    // Kiểm tra tính hợp lệ của tags nếu có
    if (tags && tags.length > 0) {
      const uniqueTags = [...new Set(tags)];
      const foundTags = await Tag.findAll({
        where: { id: uniqueTags },
        transaction: t,
      });
      if (foundTags.length !== uniqueTags.length) {
        throw new Error("Một hoặc nhiều Tag không tồn tại trên hệ thống.");
      }
      await task.setTags(uniqueTags, { transaction: t });
    }

    Object.assign(task, taskData);
    await task.save({ transaction: t });

    await t.commit();
    return task.reload({
      include: [{ model: Tag, as: "tags", through: { attributes: [] } }],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
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
  const { tags, ...taskData } = data;

  // Khởi tạo một transaction
  const t = await sequelize.transaction();

  try {
    // 1. Kiểm tra tính hợp lệ của tất cả Tag ID trước khi tạo Task
    if (tags && tags.length > 0) {
      const uniqueTags = [...new Set(tags)]; // Loại bỏ ID trùng lặp nếu có
      const foundTags = await Tag.findAll({
        where: { id: uniqueTags },
        transaction: t,
      });

      if (foundTags.length !== uniqueTags.length) {
        throw new Error("Một hoặc nhiều Tag không tồn tại trên hệ thống.");
      }
    }

    // 2. Tạo Task mới trong transaction
    const newTask = await Task.create(
      { ...taskData, user_id: userId },
      { transaction: t },
    );

    // 3. Gắn tags trong transaction
    if (tags && tags.length > 0) {
      const uniqueTags = [...new Set(tags)];
      await newTask.setTags(uniqueTags, { transaction: t });
    }

    // Nếu mọi thứ ổn, xác nhận lưu thay đổi vào DB
    await t.commit();

    // Trả về dữ liệu đã load kèm tags
    return newTask.reload({
      include: [{ model: Tag, as: "tags", through: { attributes: [] } }],
    });
  } catch (error) {
    // Nếu có lỗi, hoàn tác mọi thay đổi (Task sẽ không được tạo)
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getAllTasks,
  getTasksByUserId,
  updateTaskStatus,
  updateTask,
  deleteOneTask,
  postCreateOneTask,
};
