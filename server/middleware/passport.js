const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
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
// Github Oauth Passport Strategy:
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      //check user table for anyone with a Github ID

      User.findOne(
        {
          github_id: profile.id,
        },
        function (err, user) {
          if (err) {
            return done(err);
          }
          //No user was found... so create a new user with values from Google (all the profile. stuff)
          try {
            if (!user) {
              user = new User({
                name: profile._json.name,
                email: profile._json.email,
                //Node Id as default password till the user change it
                password: profile._json.node_id,
                avatar: profile._json.avatar_url,
                github_id: profile.id,
              });
              user.save(function (err) {
                if (err) console.log(err);
                return done(err, user);
              });
            } else {
              //found user. Return
              return done(err, user);
            }
          } catch (error) {
            return alert(error);
          }
        }
      );
    }
  )
);
//Facebook Oauth Passport Strategy:
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5000/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      //check user table for anyone with a Facebook ID
      User.findOne(
        {
          facebook_id: profile.id,
        },
        function (err, user) {
          if (err) {
            return done(err);
          }
          //No user was found... so create a new user with values from Google (all the profile. stuff)
          if (!user) {
            user = new User({
              name: profile._json.name,
              email: profile._json.id + "@facebook.com",
              //Node Id as default password till the user change it
              password: profile._json.id,
              facebook_id: profile._json.id,
            });
            user.save(function (err) {
              if (err) console.log(err);
              return done(err, user);
            });
          } else {
            //found user. Return
            return done(err, user);
          }
        }
      );
    }
  )
);
