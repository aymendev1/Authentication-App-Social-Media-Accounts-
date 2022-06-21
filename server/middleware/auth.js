const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({
      msg: "No Token , auth denied",
    });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // set user id in req.user
      process.nextTick(function () {
        return result(null, decoded.user);
      });
      next();
    } catch (err) {
      req.status(401).json({ msg: "Token is not valid" });
    }
  }
  // verify token
};
