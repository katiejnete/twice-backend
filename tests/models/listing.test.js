"use strict";

const { NotFoundError } = require("../../expressError.js");
const Listing = require("../../models/listing.js");
const Location = require("../../models/location.js");
const User = require("../../models/user.js");
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

/************************************** create */

describe("create", () => {
  test("works", async () => {
    const listing = await Listing.create({
      userId: userIds[1],
      title: "title",
      description: "desc.",
      categoryId: 2,
      conditionId: 2,
      locationId: 2,
    });
    expect(listing.userId).toBe(userIds[1]);
    expect(listing.title).toBe("title");
    expect(listing.description).toBe("desc.");
    expect(listing.categoryId).toBe(2);
    expect(listing.conditionId).toBe(2);
    expect(listing.locationId).toBe(2);
  });
});

/************************************** findAll */

describe("findAll", () => {
  test("works", async () => {
    await Listing.create({
      userId: userIds[0],
      title: "t2",
      description: "d2",
      categoryId: 3,
      conditionId: 3,
      locationId: 3,
    });
    const listings = await Listing.findAll({
      filters: { conditionId: 3, categoryId: 3 },
    });
    expect(listings.length).toBe(2);
    expect(listings[0].userId).toBe(userIds[0]);
  });

  test("works for anon user", async () => {
    await Listing.create({
      userId: userIds[0],
      title: "t2",
      description: "d2",
      categoryId: 3,
      conditionId: 3,
      locationId: 3,
    });
    const listings = await Listing.findAll({
      filters: { conditionId: 3, categoryId: 3 }
    });
    expect(listings.length).toBe(2);
    expect(listings[0].userId).toBe(userIds[0]);
  });

  test("works with zip code filter", async () => {
    await Listing.create({
      userId: userIds[0],
      title: "t2",
      description: "d2",
      categoryId: 3,
      conditionId: 3,
      locationId: 1,
    });
    const location = await Location.get("90001")
    const listings = await Listing.findAll({
      filters: { conditionId: 3, categoryId: 3, location }
    });
    expect(listings.length).toBe(2);
    expect(listings[0].userId).toBe(userIds[0]);
  });

  test("not found if not found", async () => {
    try {
      await Listing.findAll({ userId: userIds[1], filters: { q: "dne" } });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", () => {
  test("works", async () => {
    const listing = await Listing.get(listingId[0]);
    expect(listing.userId).toBe(userIds[0]);
    expect(listing.title).toBe("title");
    expect(listing.description).toBe("description");
    expect(listing.categoryId).toBe(3);
    expect(listing.conditionId).toBe(3);
    expect(listing.locationId).toBe(1);
    expect(listing.status).toBe("Available");
  });

  test("not found if not found", async () => {
    try {
      await Listing.get(userIds[1]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getAllByUser */

describe("get", () => {
  test("works", async () => {
    const listings = await Listing.getAllByUser("u1");
    expect(listings.length).toBe(1);
    expect(listings[0].userId).toBe(userIds[0]);
    expect(listings[0].title).toBe("title");
    expect(listings[0].description).toBe("description");
    expect(listings[0].categoryId).toBe(3);
    expect(listings[0].conditionId).toBe(3);
    expect(listings[0].locationId).toBe(1);
    expect(listings[0].status).toBe("Available");
  });

  test("not found if not found", async () => {
    try {
      await Listing.getAllByUser("u2");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", () => {
  test("works", async () => {
    let listing = await Listing.get(listingId[0]);
    listing = await listing.update({
      title: "new",
      categoryId: "1",
      conditionId: "1",
    });
    expect(listing.title).toBe("new");
    expect(+listing.categoryId).toBe(1);
    expect(+listing.conditionId).toBe(1);
  });

  test("updates user itemsGivenAway", async () => {
    let listing = await Listing.get(listingId[0]);
    await listing.update({
      status: "Taken",
    });
    const user = await User.get("u1");
    expect(user.itemsGivenAway).toBe(1);
  });
});

/************************************** remove */

describe("remove", () => {
  test("works, not found if removed properly", async () => {
    try {
      let listing = await Listing.get(listingId[0]);
      await listing.remove();
      await Listing.get(listingId[0]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if already removed", async () => {
    try {
      let listing = await Listing.get(listingId[0]);
      await listing.remove();
      await listing.remove();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
