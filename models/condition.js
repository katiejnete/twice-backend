"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for conditions. */

class Condition {
  /** Return all condtions' data.
   *
   * Returns [{ id, name }, ...]
   **/

  static async getAll() {
    const result = await db.query(`SELECT * FROM conditions`);

    const condtions = result.rows;

    return condtions;
  }

  /** Given Condition name, return Condition id.
   *
   * Returns { id, name }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(name) {
    const result = await db.query(
      `SELECT *
        FROM conditions
        WHERE name ILIKE $1`,
      [name]
    );

    const condition = result.rows[0];

    if (!condition) throw new NotFoundError(`No Condition: ${name}`);

    return condition;
  }
}

module.exports = Condition;
