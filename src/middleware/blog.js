const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");

const isValid = function (value) {
  if (typeof value == undefined || typeof value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    x.trim();
    if (x.length) arrValue.push(x);
  });
  return arrValue.length ? arrValue : false;
};

const convertToArray = function (value) {
  if (typeof value == "string" && value) {
    return [value];
  } else if (value?.length > 0) return checkValue(value);
  return false;
};

let createBlogMid = async function (req, res, next) {
  try {
    let data = req.body;
    let newData = {};

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
    let author = await authorModel.findById(data.authorId);
    if (!author)
      return res
        .status(400)
        .send({ status: false, msg: "Author ID is not valid" });
    else newData.authorId = data.authorId;

    if (data.category != undefined) {
      const categoryArray = convertToArray(data.category);
      if (!categoryArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid category" });
      else newData.category = categoryArray;
    }

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

//ID VALIDATION
const userIdMid = async function (req, res, next) {
  try {
    let blogId = req.params.blogId;
    let blog = await blogModel.findOne({ _id: blogId, isDeleted: false });
    if (!blog)
      return res
        .status(404)
        .send({ status: "false", msg: "Blog ID is not found" });

    req.blog = blog;
    next();
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

// UPDATE BLOG
const updateBlogMid = function (req, res, next) {
  let { title, body, tags, subcategory, isPublished } = req.body;
  try {
    let addToSet = {};

    if (title != undefined) {
      if (!isValid(title))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid title" });
    }

    if (body != undefined) {
      if (!isValid(body))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid body" });
    }

    if (subcategory != undefined) {
      let subcategoryArray = convertToArray(subcategory);
      if (!subcategoryArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
      else
        addToSet = {
          ...addToSet,
          subcategory: { $each: subcategoryArray },
        };
    }

    if (tags != undefined) {
      let tagsArray = convertToArray(tags);
      if (!tagsArray)
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid tags" });
      else
        addToSet = {
          ...addToSet,
          tags: { $each: tagsArray },
        };
    }

    req.addToSet = addToSet;
    next();
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

//DELETE BLOG
const deleteParticularBlogMid = async function (req, res, next) {
  try {
    let blogData = { isDeleted: false };
    const { category, authorId, tags, subcategory, isPublished } = req.query;
    if (category) {
      blogData.category = { $in: category.split(",") };
    }
    if (authorId) {
      blogData.authorId = authorId;
    }
    if (tags) {
      blogData.tags = { $in: tags.split(",") };
    }
    if (subcategory) {
      blogData.subcategory = { $in: subcategory.split(",") };
    }
    if (isPublished) {
      blogData.isPublished = isPublished;
    }
    let verify = await blogModel.find(blogData);

    if (verify.length == 0)
      return res.status(404).send({ status: false, msg: "Blog not found" });
    req.blog = blogData;
    next();
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

module.exports = {
  createBlogMid,
  userIdMid,
  updateBlogMid,
  deleteParticularBlogMid,
};
