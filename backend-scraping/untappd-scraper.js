const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// User agent to mimic a real browser
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Rate limiting to be respectful
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make requests with proper headers
async function makeRequest(url) {
  try {
    await delay(1000); // 1 second delay between requests
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

// Extract beer information from Untappd beer page
function extractBeerInfo($, beerId) {
  try {
    const beerName = $('.beer-name').text().trim() || $('h1').first().text().trim();
    const breweryName = $('.brewery-name').text().trim() || $('.brewery a').text().trim();
    const beerStyle = $('.beer-style').text().trim() || $('.style').text().trim();
    
    // Extract ABV and IBU
    let abv = 0;
    let ibu = 0;
    
    $('.beer-details .details').each((i, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('abv')) {
        const abvMatch = text.match(/(\d+\.?\d*)%?\s*abv/);
        if (abvMatch) abv = parseFloat(abvMatch[1]);
      }
      if (text.includes('ibu')) {
        const ibuMatch = text.match(/(\d+)\s*ibu/);
        if (ibuMatch) ibu = parseInt(ibuMatch[1]);
      }
    });
    
    // Extract rating
    const ratingText = $('.rating-score').text().trim() || $('.caps').text().trim();
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    
    // Extract rating count
    const ratingCountText = $('.rating-count').text().trim() || $('.raters').text().trim();
    const ratingCountMatch = ratingCountText.match(/(\d+)/);
    const ratingCount = ratingCountMatch ? parseInt(ratingCountMatch[1]) : 0;
    
    // Extract description
    const description = $('.beer-description').text().trim() || $('.beer-info .description').text().trim();
    
    // Extract beer label image
    const beerLabel = $('.beer-label img').attr('src') || $('.label img').attr('src') || '';
    
    return {
      beer_id: parseInt(beerId),
      beer_name: beerName,
      beer_description: description,
      beer_abv: abv,
      beer_ibu: ibu,
      beer_style: beerStyle,
      brewery_name: breweryName,
      rating_score: rating,
      rating_count: ratingCount,
      beer_label: beerLabel,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting beer info:', error);
    return null;
  }
}

// Extract reviews from Untappd beer page
function extractReviews($) {
  const reviews = [];
  
  try {
    $('.checkin-item, .activity-item').each((i, el) => {
      const $item = $(el);
      
      // Extract user info
      const userName = $item.find('.user-name').text().trim() || 
                      $item.find('.username').text().trim() || 
                      $item.find('a[href*="/user/"]').text().trim() || 
                      'Anonymous';
      
      const userAvatar = $item.find('.user-avatar img').attr('src') || 
                        $item.find('.avatar img').attr('src') || '';
      
      // Extract rating
      const ratingElement = $item.find('.rating-score, .caps');
      let rating = 0;
      if (ratingElement.length) {
        const ratingText = ratingElement.text().trim();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) rating = parseFloat(ratingMatch[1]);
      }
      
      // Extract comment
      const comment = $item.find('.checkin-comment').text().trim() || 
                     $item.find('.comment-text').text().trim() || 
                     $item.find('.activity-comment').text().trim();
      
      // Extract date
      const dateElement = $item.find('.checkin-date, .date');
      const createdAt = dateElement.length ? dateElement.attr('title') || dateElement.text().trim() : '';
      
      // Only include reviews with comments
      if (comment && comment.length > 10) {
        reviews.push({
          checkin_id: i + 1,
          user_name: userName,
          user_avatar: userAvatar,
          rating_score: rating,
          checkin_comment: comment,
          created_at: createdAt || new Date().toISOString(),
          beer_name: '',
          brewery_name: ''
        });
      }
    });
  } catch (error) {
    console.error('Error extracting reviews:', error);
  }
  
  return reviews;
}

// API Routes

// Get beer information by ID
app.get('/api/untappd/beer/:beerId', async (req, res) => {
  try {
    const { beerId } = req.params;
    
    if (!beerId || !/^\d+$/.test(beerId)) {
      return res.status(400).json({ error: 'Invalid beer ID' });
    }
    
    const url = `https://untappd.com/b/beer/${beerId}`;
    console.log(`Fetching beer info from: ${url}`);
    
    const html = await makeRequest(url);
    const $ = cheerio.load(html);
    
    const beerInfo = extractBeerInfo($, beerId);
    
    if (!beerInfo || !beerInfo.beer_name) {
      return res.status(404).json({ error: 'Beer not found' });
    }
    
    res.json({ beer: beerInfo });
  } catch (error) {
    console.error('Error fetching beer info:', error);
    res.status(500).json({ error: 'Failed to fetch beer information' });
  }
});

// Get beer reviews by ID
app.get('/api/untappd/beer/:beerId/reviews', async (req, res) => {
  try {
    const { beerId } = req.params;
    const limit = parseInt(req.query.limit) || 25;
    
    if (!beerId || !/^\d+$/.test(beerId)) {
      return res.status(400).json({ error: 'Invalid beer ID' });
    }
    
    const url = `https://untappd.com/b/beer/${beerId}`;
    console.log(`Fetching beer reviews from: ${url}`);
    
    const html = await makeRequest(url);
    const $ = cheerio.load(html);
    
    const reviews = extractReviews($);
    const limitedReviews = reviews.slice(0, limit);
    
    res.json({ reviews: limitedReviews });
  } catch (error) {
    console.error('Error fetching beer reviews:', error);
    res.status(500).json({ error: 'Failed to fetch beer reviews' });
  }
});

// Search for beers
app.get('/api/untappd/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const url = `https://untappd.com/search?q=${encodeURIComponent(q)}&type=beer`;
    console.log(`Searching beers: ${url}`);
    
    const html = await makeRequest(url);
    const $ = cheerio.load(html);
    
    const beers = [];
    
    $('.beer-item, .search-item').each((i, el) => {
      const $item = $(el);
      
      // Extract beer URL to get ID
      const beerLink = $item.find('a[href*="/b/"]').attr('href');
      const beerIdMatch = beerLink ? beerLink.match(/\/b\/[^\/]+\/(\d+)/) : null;
      const beerId = beerIdMatch ? parseInt(beerIdMatch[1]) : 0;
      
      if (beerId) {
        const beerName = $item.find('.beer-name').text().trim() || $item.find('h4').text().trim();
        const breweryName = $item.find('.brewery-name').text().trim() || $item.find('.brewery').text().trim();
        const beerStyle = $item.find('.beer-style').text().trim() || $item.find('.style').text().trim();
        const beerLabel = $item.find('img').attr('src') || '';
        
        if (beerName) {
          beers.push({
            beer_id: beerId,
            beer_name: beerName,
            beer_description: '',
            beer_abv: 0,
            beer_ibu: 0,
            beer_style: beerStyle,
            brewery_name: breweryName,
            rating_score: 0,
            rating_count: 0,
            beer_label: beerLabel
          });
        }
      }
    });
    
    res.json({ beers });
  } catch (error) {
    console.error('Error searching beers:', error);
    res.status(500).json({ error: 'Failed to search beers' });
  }
});

// Service status endpoint
app.get('/api/untappd/status', (req, res) => {
  res.json({
    available: true,
    service: 'Untappd Web Scraper',
    version: '1.0.0',
    note: 'This service scrapes public Untappd data without requiring API keys'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Untappd scraping service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Status: http://localhost:${PORT}/api/untappd/status`);
});

module.exports = app;
