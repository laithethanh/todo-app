const express = require("express");
const { getAllTags } = require("../controllers/tagController");
const router = express.Router();

router.get("/", getAllTags);

module.exports = router;
