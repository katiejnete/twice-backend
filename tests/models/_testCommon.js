const db = require("../../db.js");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../../config.js");

const userIds = [];
const listingId = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM favorites");
  await db.query("DELETE FROM listing_images");
  await db.query("DELETE FROM listings");
  await db.query("DELETE FROM notifications");
  await db.query("DELETE FROM subscriptions");
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM locations");
  await db.query("DELETE FROM conditions");
  await db.query("DELETE FROM categories");

  // Populate locations
  await db.query(
    `INSERT INTO locations (id, latitude, longitude, city, state, zip) 
      VALUES (1, 33.9731, -118.2479, 'Los Angeles', 'CA', '90001'),
      (2, 40.7484, -73.9967, 'New York City', 'NY', '10001'),
      (3, 37.0313, -122.1198, 'Santa Cruz', 'CA', '95060')`
  );

  // Populate categories
  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Toys and Games",
    "Books",
    "Home",
    "Sports",
    "Miscellaneous",
    "Health and Beauty",
  ];
  for (let i = 0; i < categories.length; i++) {
    await db.query(`INSERT INTO categories (id, name) VALUES ($1, $2)`, [
      i + 1,
      categories[i],
    ]);
  }

  // Populate conditions
  const conditions = ["New", "Like New", "Used", "Refurbished", "Damaged"];
  for (let i = 0; i < conditions.length; i++) {
    await db.query(`INSERT INTO conditions (id, name) VALUES ($1, $2)`, [
      i + 1,
      conditions[i],
    ]);
  }

  // Populate users and listings
  const password1 = await bcrypt.hash("password1", BCRYPT_WORK_FACTOR);
  const password2 = await bcrypt.hash("password2", BCRYPT_WORK_FACTOR);
  const password3 = await bcrypt.hash("password3", BCRYPT_WORK_FACTOR);
  const usersRes = await db.query(
    `INSERT INTO users (id, username, password, location_id, items_given_away) 
      VALUES ($1, 'u1', $4, 1, 0),
      ($2, 'u2', $5, 2, 0),
      ($3, 'u3', $6, 3, 3)
      RETURNING id`,
    [
      faker.string.uuid(),
      faker.string.uuid(),
      faker.string.uuid(),
      password1,
      password2,
      password3,
    ]
  );

  usersRes.rows.map((row) => userIds.push(row.id));

  const listingRes = await db.query(
    `INSERT INTO listings (id, user_id, title, description, category_id, condition_id, location_id) 
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id`,
    [faker.string.uuid(), userIds[0], "title", "description", 3, 3, 1]
  );

  listingId.push(listingRes.rows[0].id);

  const imageUrl = `1.jpg`;
  await db.query(
    `INSERT INTO listing_images (id, listing_id, image_url, image_order) VALUES ($1, $2, $3, $4)`,
    [faker.string.uuid(), listingId[0], imageUrl, 1]
  );

  // Add favorite
  await db.query(
    `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)`,
    [userIds[1], listingId[0]]
  );  
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  userIds,
  listingId,
};
