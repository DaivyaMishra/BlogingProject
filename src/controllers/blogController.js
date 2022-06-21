const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");

// create blog
const createblog = async function (req, res) {
  try {
    let data = req.body;
    if (!data.authorId)
      return res
        .status(404)
        .send({ status: false, msg: "Author Id is not present" });
    let author = await authorModel.findById(data.authorId);
    if (!author)
      return res
        .status(400)
        .send({ status: false, msg: "Author ID is not valid" });

    let savedData = await blogModel.create(data);
    res.send({ status: true, msg: savedData });
  } catch (err) {
    res.satus(400).send({ status: false, msg: err.message });
  }
};

// Update Blog
const updateBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let blog = await blogModel.findOne({ _id: blogId, isDeleted: false });
    if (!blog)
      return res
        .status(404)
        .send({ status: "false", msg: "Blog ID is not found" });

    let { title, body, tags, subcategory } = req.body;

    // tag update
    let tagUpdate = blog.tags;
    if (tags != undefined || tags != null) tagUpdate.push(tags);

    // subcategory update
    let sub = blog.subcategory;
    if (subcategory != undefined || subcategory != null) sub.push(subcategory);

    let result = await blogModel.findOneAndUpdate(
      { _id: blogId },
      {
        $set: {
          tags: tagUpdate,
          subcategory: sub,
          title: title,
          body: body,
          isPublished: true,
          publishedAt: Date.now(),
        },
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
    if (!req.query.author_id) {
      if (!req.query.categoryOfBlog) {
        if (!req.query.tagInBlog) {
          const blog = await blogModel.find({
            isDeleted: false,
            isPublished: true,
          });
          if (!blog) {
            res.status(404).send({ status: false, msg: "No such Blog exist" });
          }
          res.status(200).send({ status: true, blog });
        } else {
          const tags = req.query.tagInBlog;
          const blogByTag = await blogModel.find({
            tags: { $in: [tags] },
            isDeleted: false,
            isPublished: true,
          });
          if (!blogByTag) {
            res
              .status(404)
              .send({ status: false, msg: "The Blog dosen't exist" });
          }
          res.status(200).send({ status: true, blogByTag });
        }
      } else {
        const blogCategory = req.query.categoryOfBlog;
        const blogByCategory = await blogModel.find({
          category: { $in: [blogCategory] },
          isDeleted: false,
          isPublished: true,
        });
        if (!blogByCategory) {
          res
            .status(404)
            .send({ status: false, msg: "The Blog dosen't exist" });
        }
        res.status(200).send({ status: true, blogByCategory });
      }
    } else {
      const blog = await blogModel.find({
        authorId: req.query.author_id,
        isDeleted: false,
        isPublished: true,
      });
      if (!blog) {
        res.status(404).send({ status: false, msg: "The Blog dosen't exist" });
      }
      res.status(200).send({ status: true, blog });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error.message });
  }
};

//delete Blog
const deleteBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let blog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      { isDeleted: true, deletedAt: Date.now() }
    );
    if (!blog) {
      return res
        .status(404)
        .send({ status: "false", msg: "blog ID is not found" });
    }
    return res
      .status(200)
      .send({ status: true, msg: "The requested data is deleted" });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const deleteParticularBlog = async function (req, res) {
  try {
    let blogData = { isDeleted: false };
    const { category, authorId, tags, subcategory, isPublished } = req.query;
    if (category) {
      blogData.category = { $in: category };
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
    let result = await blogModel.updateMany(blogData, {
      $set: { isDeleted: true, deletedAt: Date.now() },
    });
    return res.status(200).send({ status: true, data: result });
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
