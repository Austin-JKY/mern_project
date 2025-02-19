const DataUriParser = require("datauri/parser");
const path = require("path");

const getDataUri = (file) => {
  const parser = new DataUriParser();
  return parser.format(path.extname(file.originalname), file.buffer).content;
};

module.exports = getDataUri;
