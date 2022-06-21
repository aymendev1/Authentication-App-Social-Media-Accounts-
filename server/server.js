const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();
const session = require("express-session");
require("dotenv").config({
  path: "./config/index.env",
});

//MongoDB
const connectDB = require("./config/db");
const User = require("./models/User");
connectDB();

app.use(bodyParser.json());
app.use(express.static("../Client/public"));

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use(session({ secret: process.env.CookieSecret }));
app.use(passport.initialize());
app.use(passport.session());

async function isLoggedIn(req, res, next) {
  (await req.user) ? next() : res.sendStatus(401);
}

app.get("/", (req, res) => {
  res.sendFile("/Client/AuthPage.html", { root: ".." });
});
app.get("/home", isLoggedIn, (req, res) => {
  res.sendFile("/Client/index.html", { root: ".." });
});
// Route to pass data From db to Home page
app.get("/datajson", isLoggedIn, async (req, res) => {
  try {
    User.findOne({ _id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        const result = {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
        res.status(200).json(result);
      }
    });
  } catch (e) {
    res.status(400).json({ sucess: false, data: e });
  }
});
app.use("/", require("./routes/auth.route"));
app.use((req, res) => {
  res.status(404).json({
    data: "Page not Founded !",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
