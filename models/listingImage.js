"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { v4: uuidv4 } = require("uuid");

/** Related functions for listing images. */

class ListingImage {
  constructor({ id, listingId, imageUrl, imageOrder }) {
    this.id = id;
    this.listingId = listingId;
    this.imageUrl = imageUrl;
    this.imageOrder = imageOrder;
  }

  /** Create listing image with image order of 1 if listing images do not exist.
   * Else, creates new listing image with incremented image order by 1 for listing.
   *
   * Returns { id, listingId, imageUrl, imageOrder }
   *
   * Throws BadRequestError if maximum image limit reached for listing.
   **/

  static async create(listingId, imageUrl) {
    let imageOrder;
    let allListingImages;

    try {
      allListingImages = await this.getAllImages(listingId);
    } catch (err) {
      allListingImages = [];
    }

    if (allListingImages.length === 3)
      throw new BadRequestError("Maximum image limit reached for listing");

    imageOrder = allListingImages.length + 1;

    const uuid = uuidv4();
    const result = await db.query(
      `INSERT INTO listing_images
           (id,
            listing_id,
            image_url,
            image_order)
            VALUES ($1, $2, $3, $4)
            RETURNING id,
            listing_id AS "listingId",
            image_url AS "imageUrl",
            image_order AS "imageOrder"`,
      [uuid, listingId, imageUrl, imageOrder]
    );

    const listingImage = result.rows[0];

    return new ListingImage(listingImage);
  }

  /** Get all listing images associated with one listing.
   *
   * Returns [{ id, listingId, imageUrl, imageOrder }, ...]
   *
   * Throws NotFoundError if no listing images are found for listing.
   **/

  static async getAllImages(listingId) {
    const result = await db.query(
      `SELECT id,
      listing_id AS "listingId",
      image_url AS "imageUrl",
      image_order AS "imageOrder"
      FROM listing_images
      WHERE listing_id = $1`,
      [listingId]
    );

    const listingImages = result.rows;

    if (!listingImages.length)
      throw new NotFoundError(
        `No listing images found for listing id: ${listingId}`
      );

    return listingImages.map((listingImage) => new ListingImage(listingImage));
  }

  /** Get one listing image associated with one listing.
   *
   * Returns { id, listingId, imageUrl, imageOrder }
   *
   * Throws NotFoundError if listing image not found for listing.
   **/

  static async getOneImage(listingId, imageOrder = 1) {
    const result = await db.query(
      `SELECT id,
      listing_id AS "listingId",
      image_url AS "imageUrl",
      image_order AS "imageOrder"
      FROM listing_images
      WHERE listing_id = $1
      AND image_order = $2`,
      [listingId, imageOrder]
    );

    const listingImage = result.rows[0];

    if (!listingImage)
      throw new NotFoundError(`No listing image for listing id: ${listingId}`);

    return new ListingImage(listingImage);
  }

  /** Update listing images' image order when a listing image is deleted.
   *
   * Returns { id, listingId, imageUrl, imageOrder }
   *
   * Throws NotFoundError if listing image at the image order are not found for listing.
   **/

  async update(newImageOrder) {
    const result = await db.query(
      `UPDATE listing_images
              SET image_order = $1
              WHERE listing_id = $2
              AND image_order = $3
              RETURNING image_order AS "imageOrder"`,
      [newImageOrder, this.listingId, this.imageOrder]
    );

    const updatedImageOrder = result.rows[0].imageOrder;

    if (!updatedImageOrder)
      throw new NotFoundError(`No listing images for listing id: ${listingId}`);

    this.imageOrder = updatedImageOrder;

    return this;
  }

  /** Delete listing image at position.
   *
   * Returns  [{ id, listingId, imageUrl, imageOrder }, ...]
   *
   * Throws NotFoundError if listing image at the image order are not found for listing.
   **/
  async remove() {
    const result = await db.query(
      `DELETE
      FROM listing_images
      WHERE listing_id = $1
      AND image_order = $2
      RETURNING id,
      listing_id AS "listingId",
      image_url AS "imageUrl",
      image_order AS "imageOrder"
      `,
      [this.listingId, this.imageOrder]
    );

    const listingImage = result.rows[0];

    if (!listingImage)
      throw new NotFoundError(`No listing images for listing id: ${listingId}`);

    try {
      let images = await ListingImage.getAllImages(this.listingId);
      images = images.map(async (image, idx) => await image.update(idx + 1));
      return await Promise.all(images);
    } catch (err) {
      return;
    }
  }
}

module.exports = ListingImage;
