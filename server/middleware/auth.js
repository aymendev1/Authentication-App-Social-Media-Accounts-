const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token fron header
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({
      msg: "No Token , auth denied",
    });
  }
  // verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // set user id in req.user
    req.user = decoded.user;
    next();
  } catch (err) {
    req.status(401).json({ msg: "Token is not valid" });
  }
};
