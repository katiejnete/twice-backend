"use strict";

const request = require("supertest");
const app = require("../../app.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  users,
  tokens,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const { v4: uuidv4 } = require("uuid");
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.body).toEqual({
      user: {
        id: `${users[0].id}`,
        username: "u1",
        avatar: expect.any(String),
        zip: null,
        locationId: null,
        contactInfo: null,
        itemsGivenAway: 0,
      },
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app).get(`/users/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /users/all/items-given-away */

describe("GET /users/all/items-given-away", function () {
  test("works", async function () {
    const resp = await request(app).get(`/users/all/items-given-away`);
    expect(resp.body).toEqual({
      itemsGivenAway: 0,
    });
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", function () {
  test("works", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({ colName: "contactInfo", updateVal: "info" })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.body).toEqual({
      user: {
        id: `${users[0].id}`,
        username: "u1",
        avatar: expect.any(String),
        zip: null,
        locationId: null,
        contactInfo: "info",
        itemsGivenAway: 0,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch(`/users/u2`)
      .send({ colName: "username", updateVal: "new" })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth if anon", async function () {
    const resp = await request(app)
      .patch(`/users/u2`)
      .send({ colName: "username", updateVal: "new" });
    expect(resp.statusCode).toEqual(401);
  });
});
