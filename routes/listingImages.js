"use strict";

/** Routes for listing images. */

const jsonschema = require("jsonschema");

const ListingImage = require("../models/listingImage");
const Listing = require("../models/listing");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const express = require("express");
const listingImageNewSchema = require("../schemas/listingImageNew.json");

const router = new express.Router();

/** POST /[username]/listings/[id] { imageUrl } => { listingImage }
 *
 * Returns { id, listingId, imageUrl, imageOrder }
 *
 * Authorization required: same-user-as-:username
 */

router.post(
  "/:username/listings/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const listing = await Listing.get(req.params.id);
      if (listing.userId !== req.user.userId) throw new UnauthorizedError();

      const validator = jsonschema.validate(
        req.body,
        listingImageNewSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const { imageUrl } = req.body;
      const listingId = req.params.id;
      const newImage = await ListingImage.create(listingId, imageUrl);
      return res.status(201).json({ listingImage: newImage });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /listings/[id] => { listingImages: [{ id, listingId, imageUrl, imageOrder }, ...] }
 *
 * Returns list of all listingImages for listing.
 */

router.get("/listings/:id", async function (req, res, next) {
  try {
    const listingId = req.params.id;
    const listingImages = await ListingImage.getAllImages(listingId);
    return res.json({ listingImages });
  } catch (err) {
    return next(err);
  }
});

/** GET /listings/[id]/thumbnail => { listingImage }
 *
 * Returns { id, listingId, imageUrl, imageOrder }
 */

router.get("/listings/:id/thumbnail", async function (req, res, next) {
  try {
    const listingId = req.params.id;
    const listingImage = await ListingImage.getOneImage(listingId);
    return res.json({ listingImage });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]/[imageOrder]/listings/[id] => { listingImages }
 *
 * Returns [{ id, listingId, imageUrl, imageOrder }, ...]
 *
 * Authorization required: same-user-as-:username
 */

router.delete(
  "/:username/listings/:id/:imageOrder",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      if (!+req.params.imageOrder)
        throw new BadRequestError(`Please follow correct route pattern`);
      const listingId = req.params.id;
      const listingImage = await ListingImage.getOneImage(
        listingId,
        req.params.imageOrder
      );
      const currentListingImages = await listingImage.remove();
      return res.json({ listingImages: currentListingImages });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
