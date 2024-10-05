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
  tokens,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /favorites/:username/:listingId */

describe("POST /favorites/:username/:listingId", function () {
  test("works", async function () {
    const resp = await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      favorite: {
        userId: `${users[0].id}`,
        listingId: `${listings[1].id}`,
      },
    });
  });

  test("can't favorite user's own listing", async function () {
    const resp = await request(app)
      .post(`/favorites/${users[0].username}/${listings[0].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("can't favorite already favorited", async function () {
    await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /favorites/:username */

describe("GET /favorites/:username", function () {
  test("works", async function () {
    await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app)
      .get(`/favorites/${users[0].username}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      favorites: [`${listings[1].id}`],
    });
  });

  test("not found if no favorites", async function () {
    const resp = await request(app)
      .get(`/favorites/${users[0].username}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /favorites/:username/:listingId */

describe("GET /favorites/:username", function () {
  test("works", async function () {
    await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app)
      .get(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      favorite: {
        userId: `${users[0].id}`,
        listingId: `${listings[1].id}`,
      },
    });
  });

  test("not found if no favorite", async function () {
    const resp = await request(app)
      .get(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /favorites/:username/:listingId */

describe("DELETE /favorites/:username/:listingId", function () {
  test("works", async function () {
    await request(app)
      .post(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app)
      .delete(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
      expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      deleted: `${listings[1].id}`,
    });
  });

  test("not found if no favorite", async function () {
    const resp = await request(app)
      .get(`/favorites/${users[0].username}/${listings[1].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(404);
  });
});
