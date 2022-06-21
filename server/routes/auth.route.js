const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // to encrypt password
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { check, validationResult } = require("express-validator"); //Check validation for requets
require("../middleware/passport");
const gravatar = require("gravatar"); // get userimage by email

//Model
const User = require("../models/User");
// @route  Post api/user/register
// @desc   Register User
// @access Public
router.post(
  "/register",
  [
    //validation
    check("name", "Name is required !").not().isEmpty(),
    check("email", "Please include a valid email !").isEmail(),
    check(
      "password",
      "Please enter a password with ^ or more characters "
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
    } else {
      //Get name and Email and Password from request
      const { name, email, password } = req.body;
      try {
        //Check if User already exist
        let user = await User.findOne({ email });
        //if User Exist
        if (user) {
          return res.status(400).json({
            errors: [
              {
                data: "User already Exists",
              },
            ],
          });
        }
        //If not exists
        //get image from Gravatar
        const avatar = gravatar.url(email, {
          s: "200", //Size
          r: "pg", //Rate
          d: "mm",
        });
        //Create User object
        user = new User({ name, email, avatar, password });
        //encrypt password
        const salt = await bcrypt.genSalt(10); // gen salt contains 10
        // Save password
        user.password = await bcrypt.hash(password, salt); // User Password and salt to hash  password
        // save user in db
        await user.save();
        //Redirect to login page after the Register completed
        res.redirect("/");
      } catch (error) {
        console.log(error.message);
        res.status(400).send("server Error");
      }
    }
  }
);
// @route  Post api/user/login
// @desc   Login User
// @access Public
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/404",
  })
);
// @route  Postapi/user/login
// @desc   Login User By Google using PassportJS
// @access Public
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
