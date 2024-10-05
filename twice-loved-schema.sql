CREATE TABLE
    categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    conditions (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    locations (
        id SERIAL PRIMARY KEY,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        city VARCHAR NOT NULL,
        state VARCHAR NOT NULL,
        zip VARCHAR(5) NOT NULL UNIQUE
    );

CREATE TABLE
    users (
        id UUID PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        password VARCHAR(72) NOT NULL CHECK (LENGTH (password) >= 8),
        avatar VARCHAR NOT NULL DEFAULT './static/default-profile-pic.jpg',
        location_id INT,
        contact_info TEXT,
        items_given_away INT NOT NULL DEFAULT 0,
        FOREIGN KEY (location_id) REFERENCES locations (id)
    );

CREATE TABLE
    listings (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500) NOT NULL,
        category_id INT NOT NULL,
        condition_id INT NOT NULL,
        location_id INT NOT NULL,
        last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR NOT NULL DEFAULT 'Available',
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (condition_id) REFERENCES conditions (id),
        FOREIGN KEY (location_id) REFERENCES locations (id)
    );

CREATE TABLE
    listing_images (
        id UUID PRIMARY KEY,
        listing_id UUID NOT NULL,
        image_url VARCHAR NOT NULL,
        image_order INT NOT NULL,
        FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
    );

CREATE TABLE
    favorites (
        user_id UUID,
        listing_id UUID,
        PRIMARY KEY (user_id, listing_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
    );