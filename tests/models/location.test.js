"use strict";

const { NotFoundError, BadRequestError } = require("../../expressError.js");
const Location = require("../../models/location.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** duplicateCheck */

describe("duplicateCheck", () => {
  test("bad request if location exists", async () => {
    try {
      await Location.duplicateCheck("90001");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** create */

describe("create", () => {
  test("works", async () => {
    const maxTries = 5;
    let attempts = 0;
    try {
      while (attempts < maxTries) {
        const location = await Location.create("90002");
        expect(location.city).toBe("Los Angeles");
        expect(location.state).toBe("CA");
        expect(location.zip).toBe("90002");
        break;
      }
    } catch (err) {
      attempts++;
      if (attempts === maxTries) throw err;
    }
  });

  test("bad request if location exists on db", async () => {
    try {
      await Location.create("90001");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if zip code is not real", async () => {
    try {
      await Location.create("42708");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", () => {
  test("works", async () => {
    const location = await Location.get("90001");
    expect(location.city).toBe("Los Angeles");
    expect(location.state).toBe("CA");
    expect(location.zip).toBe("90001");
  });

  test("not found if zip is not on db", async () => {
    try {
      await Location.get("91803");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
