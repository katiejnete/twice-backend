# TwiceLoved
A web application designed to facilitate mutual aid by tracking free items available within the user's vicinity. Built using React and Node.js, this platform aims to reduce landfill waste and curb overconsumption by connecting people who have surplus items with those in need.

## Deployed URL
*https://twiceloved-frontend.onrender.com/*

## App Features
In response to the pressing issues of economic challenges and societal overconsumption, I have developed a comprehensive web application that empowers users to share their surplus items with the community. Recognizing the need for a sustainable solution to reduce waste, this platform fosters a sense of community where resources are shared.

- Users can list items they no longer need for others to pick up, creating a circular economy.
- Users can create listings with:
  - Title
  - Description
  - Category
  - Condition
  - Up to 3 images
- Listings can be filtered and sorted based on multiple criteria, including:
  - Category
  - Condition
  - Location
- Users can view item details, including:
  - Up to 3 images per listing
  - Title
  - Description
  - Category
  - Condition
  - Location
  - Last modified date
  - User page link
- Users can save their favorite listings for easy access.
- The app incorporates geolocation features, allowing users to see listing coordinates on a map.

## Future Implementation
- **Pagination**: Implement pagination for listings to improve user navigation.
- **Detailed Analytics Dashboard**: Develop a more comprehensive analytics dashboard with:
  - Statistics on popular items.
  - Detailed insights into community impact.
- **Geolocation Features**: Allow users to see listing coordinate points on a map.
- **Push Notifications**: Enable users to opt in for notifications about new items available nearby.

## App Setup
- Back end:  
  `npm install`  
  `psql`  
  `\i twice-loved.sql`  
  `node twice-loved-seed.js`  
  `npm run dev`  
- Front end:  
  `npm install`  
  `npm run dev`  

## App Testing
  `npm test`
