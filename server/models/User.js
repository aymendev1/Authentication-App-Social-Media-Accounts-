// i will use mongoose
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Unique Email for each user
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: Number,
    default: 0, //Role user 0 : employee , 1: admin
  },
  history: {
    //order history
    type: Array,
    default: [],
  },
  google_id: {
    type: String,
    default: " ",
  },
});
UserSchema.plugin(findOrCreate);
module.exports = User = mongoose.model("User", UserSchema);
