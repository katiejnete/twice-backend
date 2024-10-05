"use strict";

const db = require("../db");
const Location = require("./location.js");
const { convertJsToSql } = require("../helpers/sqlConverter.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { v4: uuidv4 } = require("uuid");

/** Related functions for users. */

class User {
  constructor({
    id,
    username,
    avatar,
    locationId = null,
    contactInfo = null,
    itemsGivenAway,
    zip = null,
  }) {
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.locationId = locationId;
    this.contactInfo = contactInfo;
    this.itemsGivenAway = itemsGivenAway;
    this.zip = zip;
  }

  /** Check if username already exists.
   *
   * Throws BadRequestError if user already exists.
   **/

  static async duplicateCheck(username) {
    const duplicateCheck = await db.query(
      `SELECT username
             FROM users
             WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }
  }

  /** authenticate user with username, password.
   *
   * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
      username,
      password,
      avatar,
      location_id AS "locationId",
      contact_info AS "contactInfo",
      items_given_away AS "itemsGivenAway"
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return new User(user);
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
   **/

  static async register(username, password) {
    await this.duplicateCheck(username);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const uuid = uuidv4();
    const result = await db.query(
      `INSERT INTO users
      (id, username, password)
      VALUES ($1, $2, $3)
      RETURNING id,
      username,
      avatar,
      location_id AS "locationId",
      contact_info AS "contactInfo",
      items_given_away AS "itemsGivenAway"`,
      [uuid, username, hashedPassword]
    );

    const user = result.rows[0];

    return new User(user);
  }

  /** Given a username, return data about user.
   *
   * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT users.id,
      username,
      avatar,
      locations.zip,
      location_id as "locationId",
      contact_info AS "contactInfo",
      items_given_away AS "itemsGivenAway"
      FROM users
      FULL JOIN locations
      ON locations.id = users.location_id
      WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return new User(user);
  }

  /** Get total items given away by all users.
   *
   * Returns total items given away.
   **/

  static async getTotalItemsGivenAway() {
    const result = await db.query(
      `SELECT SUM(items_given_away) AS "totalItemsGivenAway"
      FROM users`
    );

    const totalItemsGivenAway = result.rows[0].totalItemsGivenAway;

    return +totalItemsGivenAway;
  }

  /** Update user data.
   *
   * This update only updates one field at a time.
   *
   * Data can include:
   *   { password }, { avatar }, { locationId }, { contactInfo }
   *
   * Returns { id, username, avatar, locationId, contactInfo, itemsGivenAway }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   */

  async update({ colName, updateVal, currentVal = null }) {
    switch (colName) {
      case "password":
        try {
          await User.authenticate(this.username, currentVal);
          updateVal = await bcrypt.hash(updateVal, BCRYPT_WORK_FACTOR);
        } catch (err) {
          throw new UnauthorizedError("Invalid current password"); 
        }
        break;
      case "avatar":
        break;
      case "zip":
        let location;
        try {
          colName = "locationId"
          if (!updateVal) {
            break;
          }
          location = await Location.get(updateVal);
          updateVal = location.id
        } catch (err) {
          if (!location) {
            location = await Location.create(updateVal);
            updateVal = location.id;
          }
        }
        break;
    }

    const sqlColName = convertJsToSql(colName);

    const result = await db.query(
      `UPDATE users
        SET ${sqlColName} = $1
        WHERE username = $2
        RETURNING id,
        username,
        avatar,
        location_id AS "locationId",
        contact_info AS "contactInfo",
        items_given_away AS "itemsGivenAway"`,
      [updateVal, this.username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${this.username}`);

    this[colName] = updateVal;

    return this;
  }
}

module.exports = User;
