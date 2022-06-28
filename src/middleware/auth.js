const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");

// Authentication
const authorAuthentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];
    // checking token
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "token must be present" });

    // validating the token
    jwt.verify(token, "project1group29", function (err, decoded) {
      if (err)
        return res.status(401).send({ status: false, msg: "token is invalid" });
      else {
        // creating an attribute in "req" to access the token outside the middleware
        req.token = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//Authorization
const authorization = async function (req, res, next) {
  try {
    let blogId = req.params.blogId;
    let userLoggedIn = req.token.authorId;

    // Blog validation
    let user = await blogModel.findOne({
      _id: blogId,
      isDeleted: false,
    });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, msg: "No such blog exists" });
    }
    // token validation
    if (userLoggedIn != user.authorId)
      return res.status(403).send({
        status: false,
        msg: "You are not authorized to perform this task",
      });

    // creating an attribute in "req" to access the blog data outside the middleware
    req.blog = user;
    next();
  } catch (err) {
    return res.status(401).send({ status: false, msg: "token is invalid" });
  }
};

module.exports = {
  authorAuthentication,
  authorization,
};
