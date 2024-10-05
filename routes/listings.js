"use strict";

/** Routes for listings. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Listing = require("../models/listing");
const Location = require("../models/location");
const Category = require("../models/category");
const Condition = require("../models/condition");
const User = require("../models/user");
const listingNewSchema = require("../schemas/listingNew.json");
const listingUpdateSchema = require("../schemas/listingUpdate.json");
const listingSearchSchema = require("../schemas/listingSearch.json");

const router = express.Router();

/** POST /[username] { title, description, categoryId, conditionId, locationId } => { listing }
 *
 * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
 *
 * Authorization required: same-user-as-:username
 */

router.post("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, listingNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const userId = req.user.userId;
    const { title, description, categoryId, conditionId, locationId } =
      req.body;
    const listing = await Listing.create({
      userId,
      title,
      description,
      categoryId,
      conditionId,
      locationId,
    });
    return res.status(201).json({ listing });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { listings: [{ id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }, ...] }
 *
 * Returns list of listings by username.
 */

router.get("/users/:username", async function (req, res, next) {
  try {
    const listings = await Listing.getAllByUser(req.params.username);
    return res.json({ listings });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { listings: [{ id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }, ...] }
 *
 * Can filter on provided search filters:
 * - Category
 * - Condition
 * - nameLike (case-insensitive, partial matches in title or description)
 *
 * Can sort on provided search criteria:
 * - Best (default)
 * - Most recent
 * - Most closest
 *
 * Returns list of listings.
 */

router.get("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.query, listingSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    let categoryId, conditionId, location, userId;
    const { q, category, condition, zip, radius, sort } = req.query;
    if (category) {
      const categoryInstance = (await Category.get(category));
      categoryId = categoryInstance.id;
    }
    if (condition) {
      const conditionInstance = (await Condition.get(condition));
      conditionId = conditionInstance.id;
    }
    if (req.user) {
      const user = await User.get(req.user.username);
      if (user.locationId) userId = req.user.userId;
    }
    if (zip) {
      try {
        const locationInstance = (await Location.get(zip));
        location = locationInstance;
      } catch (err) {
        location = await Location.create(zip);
      }
    }

    const listings = await Listing.findAll({
      userId,
      filters: {q, categoryId, conditionId, location, radius},
      sort,
    });
    return res.json({ listings });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id] => { listing }
 *
 * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
 */

router.get("/:id", async function (req, res, next) {
  try {
    const listing = await Listing.get(req.params.id);
    return res.json({ listing });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username]/[id] {data} => { listing }
 *
 * Data can include: { title, description, categoryId, conditionId, locationId, status }
 *
 * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
 *
 * Authorization required: same-user-as-:username
 */

router.patch(
  "/:username/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, listingUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const listingInstance = await Listing.get(req.params.id);
      const listing = await listingInstance.update(req.body);
      return res.json({ listing });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/[id] => { deleted: id }
 *
 * Authorization required: same-user-as-:username
 */

router.delete(
  "/:username/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const listingInstance = await Listing.get(req.params.id);
      await listingInstance.remove();
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
