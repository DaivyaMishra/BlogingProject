const express = require("express");
const router = express.Router();

const {
  createAuthor,
  authorLogin,
} = require("../controllers/authorController");
const {
  updateBlog,
  createblog,
  getBlog,
  deleteBlog,
  deleteParticularBlog,
} = require("../controllers/blogController");
const { authorAuthentication, authorization } = require("../middleware/auth");
const { validateAuthor } = require("../Validator/validateAuthor");
const { createBlogMid } = require("../Validator/validateBlog");

// Authors routes
router.post("/authors", validateAuthor, createAuthor);
router.post("/login", authorLogin);

// Blogs routes
router.post("/blogs", authorAuthentication, createBlogMid, createblog);
router.get("/blogs", authorAuthentication, getBlog);
router.put("/blogs/:blogId", authorAuthentication, authorization, updateBlog);
router.delete(
  "/blogs/:blogId",
  authorAuthentication,
  authorization,
  deleteBlog
);
router.delete("/blogs", authorAuthentication, deleteParticularBlog);

module.exports = router;
