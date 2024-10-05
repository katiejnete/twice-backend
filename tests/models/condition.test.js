"use strict";

const { NotFoundError } = require("../../expressError.js");
const Condition = require("../../models/condition.js");
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

/************************************** getAll */

describe("getAll", () => {
  test("works", async () => {
    const conditions = await Condition.getAll();
    expect(conditions.length).toBe(5);
    expect(conditions[0].name).toBe("New");
  });
});

/************************************** get */

describe("get", () => {
  test("works", async () => {
    const condition = await Condition.get("New");
    expect(condition.id).toBe(1);
  });

  test("not found if condition not found", async () => {
    try {
      await Condition.get("none");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
