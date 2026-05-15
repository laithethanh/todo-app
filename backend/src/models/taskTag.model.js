const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TaskTag = sequelize.define(
  "TaskTag",
  {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    tag_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "tags",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "task_tags",
    timestamps: false,
  },
);

module.exports = TaskTag;
