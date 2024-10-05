"use strict";

/** Routes for locations. */

const jsonschema = require("jsonschema");

const Location = require("../models/location");
const express = require("express");
const locationNewSchema = require("../schemas/locationNew.json");

const router = new express.Router();

/** POST / { zip } => { location }
 *
 * Returns { id, latitude, longitude, city, state, zip }
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, locationNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { zip } = req.body;
    const location = await Location.create(zip);
    return res.status(201).json({ location });
  } catch (err) {
    return next(err);
  }
});

/** GET /[zip] => { location }
 *
 * Returns { id, latitude, longitude, city, state, zip }
 */

router.get("/:zip", async function (req, res, next) {
  try {
    const location = await Location.get(req.params.zip);
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

/** GET /ids/[id] => { location }
 *
 * Returns { id, latitude, longitude, city, state, zip }
 */

router.get("/ids/:id", async function (req, res, next) {
  try {
    const location = await Location.getById(req.params.id);
    return res.json({ location });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
