# SkillSwap Backend - Production Deployment Guide

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://your-production-mongodb-uri

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BASE_URL=https://your-backend-domain.com

# Environment
NODE_ENV=production

# Server
PORT=5000
```

## Production Scripts

```bash
# Install dependencies
npm install --production

# Start production server
npm run prod

# Or use PM2 for process management
pm2 start server.js --name skillswap-backend
```

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Request size limits (10MB)
- JWT token validation
- Secure cookie settings

## Performance Optimizations

- Compression middleware
- Database connection pooling
- Socket.IO optimization
- Error handling improvements
- Removed console logs

## Monitoring

- Health check endpoint: `/health`
- Graceful shutdown handling
- Database connection monitoring
- Error logging (production-safe)

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure MongoDB with SSL
- [ ] Set up reverse proxy (nginx)
- [ ] Configure SSL certificates
- [ ] Set up monitoring/logging
- [ ] Test all endpoints
- [ ] Verify Socket.IO connections
- [ ] Check file upload limits 