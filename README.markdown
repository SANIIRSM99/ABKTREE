# ABK Family Tree

A web application to manage the family tree and funds of the Sultan Abulkhair Shah Welfare Society (Jhang).

## Features
- View and manage family tree with profiles.
- Track funds received and used.
- Export data to CSV and PDF.
- Import profiles via CSV.
- Responsive design for mobile and desktop.

## Project Structure
- `backend/`: Node.js/Express server with MongoDB for data storage.
- `frontend/`: HTML, CSS, and JavaScript for the client-side application.

## Setup
1. **Backend**:
   - Navigate to `backend/`.
   - Install dependencies: `npm install`.
   - Create a `.env` file with `MONGO_URI` (MongoDB Atlas connection string).
   - Start the server: `npm start`.

2. **Frontend**:
   - Place `index.html`, `funds.html`, `style.css`, and `script.js` in the `frontend/` folder.
   - Update `API_URL` in `script.js` to point to your backend URL.

3. **MongoDB**:
   - Sign up for MongoDB Atlas and create a cluster.
   - Add your MongoDB connection string to `backend/.env`.

## Deployment
- **Backend**: Deploy on Render or Heroku.
- **Frontend**: Deploy on Vercel or GitHub Pages.
- Update `API_URL` in `script.js` with the deployed backend URL.

## Usage
- Login with credentials: `Abk`/`bastiabk` or `cpabk`/`985973abk`.
- View and manage profiles in the family tree.
- Add, view, and export funds in `funds.html`.

## Developer
Developed by Sani Hashmi | Mobile: 0311-7323373

© 2025 Sultan Abulkhair Shah Welfare Society (Jhang). All rights reserved.