"use strict";

const jwt = require("jsonwebtoken");
const { createToken } = require("../../helpers/tokens");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("createToken", function () {
  test("works", async function () {
      const user = await User.get("u1");
    const token = createToken(user);
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "u1",
      userId: expect.any(String),
    });
  });
});