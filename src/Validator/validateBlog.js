const { isValid } = require("../Validator/validateAuthor");
const authorModel = require("../models/authorModel");

// function for array value verification
const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    if (x.trim().length) arrValue.push(x);
  });
  return arrValue.length ? arrValue : false;
};

// function for converting string into array
const convertToArray = function (value) {
  if (typeof value == "string" && value) {
    if (value.trim().length == 0) return false;
    return [value];
  } else if (value?.length > 0) return checkValue(value);
  return false;
};

// validating new blog data
let createBlogMid = async function (req, res, next) {
  try {
    let data = req.body;
    let newData = {};

    // checking for empty input
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid input" });

    // string validation for title
    if (!isValid(data.title))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid title" });
    else newData.title = data.title;

    // string validation for body
    if (!isValid(data.body))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid body" });
    else newData.body = data.body;

    // author ID verification
    if (!data.authorId)
      return res
        .status(404)
        .send({ status: false, msg: "Author Id is not present" });
    if (data.authorId != req.token.authorId)
      return res.status(400).send({
        status: false,
        msg: "Entered authorId is not matched with token",
      });
    let author = await authorModel.findById(data.authorId);
    if (!author)
      return res
        .status(400)
        .send({ status: false, msg: "Author ID is not valid" });
    else newData.authorId = data.authorId;

    // string validation for Category
    if (!isValid(data.category))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid category" });
    else newData.category = data.category;

    // array validation for tags
    if (data.tags != undefined) {
      const tagsArray = convertToArray(data.tags);
      if (!tagsArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Tags" });
      else newData.tags = tagsArray;
    }

    // array validation for subcategory
    if (data.subcategory != undefined) {
      const subcategoryArray = convertToArray(data.subcategory);
      if (!subcategoryArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
      else newData.subcategory = subcategoryArray;
    }

    // checking for the publishing type, and updating publishedDate
    if (data.isPublished == true) {
      newData.publishedAt = Date.now();
      newData.isPublished = true;
    }

    // creating an attribute in "req" to access the blog data outside the Validator
    req.blog = newData;
    next();
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  createBlogMid,
  convertToArray,
  checkValue,
};
