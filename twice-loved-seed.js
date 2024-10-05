const { Client } = require("pg");
const { faker } = require("@faker-js/faker");
const axios = require("axios");

const client = new Client({
  user: "kate",
  host: "localhost",
  database: "twiceloved",
  port: 5432,
});

async function populateData() {
  try {
    await client.connect();
    let zip, response, city, state, latitude, longitude;

    // Populate locations
    for (let i = 0; i < 20; i++) {
      try {
        zip = faker.location.zipCode().slice(0, 5);
        response = await axios.get(`http://api.zippopotam.us/us/${zip}`);
      } catch (error) {
        console.log(`Location not found: ${zip}`);
        i--;
        continue;
      }

      const place = response.data.places[0];
      city = place["place name"];
      state = place["state abbreviation"];
      latitude = place.latitude;
      longitude = place.longitude;

      await client.query(
        `INSERT INTO locations (latitude, longitude, city, state, zip) VALUES ($1, $2, $3, $4, $5)`,
        [latitude, longitude, city, state, zip]
      );
    }

    // Populate categories
    const categories = [
      "Electronics",
      "Furniture",
      "Clothing",
      "Toys and Games",
      "Books",
      "Home",
      "Sports",
      "Miscellaneous",
      "Health and Beauty",
    ];
    for (let i = 0; i < categories.length; i++) {
      await client.query(`INSERT INTO categories (id, name) VALUES ($1, $2)`, [
        i + 1,
        categories[i],
      ]);
    }

    // Populate conditions
    const conditions = ["New", "Like New", "Used", "Refurbished", "Damaged"];
    for (let i = 0; i < conditions.length; i++) {
      await client.query(`INSERT INTO conditions (id, name) VALUES ($1, $2)`, [
        i + 1,
        conditions[i],
      ]);
    }

    // Populate users and listings
    const avatarBaseUrl = "https://randomuser.me/api/portraits";
    const avatarType = ["lego", "men", "women"];
    for (let i = 0; i < 100; i++) {
      const avatarTypeIdx = Math.floor(Math.random() * 3);
      const avatarId =
        avatarTypeIdx === 0
          ? Math.floor(Math.random() * 9) + 1
          : Math.floor(Math.random() * 100) + 1;
      const userId = faker.string.uuid();
      const username = faker.internet.userName();
      const password = faker.internet.password();
      const locationId = Math.floor(Math.random() * 20) + 1;
      const contactInfo = faker.internet.email();
      const avatar = `${avatarBaseUrl}/${avatarType[avatarTypeIdx]}/${avatarId}.jpg`;

      await client.query(
        `INSERT INTO users (id, username, password, avatar, location_id, contact_info) VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, username, password, avatar, locationId, contactInfo]
      );

      if (Math.random() > 0.5) {
        const title = faker.commerce.productName();
        const categoryId = Math.floor(Math.random() * 9) + 1;
        const description = faker.commerce.productDescription();
        const conditionId = Math.floor(Math.random() * 5) + 1;
        const locationId = Math.floor(Math.random() * 20) + 1;
        const listingId = faker.string.uuid();

        await client.query(
          `INSERT INTO listings (id, user_id, title, description, category_id, condition_id, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            listingId,
            userId,
            title,
            description,
            categoryId,
            conditionId,
            locationId,
          ]
        );

        for (let i = 0; i < 3; i++) {
          const imageUrl = `https://picsum.photos/200/300?random=${Math.random()}`;
          await client.query(
            `INSERT INTO listing_images (id, listing_id, image_url, image_order) VALUES ($1, $2, $3, $4)`,
            [faker.string.uuid(), listingId, imageUrl, i + 1]
          );
        }
      }
    }

    console.log("Data populated successfully!");
  } catch (error) {
    console.error("Error populating data:", error);
  } finally {
    await client.end();
  }
}

populateData();
