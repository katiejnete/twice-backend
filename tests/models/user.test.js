"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../../expressError.js");
const User = require("../../models/user.js");
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

/************************************** duplicateCheck */

describe("duplicateCheck", () => {
  test("bad request if duplicate user", async () => {
    try {
      await User.duplicateCheck("u1");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** authenticate */

describe("authenticate", () => {
  test("works", async () => {
    const user = await User.authenticate("u1", "password1");
    expect(user.username).toBe("u1");
    expect(user.avatar).toBe("./static/default-profile-pic.jpg");
    expect(user.locationId).toBe(1);
    expect(user.itemsGivenAway).toBe(0);
  });

  test("unauthorized if no such user", async () => {
    try {
      await User.authenticate("none", "wrong");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauthorized if wrong password", async () => {
    try {
      await User.authenticate("u1", "wrong");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", () => {
  test("works", async () => {
    const user = await User.register("u4", "password4");
    expect(user.username).toBe("u4");
    expect(user.avatar).toBe("./static/default-profile-pic.jpg");
    expect(user.locationId).toBe(null);
    expect(user.itemsGivenAway).toBe(0);
  });

  test("bad request if duplicate user", async () => {
    try {
      await User.register("u1", "password4");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", () => {
  test("works", async () => {
    const user = await User.get("u1");
    expect(user.username).toBe("u1");
    expect(user.avatar).toBe("./static/default-profile-pic.jpg");
    expect(user.locationId).toBe(1);
    expect(user.itemsGivenAway).toBe(0);
  });

  test("not found if no user", async () => {
    try {
      await User.get("u4");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getTotalItemsGivenAway */

describe("getTotalItemsGivenAway", () => {
  test("works", async () => {
    const totalItemsGivenAway = await User.getTotalItemsGivenAway();
    expect(+totalItemsGivenAway).toEqual(3);
  });
});

/************************************** update */

describe("update", () => {
  test("works: change password", async () => {
    let user = await User.authenticate("u1", "password1");
    user = await user.update({
      colName: "password",
      updateVal: "password0",
      currentVal: "password1",
    });
    user = await User.authenticate("u1", "password0");
    expect(user.username).toBe("u1");
    expect(user.avatar).toBe("./static/default-profile-pic.jpg");
    expect(user.locationId).toBe(1);
    expect(user.itemsGivenAway).toBe(0);
  });

  test("unauthorized if wrong password", async () => {
    try {
      const user = await User.authenticate("u1", "password1");
      await user.update({
        colName: "password",
        updateVal: "password0",
        currentVal: "wrong",
      });
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("works: change location", async () => {
    let user = await User.authenticate("u1", "password1");
    user = await user.update({ colName: "zip", updateVal: "10001" });
    expect(+user.locationId).toBe(2);
  });

  test("works: change contactInfo", async () => {
    let user = await User.authenticate("u1", "password1");
    user = await user.update({ colName: "contactInfo", updateVal: "new info" });
    expect(user.contactInfo).toBe("new info");
  });
});
