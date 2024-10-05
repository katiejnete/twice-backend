"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for locations. */

class Category {
  /** Return all categories' data.
   *
   * Returns [{ id, name }, ...]
   **/

  static async getAll() {
    const result = await db.query(`SELECT * FROM categories`);

    const categories = result.rows;

    return categories;
  }

  /** Given category name, return category id.
   *
   * Returns { id, name }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(name) {
    const result = await db.query(
      `SELECT *
        FROM categories
        WHERE name ILIKE $1`,
      [name]
    );

    const category = result.rows[0];

    if (!category) throw new NotFoundError(`No category: ${name}`);

    return category;
  }
}

module.exports = Category;
