const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config({
  path: "./config/index.env",
});

//MongoDB
const connectDB = require("./config/db");
connectDB();

app.use(bodyParser.json());
app.use(express.static("../Client/public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.get("/", (req, res) => {
  res.sendFile("/Client/AuthPage.html", { root: ".." });
});
app.use("/api/user/", require("./routes/auth.route"));
app.use((req, res) => {
  res.status(404).json({
    data: "Page not Founded !",
  });
});
app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
