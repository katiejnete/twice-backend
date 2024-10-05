"use strict";

/** Routes for locations. */

const Condition = require("../models/condition");
const express = require("express");
const router = new express.Router();

/** GET / => { conditions: [{ id, name }, ...] }
 *
 * Returns list of conditions.
 */

router.get("/", async function (req, res, next) {
  try {
    const conditions = await Condition.getAll();
    return res.json({ conditions });
  } catch (err) {
    return next(err);
  }
});

/** GET /[name] => { condition }
 *
 * Returns { id, name }
 */

router.get("/:name", async function (req, res, next) {
    try {
      const condition = await Condition.get(req.params.name);
      return res.json({ condition });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
