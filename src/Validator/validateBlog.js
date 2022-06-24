const authorModel = require("../models/authorModel");

const isValid = function (value) {
  if (typeof value == undefined || typeof value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    if (x.trim().length) arrValue.push(x);
  });
  return arrValue.length ? arrValue : false;
};

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
    console.log(data);
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid input" });

    if (!isValid(data.title))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid title" });
    else newData.title = data.title;

    if (!isValid(data.body))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid body" });
    else newData.body = data.body;

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

    if (!isValid(data.category))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid category" });
    else newData.category = data.category;

    if (data.tags != undefined) {
      const tagsArray = convertToArray(data.tags);
      if (!tagsArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Tags" });
      else newData.tags = tagsArray;
    }

    if (data.subcategory != undefined) {
      const subcategoryArray = convertToArray(data.subcategory);
      if (!subcategoryArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
      else newData.subcategory = subcategoryArray;
    }

    if (data.isPublished == true) {
      newData.publishedAt = Date.now();
      newData.isPublished = true;
    }
    req.blog = newData;
    next();
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  createBlogMid,
};
