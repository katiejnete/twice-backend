"use strict";

const {
  NotFoundError,
  BadRequestError
} = require("../../expressError.js");
const ListingImage = require("../../models/listingImage.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  userIds,
  listingId
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", () => {
  test("works", async () => {
    const listingImage = await ListingImage.create(listingId[0], "2.jpg");
    expect(listingImage.listingId).toBe(listingId[0]);
    expect(listingImage.imageUrl).toBe("2.jpg");
    expect(listingImage.imageOrder).toBe(2);
  });

  test("bad request if max image limit reached", async () => {
    try {
      await ListingImage.create(listingId[0], "2.jpg");
      await ListingImage.create(listingId[0], "3.jpg");
      await ListingImage.create(listingId[0], "4.jpg");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getAllImages */

describe("getAllImages", () => {
  test("works", async () => {
    await ListingImage.create(listingId[0], "2.jpg");
    const images = await ListingImage.getAllImages(listingId[0]);
    expect(images.length).toBe(2);
    expect(images[0].imageUrl).toBe("1.jpg");
    expect(images[0].imageOrder).toBe(1);
    expect(images[1].imageUrl).toBe("2.jpg");
    expect(images[1].imageOrder).toBe(2);
  });

  test("not found if no images for listing", async () => {
    try {
      await ListingImage.getAllImages(userIds[1]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getOneImage */

describe("getOneImage", () => {
  test("works", async () => {
    const listingImage = await ListingImage.getOneImage(listingId[0]);
    expect(listingImage.listingId).toBe(listingId[0]);
    expect(listingImage.imageUrl).toBe("1.jpg");
    expect(listingImage.imageOrder).toBe(1);
  });

  test("not found if no images for listing", async () => {
    try {
      await ListingImage.getAllImages(userIds[1]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", () => {
  test("works", async () => {
    let listingImage = await ListingImage.getOneImage(listingId[0]);
    listingImage = await listingImage.update(2);
    expect(listingImage.listingId).toBe(listingId[0]);
    expect(listingImage.imageUrl).toBe("1.jpg");
    expect(listingImage.imageOrder).toBe(2);
  });

  test("not found if no images for listing", async () => {
    try {
      await ListingImage.getAllImages(userIds[1]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", () => {
  test("works", async () => {
    await ListingImage.getOneImage(listingId[0]);
    const image2 = await ListingImage.create(listingId[0], "2.jpg");
    await ListingImage.create(listingId[0], "3.jpg");
    const images = await image2.remove();
    expect(images.length).toBe(2);
    expect(images[0].imageOrder).toBe(1);
    expect(images[1].imageOrder).toBe(2);
  });

  test("not found if no images for listing", async () => {
    try {
      await ListingImage.getAllImages(userIds[1]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
