const getLocation = require("../../helpers/locationConverter");

describe("getLocation", function () {
    test("works for zip 91803", async function () {
        const {city} = await getLocation("91803");
        expect(city).toBe("Alhambra");
    });

    test("works for los angeles zip", async function () {
        const {city} = await getLocation("90001");
        expect(city).toBe("Los Angeles");
    });
}); 