const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // to generate token
const bcrypt = require("bcrypt"); // to encrypt password
//Check validation for requets
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const gravatar = require("gravatar"); // get userimage by email
//Model
const User = require("../models/User");
// @route  Post api/user/
// @desc   User Info
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    //get user info
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

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
        //PayLoad to generate Token
        const payLoad = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payLoad,
          process.env.JWT_SECRET,
          {
            expiresIn: 360000, // for development for production it will be 3600
          },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
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
  [
    // Validation for email and password
    check("email", "Please include a valid email ").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //If error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      //If everything is good
      // get email and pass from body
      const { email, password } = req.body;
      try {
        //Find user in db
        let user = await User.findOne({ email });
        //if User not found if database
        if (!user) {
          return res.status(400).json({ errors: [{ msg: "User not Found" }] });
        } else {
          //Know user founded by email let's compare password
          const isMatch = await bcrypt.compare(password, user.password);
          // password doesn't match
          if (!isMatch) {
            return res
              .status(400)
              .json({ errors: [{ msg: "Password is incorrect" }] });
          }
          //Payload for jwt
          const payload = {
            user: { id: user.id },
          };
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
              expiresIn: 360000, // for development for production it will be 3600
            },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
        }
      } catch (err) {
        console.log(err.message);
        res.status(400).send("server Error");
      }
    }
  }
);
module.exports = router;
