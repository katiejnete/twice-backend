"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Listing = require("./listing");

/** Related functions for Favorites. */

class Favorite {
  /** Gets favorite if exists in database.
   * 
   * Returns { userId, listingId }
   **/

  static async get(userId, listingId) {
    const duplicateCheck = await db.query(
      `SELECT user_id AS "userId",
        listing_id AS "listingId"
        FROM favorites
        WHERE user_id = $1
        AND listing_id = $2`,
      [userId, listingId]
    );

    const favorite = duplicateCheck.rows[0];

    if (favorite) return favorite;

    return;
  }

  /** Create user favorite.
   * 
   * If favorite exists, removes favorite.
   *
   * Returns { userId, listingId }
   * 
   * Throws BadRequestError if user tries to favorite own listing.
   **/

  static async create(userId, listingId) {
    const listing = await Listing.get(listingId);
    if (listing.userId === userId) throw new BadRequestError(`Cannot favorite own listing`);

    const checkedFavorite = await Favorite.get(userId, listingId);

    if (checkedFavorite) throw new BadRequestError(`Already favorited: ${listingId}`);

    const result = await db.query(
      `INSERT INTO favorites
           (user_id, listing_id)
           VALUES ($1, $2)
           RETURNING user_id AS "userId",
           listing_id AS "listingId"`,
      [userId, listingId]
    );

    const favorite = result.rows[0];

    return favorite;
  }

  /** Get user favorites.
   *
   * Returns [ listingId, ...]
   * 
   * Throws NotFoundError if no favorites found.
   **/

  static async getUserFavorites(userId) {
    const result = await db.query(
      `SELECT listing_id AS "listingId" 
      FROM favorites
      WHERE user_id = $1`,
      [userId]
    );

    const favorites = result.rows.map(row => row.listingId);

    if (!favorites.length) throw new NotFoundError(`No favorites found for currrent user`);

    return favorites;
  }

  /** Remove user favorite.
   *
   * Throws NotFoundError if not found.
   **/

  static async remove(userId, listingId) {
    const result = await db.query(
      `DELETE 
        FROM favorites
        WHERE user_id = $1
        AND listing_id = $2 
        RETURNING listing_id AS "listingId"`,
      [userId, listingId]
    );

    const removedFavorite = result.rows[0];

    if (!removedFavorite)
      throw new NotFoundError(`No favorite found: ${listingId}`);
  }
}

module.exports = Favorite;
