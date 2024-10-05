"use strict";

const db = require("../db");
const ListingImage = require("../models/listingImage.js");
const { convertJsToSql, addToSqlQuery } = require("../helpers/sqlConverter.js");
const { NotFoundError } = require("../expressError");
const { v4: uuidv4 } = require("uuid");

/** Related functions for listings. */

class Listing {
  constructor({
    id,
    userId,
    title,
    description,
    categoryId,
    conditionId,
    locationId,
    city = null,
    state = null,
    lastModified,
    status,
    username = null,
  }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.categoryId = categoryId;
    this.conditionId = conditionId;
    this.locationId = locationId;
    this.city = city;
    this.state = state;
    this.lastModified = lastModified;
    this.status = status;
    this.username = username;
  }

  /** Create listing with data.
   *
   * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
   **/

  static async create({
    userId,
    title,
    description,
    categoryId,
    conditionId,
    locationId,
  }) {
    const uuid = uuidv4();
    const listingRes = await db.query(
      `INSERT INTO listings
           (id,
            user_id,
            title,
            description,
            category_id,
            condition_id,
            location_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id,
           user_id AS "userId",
           title,
           description,
           category_id AS "categoryId",
           condition_id AS "conditionId",
           location_id AS "locationId",
           last_modified AS "lastModified",
           status`,
      [uuid, userId, title, description, categoryId, conditionId, locationId]
    );

    const listing = listingRes.rows[0];

    return new Listing(listing);
  }

  /** Find all listings by search query (optional filters and sort),
   *  where username is current user's.
   *
   * filters:
   * conditionId (all) (Default)
   * categoryId (all) (Default)
   *
   * sort:
   * Best Match (both recent and closest) (Default)
   * Recent first
   * Closest first
   *
   * Returns [{ id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }, ...]
   *
   * Throw NotFoundError if not found.
   **/

  static async findAll({ userId = null, filters, sort }) {
    let latitude, longitude, radius;
    const conversionFactor = 1.60934;
  
    if (filters.radius) {
      radius = +filters.radius * conversionFactor;
    }
  
    if (filters.location) {
      ({ latitude, longitude } = filters.location);
    } else if (userId) {
      const userRes = await db.query(
        `SELECT latitude, longitude 
         FROM locations l 
         JOIN users u ON l.id = u.location_id
         WHERE u.id = $1`,
        [userId]
      );
      ({ latitude, longitude } = userRes.rows[0]);
    }
  
    let initialQuery = `
      SELECT listings.id,
             user_id AS "userId",
             title,
             description,
             category_id AS "categoryId",
             condition_id AS "conditionId",
             location_id AS "locationId",
             city,
             state,
             last_modified AS "lastModified",
             status,
             locations.latitude,
             locations.longitude`;
  
    if (latitude && longitude) {
      initialQuery += `,
        ( 6371 * acos(
          cos( radians($1) ) 
          * cos( radians(locations.latitude) ) 
          * cos( radians(locations.longitude) - radians($2) ) 
          + sin( radians($1) ) 
          * sin( radians(locations.latitude) )
        ) ) AS distance
        FROM listings
        JOIN locations ON listings.location_id = locations.id
        WHERE ( 6371 * acos(
          cos( radians($1) ) 
          * cos( radians(locations.latitude) ) 
          * cos( radians(locations.longitude) - radians($2) ) 
          + sin( radians($1) ) 
          * sin( radians(locations.latitude) )
        ) ) <= $3`;
      delete filters.location;
    } else {
      initialQuery += `
        FROM listings
        JOIN locations ON listings.location_id = locations.id
        WHERE`;
      delete filters.location;
    }
  
    const { query, queryValues } = addToSqlQuery({
      latitude,
      longitude,
      filters,
      sort,
      radius,
    });
  
    const listingsRes = await db.query(initialQuery + query, queryValues);
    const listings = listingsRes.rows;
  
    if (!listings.length) {
      throw new NotFoundError(`No listings found for search: ${filters.q}`);
    }
  
    return Promise.all(
      listings.map(async (listing) => {
        listing = new Listing(listing);
        try {
          listing.listingImages = await ListingImage.getAllImages(listing.id);
        } catch (err) {
          listing.listingImages = [];
        }
        return listing;
      })
    );
  }  

  /** Get listing data.
   *
   * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
   *
   * Throw NotFoundError if not found.
   **/

  static async get(listingId) {
    const result = await db.query(
      `SELECT listings.id,
      user_id AS "userId",
      users.username,
      title,
      description,
      category_id AS "categoryId",
      condition_id AS "conditionId",
      listings.location_id AS "locationId",
      city,
      state,
      last_modified AS "lastModified",
      status
      FROM listings
      JOIN locations
      ON listings.location_id = locations.id
      JOIN users
      ON listings.user_id = users.id
      WHERE listings.id = $1`,
      [listingId]
    );

    const listing = result.rows[0];

    if (!listing) throw new NotFoundError(`No listing: ${listingId}`);

    return new Listing(listing);
  }

  /** Get all listings by username.
   *
   * Returns [{ id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }, ...]
   *
   * Throw NotFoundError if not found.
   **/

  static async getAllByUser(username) {
    const result = await db.query(
      `SELECT l.id,
      user_id AS "userId",
      title,
      description,
      category_id AS "categoryId",
      condition_id AS "conditionId",
      l.location_id AS "locationId",
      city,
      state,
      last_modified AS "lastModified",
      status
      FROM listings l
      JOIN users u
      ON l.user_id = u.id
      JOIN locations
      ON l.location_id = locations.id
      WHERE u.username = $1`,
      [username]
    );

    const listings = result.rows;

    if (!listings.length)
      throw new NotFoundError(`No listings for user: ${username}`);

    return Promise.all(
      listings.map(async (listing) => {
        try {
          listing = new Listing(listing);
          const listingImages = await ListingImage.getAllImages(listing.id);
          listing.listingImages = listingImages;
        } catch (err) {
          listing.listingImages = [];
        }
        return listing;
      })
    );
  }

  /** Update listing data.
   *
   * Data can include:
   * { title, description, categoryId, conditionId, locationId, status }
   *
   * Returns { id, userId, title, description, categoryId, conditionId, locationId, lastModified, status }
   *
   * Throw NotFoundError if not found.
   **/

  async update(data) {
    const colNames = Object.keys(data);
  
    if (colNames.length === 0) return this;
  
    for (const colName of colNames) {
      const sqlColName = convertJsToSql(colName);
  
      if (colName === "status" && this[colName] === "Available" && data[colName] === "Taken") {
        const userResult = await db.query(
          `UPDATE users
           SET items_given_away = items_given_away + 1
           WHERE id = $1
           RETURNING username`,
          [this.userId]
        );
  
        const user = userResult.rows[0];
        if (!user) throw new NotFoundError(`No user: ${user.username}`);
      }
  
      const listingResult = await db.query(
        `UPDATE listings
         SET ${sqlColName} = $1
         WHERE id = $2
         RETURNING id`,
        [data[colName], this.id]
      );
  
      if (!listingResult.rows[0]) throw new NotFoundError(`No listing: ${this.id}`);
  
      this[colName] = data[colName];
    }
  
    const lastModResult = await db.query(
      `UPDATE listings
       SET last_modified = NOW()
       WHERE id = $1
       RETURNING last_modified AS "lastModified"`,
      [this.id]
    );
  
    this.lastModified = lastModResult.rows[0].lastModified;
  
    return this;
  }  

  /** Delete listing data.
   *
   * Throws NotFoundError if not found.
   **/

  async remove() {
    const result = await db.query(
      `DELETE FROM listings
      WHERE id = $1
      RETURNING id`,
      [this.id]
    );

    const listing = result.rows[0];

    if (!listing) throw new NotFoundError(`No listing: ${this.id}`);
  }
}

module.exports = Listing;
