"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../expressError");
const {
  authenticateJWT,
  ensureCorrectUser
} = require("../../middleware/auth");

const { SECRET_KEY } = require("../../config");
const testJwt = jwt.sign({ username: "test", userId: "e9c6f79a-6c87-4b76-9df1-0e07bb7b481f"}, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", userId: "e9c6f79a-6c87-4b76-9df1-0e07bb7b481f"}, "wrong");

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(req.user).toEqual({
        iat: expect.any(Number),
        username: "test",
        userId: "e9c6f79a-6c87-4b76-9df1-0e07bb7b481f"
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureCorrectUser", function () {
  test("works: same user", function () {
    expect.assertions(1);
    const req = { params: { username: "test" }, user: { username: "test", userId: "e9c6f79a-6c87-4b76-9df1-0e07bb7b481f"}  };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("unauth: mismatch", function () {
    expect.assertions(1);
    const req = { params: { username: "wrong" }, user: { username: "test", userId: "e9c6f79a-6c87-4b76-9df1-0e07bb7b481f"}  };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("unauth: if anon", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req, res, next);
  });
});