"use strict";

const { NotFoundError } = require("../../expressError.js");
const Category = require("../../models/category.js");
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
    const categories = await Category.getAll();
    expect(categories.length).toBe(9);
    expect(categories[0].name).toBe("Electronics");
  });
});

/************************************** get */

describe("get", () => {
  test("works", async () => {
    const category = await Category.get("Electronics");
    expect(category.id).toBe(1);
  });

  test("not found if Category not found", async () => {
    try {
      await Category.get("none");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
