# SkillSwap Frontend - Production Deployment Guide

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name skillswap-frontend -- start
```

## Performance Optimizations

### Next.js Configuration
- SWC minification enabled
- Compression enabled
- Security headers configured
- Image optimization with Cloudinary
- Bundle analyzer available (`npm run analyze`)

### Code Optimizations
- Removed unnecessary backend dependencies
- API request caching (5-minute cache)
- Memoized route calculations
- Removed console logs
- Optimized component re-renders

### Bundle Size
- Removed unused dependencies
- Tree shaking enabled
- Code splitting by pages
- Optimized imports

## Security Features

- Content Security Policy headers
- XSS protection
- Frame options protection
- Referrer policy
- Secure cookie handling

## Deployment Checklist

- [ ] Set environment variables
- [ ] Configure API URL
- [ ] Build application
- [ ] Set up reverse proxy (nginx)
- [ ] Configure SSL certificates
- [ ] Set up CDN for static assets
- [ ] Test all pages and functionality
- [ ] Verify API connections
- [ ] Check mobile responsiveness
- [ ] Test authentication flow

## Monitoring

- Bundle size analysis: `npm run analyze`
- Performance monitoring
- Error tracking (recommend Sentry)
- User analytics

## Caching Strategy

- Static assets: 30 days
- API responses: 5 minutes (GET requests only)
- Images: Optimized with WebP/AVIF formats
- Fonts: Self-hosted with fallbacks

## SEO Optimization

- Meta tags configured
- Open Graph tags
- Structured data ready
- Sitemap generation
- Robots.txt configuration 