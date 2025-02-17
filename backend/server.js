const app = require("./app");
require("dotenv").config();
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// aungmyokhant459
// vAfeUfCxRIp2Aqhj
