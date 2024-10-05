function convertJsToSql(str) {
  return str.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function addToSqlQuery({
  latitude = null,
  longitude = null,
  filters,
  sort,
  radius = 16.0934,
}) {
  let whereExpressions = [];
  const queryValues = [];
  let query = "";

  if (latitude && longitude) queryValues.push(latitude, longitude, radius);
  delete filters.radius;

  Object.entries(filters).forEach(([filter, value]) => {
    if (!value) delete filters[filter];
  });

  const amtFilters = Object.keys(filters).length;

  if (amtFilters > 0) {
    Object.keys(filters).forEach((filter) => {
      if (filter === "q" && filters[filter]) {
        queryValues.push(filters[filter]);
        const valueIndex = `$${queryValues.length}`;
        whereExpressions.push(
          `(title ILIKE '%' || ${valueIndex} || ' %' 
          OR title ILIKE '% ' || ${valueIndex} || '%' 
          OR title ILIKE ${valueIndex} || '%' 
          OR title ILIKE ${valueIndex} || ' ' 
          OR title ILIKE '%' || ${valueIndex} 
          OR description ILIKE '%' || ${valueIndex} || ' %' 
          OR description ILIKE '% ' || ${valueIndex} || '%' 
          OR description ILIKE ${valueIndex} || '%' 
          OR description ILIKE ${valueIndex} || ' ')`
        );
      } else {
        queryValues.push(filters[filter]);
        whereExpressions.push(
          `${convertJsToSql(filter)} = $${queryValues.length}`
        );
      }
    });
  }

  const whereClause = whereExpressions.length ? `AND ${whereExpressions.join(" AND ")}` : "";

  if (latitude && longitude) {
    query += ` AND status = 'Available' ${whereClause} ORDER BY `;
  } else {
    query += ` status = 'Available' ${whereClause} ORDER BY `;
  }

  switch (sort) {
    case "best":
      query += latitude && longitude ? "distance ASC, last_modified DESC" : "last_modified DESC";
      break;
    case "recent":
      query += "last_modified DESC";
      break;
    case "closest":
      query += "distance ASC";
      break;
    default:
      query += latitude && longitude ? "distance ASC, last_modified DESC" : "last_modified DESC";
      break;
  }

  return { query, queryValues };
}

module.exports = { convertJsToSql, addToSqlQuery };
