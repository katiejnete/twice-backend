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

const { v4: uuidv4 } = require('uuid');
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/************************************** POST /listings/:username */

describe("POST /listings/:username", function () {
  test("works", async function () {
    const resp = await request(app)
      .post(`/listings/${users[0].username}`)
      .send({
        title: "title2",
        description: "desc2",
        categoryId: 2,
        conditionId: 2,
        locationId: 2,
      })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      listing: {
        id: expect.stringMatching(uuidRegex),
        userId: `${users[0].id}`,
        title: "title2",
        description: "desc2",
        categoryId: 2,
        conditionId: 2,
        locationId: 2,
        city: null,
        state: null,
        lastModified: expect.any(String),
        status: "Available",
        username: null
      },
    });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app)
      .post(`/listings/${users[0].username}`)
      .send({
        title: "title2",
        description: "desc2",
        categoryId: 2,
        conditionId: 2,
        locationId: 2,
      })
      .set("authorization", `Bearer ${tokens[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request for missing data", async function () {
    const resp = await request(app)
      .post(`/listings/${users[0].username}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request for invalid data", async function () {
    const resp = await request(app)
      .post(`/listings/${users[0].username}`)
      .send({
        title: "title2",
        description: "desc2",
        categoryId: "not",
        conditionId: "not",
        locationId: "not",
      })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /listings/users/:username */

describe("GET /listings/users/:username", function () {
  test("works", async function () {
    const resp = await request(app).get(`/listings/users/${users[0].username}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listings: [
        {
          id: `${listings[0].id}`,
          userId: `${users[0].id}`,
          title: "title1",
          description: "desc1",
          categoryId: 1,
          conditionId: 1,
          locationId: 1,
          city: "Los Angeles",
          state: "CA",
          lastModified: expect.any(String),
          status: "Available",
          username: null,
          listingImages: []
        },
      ],
    });
  });

  test("not found if no listings", async function () {
    const resp = await request(app).get(`/listings/users/none`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /listings */

describe("GET /listings", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/listings`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listings: [
        {
          id: `${listings[2].id}`,
          userId: `${users[2].id}`,
          title: "title3",
          description: "desc3",
          categoryId: 3,
          conditionId: 3,
          locationId: 3,
          city: "Santa Cruz",
          state: "CA",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
        {
          id: `${listings[1].id}`,
          userId: `${users[1].id}`,
          title: "title2",
          description: "desc2",
          categoryId: 2,
          conditionId: 2,
          locationId: 2,
          city: "New York City",
          state: "NY",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
        {
          id: `${listings[0].id}`,
          userId: `${users[0].id}`,
          title: "title1",
          description: "desc1",
          categoryId: 1,
          conditionId: 1,
          locationId: 1,
          city: "Los Angeles",
          state: "CA",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
      ],
    });
  });

  test("works filtering on all filters", async function () {
    const resp = await request(app)
      .get(`/listings`)
      .query({ q: "title1", category:"Electronics", condition:"New" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listings: [
        {
          id: `${listings[0].id}`,
          userId: `${users[0].id}`,
          title: "title1",
          description: "desc1",
          categoryId: 1,
          conditionId: 1,
          locationId: 1,
          city: "Los Angeles",
          state: "CA",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
      ],
    });
  });

  test("works filtering on one filter category", async function () {
    const resp = await request(app).get(`/listings`).query({ category:"Furniture" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listings: [
        {
          id: `${listings[1].id}`,
          userId: `${users[1].id}`,
          title: "title2",
          description: "desc2",
          categoryId: 2,
          conditionId: 2,
          locationId: 2,
          city: "New York City",
          state: "NY",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
      ],
    });
  });

  test("works filtering on one filter zip", async function () {
    const resp = await request(app).get(`/listings`).query({ zip:"10001" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listings: [
        {
          id: `${listings[1].id}`,
          userId: `${users[1].id}`,
          title: "title2",
          description: "desc2",
          categoryId: 2,
          conditionId: 2,
          locationId: 2,
          city: "New York City",
          state: "NY",
          lastModified: expect.any(String),
          status: "Available",
          listingImages: [],
          username: null
        },
      ],
    });
  });

  test("not found if no listings", async function () {
    const resp = await request(app).get(`/listings`).query({ q: "none" });
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /listings/:id */

describe("GET /listings/:id", function () {
  test("works", async function () {
    const resp = await request(app).get(`/listings/${listings[0].id}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listing: {
        id: `${listings[0].id}`,
        userId: `${users[0].id}`,
        title: "title1",
        description: "desc1",
        categoryId: 1,
        conditionId: 1,
        locationId: 1,
        city: "Los Angeles",
        state: "CA",
        lastModified: expect.any(String),
        status: "Available",
        username: "u1"
      },
    });
  });

  test("not found if no listings", async function () {
    const resp = await request(app).get(`/listings/${uuidv4()}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /listings/:username/:id */

describe("PATCH /listings/:username/:id", function () {
  test("works", async function () {
    const resp = await request(app).patch(`/listings/${users[0].username}/${listings[0].id}`)
    .send({title: "new"}).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listing: {
        id: `${listings[0].id}`,
        userId: `${users[0].id}`,
        title: "new",
        description: "desc1",
        categoryId: 1,
        conditionId: 1,
        locationId: 1,
        city: "Los Angeles",
        state: "CA",
        lastModified: expect.any(String),
        status: "Available",
        username: "u1"
      },
    });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app).patch(`/listings/${users[0].username}/${listings[0].id}`)
    .send({title: "new"}).set("authorization", `Bearer ${tokens[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon user", async function () {
    const resp = await request(app).patch(`/listings/${users[0].username}/${listings[0].id}`)
    .send({title: "new"});
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such listing", async function () {
    const resp = await request(app).patch(`/listings/${users[0].username}/${uuidv4()}`)
    .send({title: "new"}).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app).patch(`/listings/${users[0].username}/${uuidv4()}`)
    .send({categoryId: "not int"}).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /listings/:username/:id */

describe("DELETE /listings/:username/:id", function () {
    test("works", async function () {
      const resp = await request(app).delete(`/listings/${users[0].username}/${listings[0].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        deleted: `${listings[0].id}`
      });
    });
  
    test("not found for no such listing", async function () {
      const resp = await request(app).delete(`/listings/${users[0].username}/${uuidv4()}`)
      .set("authorization", `Bearer ${tokens[0]}`);
      expect(resp.statusCode).toEqual(404);
    });
  });