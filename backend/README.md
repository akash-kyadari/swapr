# SkillSwap Backend

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- Passport.js (local & Google OAuth)
- JWT for authentication
- Cloudinary for image uploads

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   BASE_URL=http://localhost:5000
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Features
- Auth (email/password, Google OAuth)
- User profiles
- Skills marketplace
- Skill swap management
- Reviews
- Real-time messaging (Phase 2) 