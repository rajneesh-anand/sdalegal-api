const express = require("express");
const cors = require("cors");
const service = require("./routes/service");
const awsupload = require("./routes/awsupload");
require("dotenv").config();

const app = express();
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

var allowedDomains = [
  "https://sdalegal-admin.vercel.app",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use("/api/service", service);
app.use("/api/awsupload", awsupload);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
