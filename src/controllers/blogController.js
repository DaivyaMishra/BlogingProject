const blogModel = require("../models/blogModel");

// create blog
const createblog = async function (req, res) {
  try {
    let data = req.body;

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
    if (!blogId) blogId = req.query;

    let blog = await blogModel.findOne({ _id: blogId, isDeleted: false });

    if (!blog) {
      return res
        .status(404)
        .send({ status: "false", msg: "blog ID is not found" });
    }
    blog = blogModel.updateOne({ _id: blogId }, { isDeleted: true });
    return res
      .satus(200)
      .send({ status: true, msg: "The requested data is deleted" });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

const deleteParticularBlog = async function (req, res) {
  try {
    let blogData = {};
    const { category, authorId, tags, subcategory, isPublished } = req.body;
    if (category != undefined) {
      blogData.category = { $in: category };
    }
    if (authorId != undefined) {
      blogData.authorId = authorId;
    }
    if (tags != undefined) {
      blogData.tags = { $in: tags };
    }
    if (subcategory != undefined) {
      blogData.subcategory = { $in: subcategory };
    }
    if (isPublished != undefined) {
      blogData.isPublished = isPublished;
    }
    let result = await blogModel.findOneAndUpdate(
      { blogData },
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    if (result.length == 0) return res.status(404).send("query not found");
    else return res.status(200).send({ status: true, data: result });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  updateBlog,
  getBlog,
  createblog,
  deleteBlog,
};
