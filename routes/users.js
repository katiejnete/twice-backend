"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** GET /[username] => { user }
 *
 * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
 **/

router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET /items-given-away => { itemsGivenAway }
 *
 * Returns { itemsGivenAway }
 **/

router.get("/all/items-given-away", async function (req, res, next) {
  try {
    const itemsGivenAway = await User.getTotalItemsGivenAway();
    return res.json({ itemsGivenAway });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { colName, updateVal, currentVal (for password) } => { user }
 *
 * colName data can include: password, avatar, locationId, contactInfo
 *
 * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
 *
 * Authorization required: same-user-as-:username
 **/

router.patch(
  "/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      let updateVal;
      const { colName, updateVal: newVal, currentVal } = req.body;
      if (!newVal) updateVal = null;
      else updateVal = newVal;
      
      let user = await User.get(req.params.username);
      user = await user.update({ colName, updateVal, currentVal });
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
