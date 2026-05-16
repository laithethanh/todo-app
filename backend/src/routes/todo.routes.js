const express = require("express");
const {
  getAllTasks,
  getAllTasksById,
  updateTaskStatus,
  updateTask,
  deleteOneTask,
  postCreateOneTask,
} = require("../controllers/todoController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getAllTasks);
router.get("/me", authMiddleware, getAllTasksById);
router.post("/", authMiddleware, postCreateOneTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.patch("/:id", authMiddleware, updateTask);
// router.put("/:id", authMiddleware, putEditOneTask);
router.delete("/:id", authMiddleware, deleteOneTask);

module.exports = router;
