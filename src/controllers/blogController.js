const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");

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
  let { title, body, isPublished } = req.body;
  try {
    let date;
    if (isPublished == true) date = Date.now();

    let result = await blogModel.findOneAndUpdate(
      { _id: req.blog._id },
      {
        $set: {
          title: title,
          body: body,
          isPublished: isPublished,
          publishedAt: date,
        },
        $addToSet: req.addToSet,
      },
      {
        new: true,
      }
    );

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
    if (category) {
      blogData.category = { $in: category.split(",") };
    }
    if (authorId) {
      blogData.authorId = authorId;
    }
    if (tags) {
      blogData.tags = { $in: tags.split(",") };
    }
    const blog = await blogModel.find(blogData);
    if (!blog.length) {
      return res.status(400).send({ status: false, msg: "no such blog exist" });
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

    return res
      .status(200)
      .send({ status: true, msg: "The requested data is deleted" });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const deleteParticularBlog = async function (req, res) {
  try {
    let result = await blogModel.updateMany(req.blog, {
      $set: { isDeleted: true, deletedAt: Date.now() },
    });
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
