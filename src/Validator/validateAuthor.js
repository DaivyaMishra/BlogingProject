const authorModel = require("../models/authorModel");

// function for email verification
const isValidMail = function (v) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
};

// function for title verification
const isValidTitle = function (str) {
  return ["Mr", "Mrs", "Miss"].includes(str);
};

// function for string verification
const isValid = function (value) {
  if (typeof value == undefined || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

// function for password verification
const isValidPassword = function (pass) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,10}$/.test(pass);
};

// validating the data for author creation
const validateAuthor = async function (req, res, next) {
  try {
    let data = req.body;

    // checking for empty input
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid input" });

    // string validation for first name
    if (!isValid(data.fname))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid First Name" });

    // string validation for last name
    if (!isValid(data.lname))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid Last Name" });

    // string validation for title, should be form [Mr,Mrs,Miss]
    if (!isValidTitle(data.title))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid Title" });

    // validating the email ID
    if (!isValidMail(data.email))
      return res
        .status(400)
        .send({ status: false, msg: "Enter a valid mail ID" });
    // checking for the duplicate mail ID
    let mail = await authorModel.findOne({ email: data.email });
    if (mail)
      return res
        .status(409)
        .send({ status: false, msg: "Mail Id is already exist" });

    // validating the password
    if (!isValidPassword(data.password))
      return res.status(400).send({
        status: false,
        msg: "Password should contain 5 to 10 characters, one special character and number and should not contain space ",
      });

    // creating an attribute in "req" to access the author data outside the Validator
    req.author = data;
    next();
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  validateAuthor,
  isValidMail,
  isValid,
  isValidPassword,
};
