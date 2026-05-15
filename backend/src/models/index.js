const User = require("./user.model");
const Task = require("./task.model");
const Tag = require("./tag.model");
const TaskTag = require("./taskTag.model");

User.hasMany(Task, {
  foreignKey: "user_id",
  as: "tasks",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Task.belongsToMany(Tag, {
  through: TaskTag,
  foreignKey: "task_id",
  otherKey: "tag_id",
  as: "tags",
});

Tag.belongsToMany(Task, {
  through: TaskTag,
  foreignKey: "tag_id",
  otherKey: "task_id",
  as: "tasks",
});

module.exports = {
  User,
  Task,
  Tag,
  TaskTag,
};
