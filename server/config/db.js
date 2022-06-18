const mongoose = require("mongoose");
const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  });

  console.log(`MongoDB Connected : ${connection.connection.host}`);
};

module.exports = connectDB;
