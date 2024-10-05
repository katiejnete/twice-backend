"use strict";

const request = require("supertest");

const app = require("../../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  users,
  listings,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /categories */

describe("GET /categories", function () {
  test("works", async function () {
    const resp = await request(app).get("/categories");
    expect(resp.body).toEqual({
      categories: [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Furniture" },
        { id: 3, name: "Clothing" },
        { id: 4, name: "Toys and Games" },
        { id: 5, name: "Books" },
        { id: 6, name: "Home" },
        { id: 7, name: "Sports" },
        { id: 8, name: "Miscellaneous" },
        { id: 9, name: "Health and Beauty" },
      ],
    });
  });
});

/************************************** GET /categories/:name */

describe("GET /categories/:name", function () {
  test("works", async function () {
    const resp = await request(app).get("/categories/Electronics");
    expect(resp.body).toEqual({
      category: {id: 1, name: "Electronics"}
    });
  });

  test("not found for no such category", async function () {
    const resp = await request(app).get("/categories/none");
    expect(resp.statusCode).toEqual(404);
  });
});
