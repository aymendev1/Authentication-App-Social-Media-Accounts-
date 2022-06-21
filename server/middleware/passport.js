const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // to encrypt password

passport.serializeUser(function (user, result) {
  process.nextTick(function () {
    result(null, { id: user._id });
  });
});

passport.deserializeUser(function (user, result) {
  process.nextTick(function () {
    return result(null, user);
  });
});
// Db login Strategy
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (username, password, done) {
      User.findOne({ email: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        bcrypt.compare(password, user.password, function (err, res) {
          if (err) return done(err);
          if (res === false) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        });
      });
    }
  )
);
// Google Oauth Passport Strategy:
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, result) {
      //check user table for anyone with a Google ID
      User.findOne(
        {
          google_id: profile.id,
        },
        function (err, user) {
          if (err) {
            return result(err);
          }
          //No user was found... so create a new user with values from Google (all the profile. stuff)
          if (!user) {
            user = new User({
              name: profile.displayName,
              email: profile._json.email,
              password: profile._json.sub,
              avatar: profile._json.picture,
              google_id: profile._json.sub,
            });
            user.save(function (err) {
              if (err) console.log(err);
              return result(err, user);
            });
          } else {
            //found user. Return
            return result(err, user);
          }
        }
      );
    }
  )
);
