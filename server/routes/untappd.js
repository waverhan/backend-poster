import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
router.get('/beer/:beerId', async (req, res) => {
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
router.get('/beer/:beerId/reviews', async (req, res) => {
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
router.get('/search', async (req, res) => {
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
router.get('/status', (req, res) => {
  res.json({
    available: true,
    service: 'Untappd Web Scraper',
    version: '1.0.0',
    note: 'This service scrapes public Untappd data without requiring API keys'
  });
});

// Database Management Endpoints

// Get all Untappd mappings
router.get('/mappings', async (req, res) => {
  try {
    const mappings = await prisma.untappdMapping.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json({ mappings });
  } catch (error) {
    console.error('Error fetching Untappd mappings:', error);
    res.status(500).json({ error: 'Failed to fetch mappings' });
  }
});

// Create or update Untappd mapping
router.post('/mappings', async (req, res) => {
  try {
    const { product_id, untappd_beer_id, untappd_url, auto_sync_enabled = true } = req.body;

    if (!product_id || !untappd_beer_id) {
      return res.status(400).json({ error: 'product_id and untappd_beer_id are required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update mapping
    const mapping = await prisma.untappdMapping.upsert({
      where: { product_id },
      update: {
        untappd_beer_id: parseInt(untappd_beer_id),
        untappd_url,
        auto_sync_enabled,
        last_synced: new Date()
      },
      create: {
        product_id,
        untappd_beer_id: parseInt(untappd_beer_id),
        untappd_url,
        auto_sync_enabled
      },
      include: {
        product: {
          select: {
            name: true,
            display_name: true
          }
        }
      }
    });

    res.json({ mapping, message: 'Mapping saved successfully' });
  } catch (error) {
    console.error('Error saving Untappd mapping:', error);
    res.status(500).json({ error: 'Failed to save mapping' });
  }
});

// Delete Untappd mapping
router.delete('/mappings/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;

    await prisma.untappdMapping.delete({
      where: { product_id }
    });

    res.json({ message: 'Mapping deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    console.error('Error deleting Untappd mapping:', error);
    res.status(500).json({ error: 'Failed to delete mapping' });
  }
});

// Sync beer information from Untappd to product
router.post('/mappings/:product_id/sync', async (req, res) => {
  try {
    const { product_id } = req.params;

    // Get mapping
    const mapping = await prisma.untappdMapping.findUnique({
      where: { product_id },
      include: { product: true }
    });

    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    // Fetch beer info from Untappd
    const url = `https://untappd.com/b/beer/${mapping.untappd_beer_id}`;
    const html = await makeRequest(url);
    const $ = cheerio.load(html);
    const beerInfo = extractBeerInfo($, mapping.untappd_beer_id.toString());

    if (!beerInfo) {
      return res.status(404).json({ error: 'Beer not found on Untappd' });
    }

    // Update product with beer information
    const updatedProduct = await prisma.product.update({
      where: { id: product_id },
      data: {
        description: beerInfo.beer_description || mapping.product.description,
        // You can add more fields here like ABV, IBU in attributes
        attributes: JSON.stringify({
          ...JSON.parse(mapping.product.attributes || '{}'),
          abv: beerInfo.beer_abv,
          ibu: beerInfo.beer_ibu,
          style: beerInfo.beer_style,
          untappd_rating: beerInfo.rating_score,
          untappd_rating_count: beerInfo.rating_count
        })
      }
    });

    // Update mapping sync time
    await prisma.untappdMapping.update({
      where: { product_id },
      data: { last_synced: new Date() }
    });

    res.json({
      message: 'Product synced successfully',
      product: updatedProduct,
      beer_info: beerInfo
    });
  } catch (error) {
    console.error('Error syncing product with Untappd:', error);
    res.status(500).json({ error: 'Failed to sync product' });
  }
});

export default router;
