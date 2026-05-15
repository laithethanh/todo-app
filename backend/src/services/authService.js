const { User } = require("../models");

// cách 1: export từng hàm riêng lẻ
const findUserByUsername = async (username) => {
  return User.findOne({ where: { username } });
};

const createUser = async ({ username, password }) => {
  return User.create({ username, password });
};

module.exports = {
  findUserByUsername,
  createUser,
};

// cách 2: export một object chứa tất cả hàm
// const authService = {
//   findUserByUsername: async (username) => {
//     return User.findOne({ where: { username } });
//   },

//   createUser: async ({ username, password }) => {
//     return User.create({ username, password });
//   },
// };

// module.exports = authService;
