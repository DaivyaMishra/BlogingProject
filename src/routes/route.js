const express = require("express");
const router = express.Router();

const { createAuthor } = require("../controllers/authorController");
const {
  updateBlog,
  createblog,
  getBlog,
  deleteBlog,
  deleteParticularBlog,
} = require("../controllers/blogController");

router.post("/authors", createAuthor);
router.post("/blogs", createblog);
router.get("/blogs", getBlog);
router.post("/blogs/:blogId", updateBlog);
router.delete("/blogs/:blogId", deleteBlog);
router.delete("/blogs", deleteParticularBlog);

module.exports = router;
