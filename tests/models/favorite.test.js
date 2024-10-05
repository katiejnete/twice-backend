"use strict";

const { NotFoundError, BadRequestError } = require("../../expressError.js");
const Favorite = require("../../models/favorite.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  userIds,
  listingId,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** get */

describe("duplicateCheck", () => {
  test("returns favorite if exists in db", async () => {
    const favorite = await Favorite.get(userIds[1], listingId[0]);
    expect(favorite.listingId).toBe(listingId[0]);
    expect(favorite.userId).toBe(userIds[1]);
  });

  test("returns undefined if not found", async () => {
    const favorite = await Favorite.get(userIds[2], listingId[0]);
    expect(favorite).toBe(undefined);
  });
});

/************************************** create */

describe("create", () => {
  test("works", async () => {
    const favorite = await Favorite.create(userIds[2], listingId[0]);
    expect(favorite.listingId).toBe(listingId[0]);
    expect(favorite.userId).toBe(userIds[2]);
  });

  test("cannot create favorite again", async () => {
    try {
      await Favorite.create(userIds[1], listingId[0]);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if try to favorite user's own listing", async () => {
    try {
      await Favorite.create(userIds[0], listingId[0]);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getUserFavorites */

describe("getUserFavorites", () => {
  test("works", async () => {
    const favorites = await Favorite.getUserFavorites(userIds[1]);
    expect(favorites.length).toBe(1);
    expect(favorites[0]).toBe(listingId[0]);
  });

  test("not found if no favorites", async () => {
    try {
      await Favorite.getUserFavorites(userIds[0]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", () => {
  test("works", async () => {
    await Favorite.remove(userIds[1], listingId[0]);
    const favorite = await Favorite.get(userIds[1], listingId[0]);
    expect(favorite).toBe(undefined);
  });

  test("not found if no favorites", async () => {
    try {
      await Favorite.remove(userIds[1], listingId[0]);
      await Favorite.remove(userIds[1], listingId[0]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
