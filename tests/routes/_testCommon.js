"use strict";

const db = require("../../db.js");
const User = require("../../models/user.js");
const Listing = require("../../models/listing.js");
const { createToken } = require("../../helpers/tokens.js");
const { v4: uuidv4 } = require('uuid');

const users = [];
const listings = [];
const tokens = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM favorites");
  await db.query("DELETE FROM listing_images");
  await db.query("DELETE FROM listings");
  await db.query("DELETE FROM notifications");
  await db.query("DELETE FROM subscriptions");
  await db.query("DELETE FROM users");

  const user1 = await User.register("u1", "password1");
  const user2 = await User.register("u2", "password2");
  const user3 = await User.register("u3", "password3");

  const listing1 = await Listing.create({
    userId: user1.id,
    title: "title1",
    description: "desc1",
    categoryId: 1,
    conditionId: 1,
    locationId: 1,
  });
  const listing2 = await Listing.create({
    userId: user2.id,
    title: "title2",
    description: "desc2",
    categoryId: 2,
    conditionId: 2,
    locationId: 2,
  });
  const listing3 = await Listing.create({
    userId: user3.id,
    title: "title3",
    description: "desc3",
    categoryId: 3,
    conditionId: 3,
    locationId: 3,
  });

  const u1Token = createToken(user1);
  const u2Token = createToken(user2);

  users.push(user1, user2, user3);
  listings.push(listing1, listing2, listing3);
  tokens.push(u1Token, u2Token);
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
  users,
  listings,
  tokens
};
