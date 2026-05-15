const { Sequelize } = require("sequelize");

const {
  DB_HOST = "localhost",
  DB_PORT = 3306,
  DB_NAME = "todo_app",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_DIALECT = "mysql",
  DB_LOGGING = "false",
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT,
  logging: DB_LOGGING === "true" ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: true,
  },
  timezone: "+07:00",
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected via Sequelize");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
