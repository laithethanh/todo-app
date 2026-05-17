const createHttpError = require("../utils/createHttpError");
const tagService = require("../services/tagService");

const getAllTags = async (req, res, next) => {
  try {
    const tags = await tagService.getAllTags();
    if (!tags || tags.length === 0) {
      return next(createHttpError(404, "No tags found"));
    }
    return res.status(200).json(tags);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAllTags };
