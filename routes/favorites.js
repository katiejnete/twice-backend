"use strict";

/** Routes for favorites. */

const Favorite = require("../models/favorite");
const User = require("../models/user");
const { ensureCorrectUser } = require("../middleware/auth");
const express = require("express");
const { NotFoundError } = require("../expressError");
const router = new express.Router();

/** POST /[username]/[listingId] => { favorite }
 *
 * Returns { userId, listingId }
 *
 * Authorization required: same-user-as-:username
 */

router.post("/:username/:listingId", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const favorite = await Favorite.create(user.id, req.params.listingId);
    return res.status(201).json({ favorite });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { favorites: [{ userId, listingId }, ...] }
 *
 * Returns list of user's favorites.
 *
 * Authorization required: same-user-as-:username
 */

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const favorites = await Favorite.getUserFavorites(user.id);
    return res.json({ favorites });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username]/[listingId] => { favorite }
 *
 * Returns { userId, listingId }
 *
 * Authorization required: same-user-as-:username
 */

router.get("/:username/:listingId", ensureCorrectUser, async function (req, res, next) {
  try {
    const userId = req.user.userId;
    const favorite = await Favorite.get(userId, req.params.listingId);
    if (!favorite) throw new NotFoundError(`No favorite listing: ${req.params.listingId}`);
    return res.json({ favorite });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]/[listingId] => { deleted: id }
 *
 * Authorization required: same-user-as-:username
 */

router.delete("/:username/:listingId", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    await Favorite.remove(user.id, req.params.listingId);
    return res.json({ deleted: req.params.listingId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
