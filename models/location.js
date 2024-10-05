"use strict";

const db = require("../db");
const getLocation = require("../helpers/locationConverter");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related functions for locations. */

class Location {
  /** Checks if location already exists in database.
   *
   * Throws BadRequestError if location already exists.
   **/

  static async duplicateCheck(zip) {
    const duplicateCheck = await db.query(
      `SELECT id
        FROM locations
        WHERE zip = $1`,
      [zip]
    );

    const locationId = duplicateCheck.rows[0];

    if (locationId) {
      throw new BadRequestError(`Duplicate location: ${locationId}`);
    }
  }

  /** Create location with data.
   *
   * Returns { id, latitude, longitude, city, state, zip }
   **/

  static async create(zip) {
    try {
      await this.duplicateCheck(zip);
      const { city, state, latitude, longitude } = await getLocation(zip);
  
      const result = await db.query(
        `INSERT INTO locations
             (latitude,
              longitude, 
              city, 
              state, 
              zip)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
        [latitude, longitude, city, state, zip]
      );

      const location = result.rows[0];
  
      return location;
    } catch (error) {
      throw new BadRequestError(`Cannot find zip code: ${zip}`);
    }
  }

  /** Get location data.
   *
   * Returns { id, latitude, longitude, city, state, zip }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(zip) {
    const result = await db.query(
      `SELECT *
      FROM locations
      WHERE zip = $1`,
      [zip]
    );

    const location = result.rows[0];

    if (!location) throw new NotFoundError(`No location: ${zip}`);

    return location;
  }

  /** Get location data by id.
   *
   * Returns { id, latitude, longitude, city, state, zip }
   *
   * Throws NotFoundError if not found.
   **/

  static async getById(id) {
    const result = await db.query(
      `SELECT *
      FROM locations
      WHERE id = $1`,
      [id]
    );

    const location = result.rows[0];

    if (!location) throw new NotFoundError(`No location: ${id}`);

    return location;
  }
}

module.exports = Location;
