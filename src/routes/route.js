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
const { validateAuthor } = require("../middleware/auth");
const {
  userIdMid,
  createBlogMid,
  updateBlogMid,
  deleteParticularBlogMid,
} = require("../middleware/blog");

router.post("/authors", validateAuthor, createAuthor);
router.post("/blogs", createBlogMid, createblog);
router.get("/blogs", getBlog);
router.put("/blogs/:blogId", userIdMid, updateBlogMid, updateBlog);
router.delete("/blogs/:blogId", userIdMid, deleteBlog);
router.delete("/blogs", deleteParticularBlogMid, deleteParticularBlog);

module.exports = router;
