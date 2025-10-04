# Untappd Scraper Deployment Guide

## Quick Start

### Option 1: Railway (Recommended)

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up

2. **Deploy from GitHub**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `backend-scraping` folder as the root directory

3. **Configure Environment**:
   - Railway will automatically detect the Node.js project
   - The service will be available at: `https://your-app-name.up.railway.app`

4. **Update Frontend**:
   ```bash
   # In your frontend .env file
   VITE_BACKEND_URL=https://your-app-name.up.railway.app
   ```

### Option 2: Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   cd backend-scraping
   heroku create your-untappd-scraper
   ```

3. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-untappd-scraper
   git push heroku main
   ```

4. **Update Frontend**:
   ```bash
   # In your frontend .env file
   VITE_BACKEND_URL=https://your-untappd-scraper.herokuapp.com
   ```

### Option 3: Docker + Any Cloud Provider

1. **Build Docker Image**:
   ```bash
   cd backend-scraping
   docker build -t untappd-scraper .
   ```

2. **Run Locally**:
   ```bash
   docker run -p 3001:3001 untappd-scraper
   ```

3. **Deploy to Cloud**:
   - Push to Docker Hub or your cloud provider's container registry
   - Deploy using your cloud provider's container service

### Option 4: Local Development

1. **Install Dependencies**:
   ```bash
   cd backend-scraping
   npm install
   ```

2. **Start Service**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Update Frontend**:
   ```bash
   # In your frontend .env file
   VITE_BACKEND_URL=http://localhost:3001
   ```

## Testing the Deployment

After deployment, test the service:

```bash
# Replace with your deployed URL
curl https://your-service-url.com/api/untappd/status

# Test with Opillia Korifej beer
curl https://your-service-url.com/api/untappd/beer/6371222
```

## Frontend Integration

1. **Update Environment Variable**:
   ```bash
   # In your frontend .env file
   VITE_BACKEND_URL=https://your-deployed-service-url.com
   ```

2. **Rebuild and Deploy Frontend**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Verify Integration**:
   - Go to `/admin` → "Untappd" tab
   - Status should show "Доступний" (Available)
   - Try searching for beer products

## Environment Variables

The scraping service doesn't require any environment variables, but you can optionally set:

```bash
PORT=3001  # Port to run the service (default: 3001)
```

## Monitoring

### Health Check
```bash
curl https://your-service-url.com/health
```

### Service Status
```bash
curl https://your-service-url.com/api/untappd/status
```

## Troubleshooting

### Common Issues

1. **Service Unavailable**:
   - Check if the service is running
   - Verify the URL in `VITE_BACKEND_URL`
   - Check network connectivity

2. **CORS Errors**:
   - The service includes CORS headers
   - Ensure your frontend domain is accessible

3. **Rate Limiting**:
   - The service includes 1-second delays
   - If you get blocked, wait a few minutes

4. **HTML Parsing Errors**:
   - Untappd may change their HTML structure
   - Check the logs for parsing errors
   - May need to update the scraping selectors

### Logs

Check your deployment platform's logs:

- **Railway**: Go to your project → "Deployments" → View logs
- **Heroku**: `heroku logs --tail -a your-app-name`
- **Docker**: `docker logs container-name`

## Performance

- **Response Time**: 1-3 seconds per request (due to rate limiting)
- **Memory Usage**: ~50MB
- **CPU Usage**: Low (mostly I/O bound)

## Legal Considerations

- ✅ **Public Data Only**: Scrapes publicly available information
- ✅ **Rate Limited**: Respectful 1-second delays between requests
- ✅ **No Authentication**: Doesn't access private data
- ⚠️ **Terms of Service**: Ensure compliance with Untappd's ToS
- ⚠️ **Jurisdiction**: Check applicable laws in your region

## Scaling

For high-traffic applications:

1. **Caching**: Add Redis caching for beer information
2. **Queue**: Use job queues for bulk operations
3. **Load Balancing**: Deploy multiple instances
4. **CDN**: Cache static beer images

## Support

If you encounter issues:

1. Check the service logs
2. Verify the beer ID exists on Untappd
3. Test with the included test script
4. Ensure proper network connectivity
