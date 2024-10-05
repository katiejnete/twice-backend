"use strict";

const request = require("supertest");

const app = require("../../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /locations */

describe("POST /locations", function () {
  test("works", async function () {
    const maxTries = 5;
    let attempts = 0;
    try {
      while (attempts < maxTries) {
        const resp = await request(app).post("/locations").send({zip: "90002"});
        expect(resp.statusCode).toEqual(201)
        expect(resp.body).toEqual({
          location: {id: expect.any(Number), latitude: expect.any(Number), longitude: expect.any(Number), city: "Los Angeles", state: "CA", zip: "90002"}
        });
        break;
      }
    } catch (err) {
      attempts++;
      if (attempts === maxTries) throw err;
    }
  });

  test("bad request for invalid zip", async function () {
    const resp = await request(app).post("/locations").send({zip: "54321"});
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /locations/:zip */

describe("GET /locations/:zip", function () {
  test("works", async function () {
    const resp = await request(app).get("/locations/90001");
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toEqual({
      location: {id: 1, latitude: expect.any(Number), longitude: expect.any(Number), city: "Los Angeles", state: "CA", zip: "90001"}
    });
  });

  test("not found for no such loaction", async function () {
    const resp = await request(app).post("/locations/54321");
    expect(resp.statusCode).toEqual(404);
  });
});
