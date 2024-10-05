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

/************************************** GET /conditions */

describe("GET /conditions", function () {
  test("works", async function () {
    const resp = await request(app).get("/conditions");
    expect(resp.body).toEqual({
      conditions: [
        { id: 1, name: "New" },
        { id: 2, name: "Like New" },
        { id: 3, name: "Used" },
        { id: 4, name: "Refurbished" },
        { id: 5, name: "Damaged" },
      ],
    });
  });
});

/************************************** GET /conditions/:name */

describe("GET /conditions/:name", function () {
  test("works", async function () {
    const resp = await request(app).get("/conditions/New");
    expect(resp.body).toEqual({
      condition: { id: 1, name: "New" },
    });
  });

  test("not found for no such category", async function () {
    const resp = await request(app).get("/conditions/None");
    expect(resp.statusCode).toEqual(404);
  });
});
