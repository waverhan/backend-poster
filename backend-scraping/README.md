# Untappd Web Scraper Service

A Node.js service that scrapes public Untappd data without requiring API keys. This service provides beer information and reviews by parsing Untappd's public web pages.

## Features

- 🍺 **Beer Information**: Get detailed beer info including ABV, IBU, style, description, and ratings
- 📝 **Beer Reviews**: Fetch user reviews and comments for any beer
- 🔍 **Beer Search**: Search for beers by name and brewery
- 🚫 **No API Keys Required**: Works by scraping public Untappd pages
- ⚡ **Rate Limited**: Respectful 1-second delays between requests
- 🛡️ **Error Handling**: Robust error handling and validation

## Installation

1. Navigate to the backend-scraping directory:
```bash
cd backend-scraping
```

2. Install dependencies:
```bash
npm install
```

3. Start the service:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The service will run on `http://localhost:3001`

## API Endpoints

### Get Beer Information
```
GET /api/untappd/beer/:beerId
```

Example:
```bash
curl http://localhost:3001/api/untappd/beer/6371222
```

Response:
```json
{
  "beer": {
    "beer_id": 6371222,
    "beer_name": "Опілля Коріфей нефільтроване",
    "beer_description": "Description of the beer...",
    "beer_abv": 4.2,
    "beer_ibu": 15,
    "beer_style": "Wheat Beer",
    "brewery_name": "Опілля",
    "rating_score": 3.5,
    "rating_count": 150,
    "beer_label": "https://...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Beer Reviews
```
GET /api/untappd/beer/:beerId/reviews?limit=25
```

Example:
```bash
curl http://localhost:3001/api/untappd/beer/6371222/reviews?limit=5
```

Response:
```json
{
  "reviews": [
    {
      "checkin_id": 1,
      "user_name": "John Doe",
      "user_avatar": "https://...",
      "rating_score": 4.0,
      "checkin_comment": "Great beer! Really enjoyed it...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "beer_name": "",
      "brewery_name": ""
    }
  ]
}
```

### Search Beers
```
GET /api/untappd/search?q=search_term
```

Example:
```bash
curl http://localhost:3001/api/untappd/search?q=Opillia
```

Response:
```json
{
  "beers": [
    {
      "beer_id": 6371222,
      "beer_name": "Опілля Коріфей нефільтроване",
      "beer_description": "",
      "beer_abv": 0,
      "beer_ibu": 0,
      "beer_style": "Wheat Beer",
      "brewery_name": "Опілля",
      "rating_score": 0,
      "rating_count": 0,
      "beer_label": "https://..."
    }
  ]
}
```

### Service Status
```
GET /api/untappd/status
```

Response:
```json
{
  "available": true,
  "service": "Untappd Web Scraper",
  "version": "1.0.0",
  "note": "This service scrapes public Untappd data without requiring API keys"
}
```

## Testing

Run the test script to verify the service works:

```bash
npm test
```

This will test all endpoints with the Opillia Korifej beer (ID: 6371222).

## Integration with Frontend

Update your frontend environment variables:

```bash
# In your frontend .env file
VITE_BACKEND_URL=http://localhost:3001
```

The frontend `untappdService.ts` has been updated to use this scraping service instead of the official API.

## Deployment

### Local Development
```bash
npm start
```

### Production (Railway/Heroku/etc.)
1. Deploy this folder as a separate service
2. Set the `PORT` environment variable
3. Update your frontend `VITE_BACKEND_URL` to point to the deployed service

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Rate Limiting & Ethics

- ⏱️ **1-second delay** between requests to be respectful
- 🤖 **Proper User-Agent** to identify as a browser
- 📊 **Public data only** - no private or authenticated content
- 🚫 **No aggressive scraping** - reasonable request limits

## Limitations

- **Rate Limited**: Slower than official API due to respectful delays
- **HTML Dependent**: May break if Untappd changes their HTML structure
- **Public Data Only**: Can only access publicly visible information
- **No Authentication**: Cannot access user-specific or private data

## Error Handling

The service includes comprehensive error handling:
- Invalid beer IDs return 400 Bad Request
- Missing beers return 404 Not Found
- Network errors return 500 Internal Server Error
- All errors include descriptive messages

## Legal Notice

This service scrapes publicly available data from Untappd. Please ensure compliance with:
- Untappd's Terms of Service
- Applicable laws in your jurisdiction
- Respectful usage patterns

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify the beer ID exists on Untappd
3. Ensure proper network connectivity
4. Test with the included test script
