const authorModel = require("../models/authorModel");

// create author
const createAuthor = async function (req, res) {
  try {
    let data = req.body;
    let savedData = await authorModel.create(data);
    res.status(201).send({ status: true, msg: savedData });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  createAuthor,
};
