const authorModel = require("../models/authorModel");

// create author
const createAuthor = async function (req, res) {
  try {
    let data = req.body;
    let savedData = await authorModel.create(data);
    res.status(201).send({ msg: savedData });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  createAuthor,
};
