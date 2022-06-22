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

// create blog
const createblog = async function (req, res) {
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

    let savedData = await blogModel.create(newData);
    return res.status(201).send({ status: true, msg: savedData });
  } catch (err) {
    return res.status(400).send({ status: false, msg: err.message });
  }
};

// Update Blog
const updateBlog = async function (req, res) {
  let { title, body, tags, subcategory, isPublished } = req.body;
  try {
    let addToSet = {};

    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid input" });

    let blogId = req.params.blogId;
    let blog = await blogModel.findOne({ _id: blogId, isDeleted: false });
    if (!blog)
      return res
        .status(404)
        .send({ status: "false", msg: "Blog ID is not found" });

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

    let date;
    if (isPublished == true) date = Date.now();

    let result = await blogModel.findOneAndUpdate(
      { _id: blogId },
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

    return res.status(200).send({ status: true, msg: result });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//get blog
const getBlog = async function (req, res) {
  try {
    const { authorId, category, tags } = req.query;
    const object = { isDeleted: false, isPublished: true };
    if (authorId) {
      object.authorId = authorId;
    }
    if (category) {
      object.category = { $in: category };
    }
    if (tags) {
      object.tags = { $in: tags };
    }
    const blog = await blogModel.find(object);
    if (!blog) {
      res.status(400).send({ status: false, msg: "no such blog exist" });
    }
    res.status(200).send({ statsu: true, blog });
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

    let result = await blogModel.updateMany(blogData, {
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
