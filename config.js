"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database

function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///twiceloved_test"
    : process.env.DATABASE_URL || "postgresql://postgres.zdnysnxypqanfsqjztbg:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

if (process.env.NODE_ENV !== "test") {
  console.log("TwiceLoved Config:".green);
  console.log("SECRET_KEY:".yellow, SECRET_KEY);
  console.log("PORT:".yellow, PORT.toString());
  console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
  console.log("Database:".yellow, getDatabaseUri());
  console.log("NODE_ENV:".yellow, process.env.NODE_ENV);
  console.log("---");
}

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
