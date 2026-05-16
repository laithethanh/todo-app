const bcrypt = require("bcryptjs");
const createHttpError = require("../utils/createHttpError");
// const { findUserByUsername, createUser } = require("../services/authService");
const authService = require("../services/authService");
const { generateToken } = require("../utils/token");

const register = async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return next(createHttpError(400, "Missing required fields"));
    }

    if (password !== confirmPassword) {
      return next(createHttpError(400, "Passwords do not match"));
    }

    const existingUser = await authService.findUserByUsername(username);
    if (existingUser) {
      return next(createHttpError(409, "Username already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authService.createUser({
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(createHttpError(400, "Missing username or password"));
    }

    const user = await authService.findUserByUsername(username);
    if (!user) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    // Gán vào req.user (chỉ có tác dụng trong request hiện tại)
    req.user = { id: user.id, username: user.username };

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
