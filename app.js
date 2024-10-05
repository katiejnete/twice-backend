"use strict";

/** Express app for TwiceLoved. */

const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const locationRoutes = require("./routes/locations");
const listingImageRoutes = require("./routes/listingImages");
const listingRoutes = require("./routes/listings");
const favoriteRoutes = require("./routes/favorites");
const conditionRoutes = require("./routes/conditions");
const categoryRoutes = require("./routes/categories");

const morgan = require("morgan");
const { authenticateJWT } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.use("/auth", authRoutes);

app.use(authenticateJWT);
app.use("/users", userRoutes);
app.use("/locations", locationRoutes);
app.use("/listing-images", listingImageRoutes);
app.use("/listings", listingRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/conditions", conditionRoutes);
app.use("/categories", categoryRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;