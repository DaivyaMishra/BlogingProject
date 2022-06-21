const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    title: { type: String, enum: ["Mr", "Mrs", "Miss"] },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
