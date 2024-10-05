const axios = require("axios");

async function getLocation(zip) {
  const response = await axios.get(`http://api.zippopotam.us/us/${zip}`);

  if (!response) throw Error(`Location not found: ${zip}`);

  const place = response.data.places[0];
  const city = place["place name"];
  const state = place["state abbreviation"];
  const latitude = place.latitude;
  const longitude = place.longitude;

  return { city, state, latitude, longitude };
}

module.exports = getLocation;
