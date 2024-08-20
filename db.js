/** Database setup for BizTime. */
const { Client } = require("pg");
require('dotenv').config()

// const DB_URI = (process.env.NODE_ENV === "test")
//   ? "postgresql:///biztime_test"
//   : "postgresql:///biztime";

const DB_URI = (process.env.NODE_ENV === "test")
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
