const express = require("express");
var bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");

const route = require("./routes/route.js");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://Manasvi29:bharat2909@cluster0.r7a9dpa.mongodb.net/group29Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
