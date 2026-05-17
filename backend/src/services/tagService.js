const { Tag } = require("../models");

const getAllTags = async () => {
  return Tag.findAll();
};

module.exports = { getAllTags };
