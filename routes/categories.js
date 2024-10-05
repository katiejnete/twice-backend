"use strict";

/** Routes for categories. */

const Category = require("../models/category");
const express = require("express");
const router = new express.Router();

/** GET / => { categories: [{ id, name }, ...] }
 *
 * Returns list of categories.
 */

router.get("/", async function (req, res, next) {
  try {
    const categories = await Category.getAll();
    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
});

/** GET /[name] => { category }
 *
 * Returns { id, name }
 */

router.get("/:name", async function (req, res, next) {
    try {
      const category = await Category.get(req.params.name);
      return res.json({ category });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;