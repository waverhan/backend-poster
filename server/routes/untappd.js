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
    // Extract beer name - try multiple selectors
    const beerName = $('h1').first().text().trim() ||
                     $('.beer-name').text().trim() ||
                     $('title').text().split(' | ')[0].trim();

    // Extract brewery name - look for links to brewery pages
    const breweryName = $('a[href*="/brewery/"]').first().text().trim() ||
                        $('a[href*="Opillia"]').first().text().trim() ||
                        $('.brewery-name').text().trim() ||
                        'Unknown Brewery';

    // Extract beer style - look for style information
    const beerStyle = $('.beer-style').text().trim() ||
                      $('*:contains("Lager")').first().text().trim() ||
                      $('*:contains("Ale")').first().text().trim() ||
                      'Unknown Style';

    // Extract ABV - look for pattern like "4.2% ABV"
    let abv = 0;
    const abvElement = $('p.abv');
    if (abvElement.length) {
      const abvText = abvElement.text();
      const abvMatch = abvText.match(/(\d+\.?\d*)\s*%\s*ABV/i);
      if (abvMatch) {
        abv = parseFloat(abvMatch[1]);
      }
    }

    // Extract IBU - look for pattern like "15 IBU"
    let ibu = 0;
    const ibuElement = $('p.ibu');
    if (ibuElement.length) {
      const ibuText = ibuElement.text();
      const ibuMatch = ibuText.match(/(\d+)\s*IBU/i);
      if (ibuMatch) {
        ibu = parseInt(ibuMatch[1]);
      }
    }

    // Extract description - look for beer description
    let description = '';
    const descElement = $('.desc .beer-descrption-read-less');
    if (descElement.length) {
      description = descElement.text().trim();
      // Remove "Show Less" link text
      description = description.replace(/Show Less$/, '').trim();
    } else {
      description = $('.desc').text().trim() || $('.beer-description').text().trim();
    }

    // Extract rating score - look for data-rating attribute
    let rating = 0;
    const ratingElement = $('.caps[data-rating]').first();
    if (ratingElement.length) {
      const ratingValue = ratingElement.attr('data-rating');
      if (ratingValue) {
        rating = parseFloat(ratingValue);
      }
    }

    // Extract rating count - look for "X Ratings" text
    let ratingCount = 0;
    const ratingCountText = $('body').text();
    const ratingCountMatch = ratingCountText.match(/(\d+)\s*Ratings/i);
    if (ratingCountMatch) {
      ratingCount = parseInt(ratingCountMatch[1]);
    }

    // Extract beer label image
    let beerLabel = '';
    const labelImg = $('img[src*="beer_logos"]').first();
    if (labelImg.length) {
      beerLabel = labelImg.attr('src') || '';
      if (beerLabel.startsWith('//')) {
        beerLabel = 'https:' + beerLabel;
      }
    }

    ;

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
    // Look for checkin items with the structure from your HTML
    $('#main-stream .item[id*="checkin_"]').each((i, el) => {
      const $item = $(el);

      // Extract user info - look for user link in the text paragraph
      const userLink = $item.find('.text .user').first();
      const userName = userLink.text().trim() || 'Anonymous';

      // Extract user avatar from avatar-holder
      const userAvatar = $item.find('.avatar-holder img').attr('src') || '';

      // Extract rating from caps with data-rating
      let rating = 0;
      const ratingElement = $item.find('.caps[data-rating]');
      if (ratingElement.length) {
        const ratingValue = ratingElement.attr('data-rating');
        if (ratingValue) {
          rating = parseFloat(ratingValue);
        }
      }

      // Extract comment from comment-text paragraph
      const commentElement = $item.find('.checkin-comment .comment-text');
      const comment = commentElement.text().trim();

      // Extract date from time element with data-gregtime
      const timeElement = $item.find('.time[data-gregtime]');
      let createdAt = new Date().toISOString();
      if (timeElement.length) {
        const gregTime = timeElement.attr('data-gregtime');
        if (gregTime) {
          createdAt = new Date(gregTime).toISOString();
        }
      }

      // Extract checkin ID from the item ID
      const checkinId = $item.attr('id')?.replace('checkin_', '') || (i + 1).toString();

      // Extract beer and brewery info from the text
      const beerLink = $item.find('.text a[href*="/b/"]').first();
      const breweryLink = $item.find('.text a[href*="/"]').last();
      const beerName = beerLink.text().trim() || '';
      const breweryName = breweryLink.text().trim() || '';

      // Only include reviews with meaningful comments and ratings
      if (comment && comment.length > 10 && rating > 0) {
        reviews.push({
          checkin_id: checkinId,
          user_name: userName,
          user_avatar: userAvatar.startsWith('//') ? 'https:' + userAvatar : userAvatar,
          rating_score: rating,
          checkin_comment: comment,
          created_at: createdAt,
          beer_name: beerName,
          brewery_name: breweryName
        });
      }
    });

    ;
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
    ;
    
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
    ;
    
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
    ;
    
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

    // Parse existing attributes
    let existingAttributes = [];
    try {
      const attributesData = mapping.product.attributes;
      if (attributesData) {
        if (typeof attributesData === 'string') {
          const parsed = JSON.parse(attributesData);
          // If it's an array, keep it; if it's an object, convert to array
          if (Array.isArray(parsed)) {
            existingAttributes = parsed;
          } else {
            // Convert object to array format
            existingAttributes = Object.entries(parsed).map(([key, value]) => ({
              name: key,
              value: value.toString(),
              unit: ''
            }));
          }
        } else if (Array.isArray(attributesData)) {
          existingAttributes = attributesData;
        }
      }
    } catch (e) {
      console.error('Error parsing existing attributes:', e);
      existingAttributes = [];
    }

    // Remove existing Untappd attributes to avoid duplicates
    existingAttributes = existingAttributes.filter(attr =>
      !['Міцність', 'Гіркота', 'Стиль', 'ABV', 'IBU', 'Style', 'untappd_rating', 'untappd_rating_count'].includes(attr.name)
    );

    // Only store rating data in attributes (ABV, IBU, and style go in description)
    if (beerInfo.rating_score) {
      existingAttributes.push({
        name: 'untappd_rating',
        value: beerInfo.rating_score.toString(),
        unit: '',
        color: ''
      });
    }

    if (beerInfo.rating_count) {
      existingAttributes.push({
        name: 'untappd_rating_count',
        value: beerInfo.rating_count.toString(),
        unit: '',
        color: ''
      });
    }

    // Prepare description with ABV, IBU, and Untappd description
    const descriptionParts = [];

    // Add ABV if available
    if (beerInfo.beer_abv && parseFloat(beerInfo.beer_abv) > 0) {
      descriptionParts.push(`ABV: ${beerInfo.beer_abv}%`);
    }

    // Add IBU if available
    if (beerInfo.beer_ibu && parseInt(beerInfo.beer_ibu) > 0) {
      descriptionParts.push(`IBU: ${beerInfo.beer_ibu}`);
    }

    // Add Untappd description if available, otherwise keep original
    if (beerInfo.beer_description) {
      descriptionParts.push(beerInfo.beer_description);
    } else if (mapping.product.description) {
      descriptionParts.push(mapping.product.description);
    }

    const fullDescription = descriptionParts.join('\n\n');

    // Update product with beer information
    const updatedProduct = await prisma.product.update({
      where: { id: product_id },
      data: {
        description: fullDescription,
        attributes: JSON.stringify(existingAttributes)
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
