const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
process.on("uncaughtException", (err) => {
  console.log("unhadled rejection. shutting down....");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

const database = (module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  };

  try {
    mongoose.connect("mongodb://localhost:27017", connectionParams);
    console.log("Succesful Connected");
  } catch (err) {
    console.log("Error in connecting to mongodb");
  }
});

database();

const app = require("./index");
const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message, err.stack);
  console.log("unhadled rejection. shutting down....");
  // server.close(() => {
  //   process.exit(1);
  // });
});
