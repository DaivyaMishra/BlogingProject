const express = require("express");
const router = express.Router();

const { createAuthor } = require("../controllers/authorController");

router.post("/authors", createAuthor);

module.exports = router;
