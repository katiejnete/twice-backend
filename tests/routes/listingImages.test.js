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

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/************************************** POST /listing-images/:username/listings/:id */

describe("POST /listing-images/:username/listings/:id", function () {
  test("works", async function () {
    const resp = await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      listingImage: {
        id: expect.stringMatching(uuidRegex),
        listingId: `${listings[0].id}`,
        imageUrl: "1.jpg",
        imageOrder: 1,
      },
    });
  });

  test("unauth for incorrect user", async function () {
    const resp = await request(app)
      .post(`/listing-images/${users[1].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request for missing data", async function () {
    const resp = await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request for invalid data", async function () {
    const resp = await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "not image" })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request for exceeding image limit", async function () {
    await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /listing-images/listings/:id */

describe("GET /listing-images/listings/:id", function () {
  test("works", async function () {
    await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app).get(
      `/listing-images/listings/${listings[0].id}`
    );
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listingImages: [{
        id: expect.stringMatching(uuidRegex),
        listingId: `${listings[0].id}`,
        imageUrl: "1.jpg",
        imageOrder: 1,
      }]
    });
  });

  test("not found if no listing images", async function () {
    const resp = await request(app).get(
      `/listing-images/listings/${listings[0].id}`
    );
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /listing-images/listings/:id/thumbnail */

describe("GET /listing-images/listings/:id/thumbnail", function () {
  test("works", async function () {
    await request(app)
      .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
      .send({ imageUrl: "1.jpg" })
      .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app).get(
      `/listing-images/listings/${listings[0].id}/thumbnail`
    );
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      listingImage: {
        id: expect.stringMatching(uuidRegex),
        listingId: `${listings[0].id}`,
        imageUrl: "1.jpg",
        imageOrder: 1,
      }
    });
  });

  test("not found if no listing image thumbnail", async function () {
    const resp = await request(app).get(
      `/listing-images/listings/${listings[0].id}/thumbnail`
    );
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /listing-images/:username/listings/:id/:imageOrder */

describe("DELETE /listing-images/:username/listings/:id/:imageOrder", function () {
  test("works", async function () {
    await request(app)
    .post(`/listing-images/${users[0].username}/listings/${listings[0].id}`)
    .send({ imageUrl: "1.jpg" })
    .set("authorization", `Bearer ${tokens[0]}`);
    const resp = await request(app).delete(
      `/listing-images/${users[0].username}/listings/${listings[0].id}/1`
    ).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({});
  });

  test("not found if no listing image at imageOrder", async function () {
    const resp = await request(app).delete(
      `/listing-images/${users[0].username}/listings/${listings[0].id}/1`
    ).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if imageOrder is not int", async function () {
    const resp = await request(app).delete(
      `/listing-images/${users[0].username}/listings/${listings[0].id}/not`
    ).set("authorization", `Bearer ${tokens[0]}`);
    expect(resp.statusCode).toEqual(400);
  });
});
