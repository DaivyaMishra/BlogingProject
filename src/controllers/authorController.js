const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");
const { isValidMail, isValidPassword } = require("../Validator/validateAuthor");

// create author
const createAuthor = async function (req, res) {
  try {
    let savedData = await authorModel.create(req.author);
    res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

// Author login
const authorLogin = async function (req, res) {
  try {
    let userName = req.body.email;
    let password = req.body.password;

    if (Object.keys(req.body).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide login details" });
    }

    // validating the userName(email)
    if (!isValidMail(userName))
      return res
        .status(400)
        .send({ status: false, msg: "Entered mail ID is not valid" });

    // validating the password
    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        msg: "Passwrod is not valid",
      });

    // finding for the author with email and password
    let author = await authorModel.findOne({
      email: userName,
      password: password,
    });
    if (!author)
      return res.status(400).send({
        status: false,
        msg: "Username and password are not matched",
      });

    // JWT creation
    let token = jwt.sign(
      {
        authorId: author._id.toString(),
      },
      "project1group29",
      {
        expiresIn: "24h",
      }
    );
    res.header("x-api-key", token);
    return res
      .status(200)
      .send({ status: true, msg: "Author login successfull", data: token });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

module.exports = {
  createAuthor,
  authorLogin,
};
