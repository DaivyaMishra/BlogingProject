const mongoose = require("mongoose");
const blogModel = require("../models/blogModel");

// varification code for
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

// create blog
const createblog = async function (req, res) {
  try {
    let savedData = await blogModel.create(req.blog);
    return res.status(201).send({ status: true, msg: savedData });
  } catch (err) {
    return res.status(400).send({ status: false, msg: err.message });
  }
};

// Update Blog
const updateBlog = async function (req, res) {
  try {
    let { title, body, tags, subcategory, isPublished } = req.body;
    let addToSet = {};

    // title validation
    if (title != undefined) {
      if (!isValid(title))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid title" });
    }

    // body validation
    if (body != undefined) {
      if (!isValid(body))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid body" });
    }

    // checking subCategory and converting it into array if it is not along with validation of empty string
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

    // checking tags and converting it into array if it is not along with validation of empty string
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

    // updating publishing date if isPublished is true
    let date;
    if (isPublished == true) date = Date.now();

    // updating the record
    let result = await blogModel.findOneAndUpdate(
      { _id: req.blog._id },
      {
        $set: {
          title: title,
          body: body,
          isPublished: isPublished,
          publishedAt: date,
        },
        $addToSet: addToSet,
      },
      {
        new: true,
      }
    );

    // if result is not found
    if (!result)
      return res
        .status(404)
        .send({ status: "false", msg: "Blog ID is not found" });

    // success message
    return res.status(200).send({ status: true, msg: result });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//get blog
const getBlog = async function (req, res) {
  try {
    const { authorId, category, tags } = req.query;
    const blogData = { isDeleted: false, isPublished: true };

    // checking for category
    if (category) {
      blogData.category = category;
    }
    if (authorId) {
      if (mongoose.Types.ObjectId.isValid(authorId))
        blogData.authorId = authorId;
      else if (!mongoose.Types.ObjectId.isValid(authorId))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Author ID" });
    }

    if (tags) {
      blogData.tags = { $in: tags.split(",") };
    }
    const blog = await blogModel.find(blogData);
    if (!blog.length) {
      return res.status(404).send({ status: false, msg: "no such blog exist" });
    }
    return res.status(200).send({ status: true, data: blog });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

//delete Blog
const deleteBlog = async function (req, res) {
  try {
    let blog = await blogModel.findOneAndUpdate(
      { _id: req.blog._id },
      { isDeleted: true, deletedAt: Date.now() }
    );
    if (!blog)
      return res
        .status(404)
        .send({ status: "false", msg: "Blog ID is not found" });
    return res
      .status(200)
      .send({ status: true, msg: "The requested data is deleted" });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const deleteParticularBlog = async function (req, res) {
  try {
    let blogData = { isDeleted: false, isPublished: false };
    const { category, authorId, tags, subcategory } = req.query;
    if (Object.keys(req.query).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid input" });

    if (category) {
      blogData.category = category;
    }

    if (authorId) {
      if (
        mongoose.Types.ObjectId.isValid(authorId) &&
        authorId == req.token.authorId
      )
        blogData.authorId = authorId;
      else if (!mongoose.Types.ObjectId.isValid(authorId))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Author ID" });
      else
        return res
          .status(403)
          .send({ status: false, msg: "You are not authorized " });
    } else blogData.authorId = req.token.authorId;

    if (tags) {
      blogData.tags = { $in: tags.split(",") };
    }
    if (subcategory) {
      blogData.subcategory = { $in: subcategory.split(",") };
    }

    let result = await blogModel.find(blogData).updateMany({
      $set: { isDeleted: true, deletedAt: Date.now() },
    });
    if (!result)
      return res.status(404).send({ status: false, msg: "Blog not found" });

    return res
      .status(200)
      .send({ status: true, msg: "The requested data is deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  updateBlog,
  getBlog,
  createblog,
  deleteBlog,
  deleteParticularBlog,
};
