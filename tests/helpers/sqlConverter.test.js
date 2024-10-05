const { convertJsToSql, addToSqlQuery } = require("../../helpers/sqlConverter");

describe("convertJsToSql", function () {
  test("works for 1-worded column names", function () {
    const sqlStr = convertJsToSql("name");
    expect(sqlStr).toBe("name");
  });

  test("works for 2-worded column names", function () {
    const sqlStr = convertJsToSql("userId");
    expect(sqlStr).toBe("user_id");
  });
});

describe("addToSqlQuery", function () {
  test("works", function () {
    const { query, queryValues } = addToSqlQuery({
      latitude: 34.0745,
      longitude: -118.1434,
      filters: { q: "drawers", category: 1 },
      sort: "closest",
    });
    expect(query).toEqual(
      ` AND status = 'Available' AND (title ILIKE '%' || $4 || ' %' 
          OR title ILIKE '% ' || $4 || '%' 
          OR title ILIKE $4 || '%' 
          OR title ILIKE $4 || ' ' 
          OR title ILIKE '%' || $4 
          OR description ILIKE '%' || $4 || ' %' 
          OR description ILIKE '% ' || $4 || '%' 
          OR description ILIKE $4 || '%' 
          OR description ILIKE $4 || ' ') AND category = $5 ORDER BY distance ASC`
      );
    expect(queryValues.length).toBe(5);
  });
});
