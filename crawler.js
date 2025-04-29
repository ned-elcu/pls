/**
 * crawler.js - Site crawler for generating a search index
 * 
 * This Node.js script crawls your website and generates a pre-built search index
 * for Elasticlunr.js to use, improving search performance on your site.
 * 
 * Usage:
 * 1. Install dependencies: npm install puppeteer elasticlunr
 * 2. Run: node crawler.js
 * 3. Upload the generated search-index.json to your server
 */

const puppeteer = require('puppeteer');
const elasticlunr = require('elasticlunr');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const config = {
    startUrl: 'http://yoursite.com/pls/',         // Starting URL to crawl
    sitemapUrl: 'http://yoursite.com/pls/sitemap.xml', // Optional sitemap URL
    maxPages: 100,                                // Maximum pages to crawl
    outputFile: 'search-index.json',              // Output filename
    ignoreUrlPatterns: [                          // URLs to ignore
        /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|rar|doc|docx|xls|xlsx|ppt|pptx|css|js)$/i,
        /\/api\//i, 
        /\/admin\//i
    ],
    // Romanian stopwords
    stopWords: [
        'a', 'acea', 'aceasta', 'această', 'aceea', 'acei', 'aceia', 'acel', 'acela', 'acele', 'acelea', 'acest',
        'acesta', 'aceste', 'acestea', 'aceşti', 'aceştia', 'acolo', 'acord', 'acum', 'ai', 'aia', 'aibă', 'aici',
        'al', 'ala', 'ale', 'alea', 'altceva', 'altcineva', 'am', 'ar', 'are', 'as', 'aş', 'aşa', 'asta', 'astăzi',
        'astea', 'astfel', 'asupra', 'au', 'avea', 'avem', 'aveţi', 'avut', 'azi', 'aș', 'b', 'ba', 'bine', 'bucur',
        'bună', 'c', 'ca', 'care', 'caut', 'ce', 'cel', 'ceva', 'cineva', 'cine', 'cât', 'câţi', 'când', 'cât',
        'către', 'ceea', 'cei', 'celor', 'cine', 'cineva', 'cite', 'cîte', 'cîţi', 'cînd', 'cui', 'cum', 'cumva',
        'curând', 'curînd', 'd', 'da', 'daca', 'dacă', 'dar', 'datorită', 'dată', 'dau', 'de', 'deci', 'deja', 'deoarece'
        // Added others from the main script...
    ]
};

// Track visited URLs
const visitedUrls = new Set();
const pageData = [];
let searchIndex = null;

// Initialize elasticlunr with Romanian configuration
function initializeSearchIndex() {
    // Configure elasticlunr for Romanian
    searchIndex = elasticlunr(function() {
        this.setRef('id');               // document identifier field
        this.addField('title');          // title field with boost of 10
        this.addField('content');        // content field
        this.addField('keywords');       // keywords field with boost of 5
        this.addField('url');            // URL field
        
        // Register Romanian stop words
        this.pipeline.remove(elasticlunr.stopWordFilter);
        this.pipeline.add(createRomanianStopWordFilter(config.stopWords));
        
        // Add Romanian stemmer
        this.pipeline.remove(elasticlunr.stemmer);
        this.pipeline.add(romanianStemmer);
        
        // Set custom tokenizer that handles Romanian diacritics
        this.tokenizer = romanianTokenizer;
    });
    
    return searchIndex;
}

// Define a custom tokenizer for Romanian (handling diacritics)
function romanianTokenizer(str) {
    if (!str) return [];
    
    // Normalize and remove diacritics
    str = normalizeRomanian(str);
    
    // Split on non-alphanumeric characters and convert to lowercase
    let tokens = str.toLowerCase()
        .split(/\W+/)
        .filter(token => token && token.length > 1);
    
    return tokens;
}

// Normalize Romanian text (remove diacritics)
function normalizeRomanian(text) {
    if (!text) return '';
    
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Replace Romanian diacritics
    const diacriticsMap = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ş': 's', 'ț': 't', 'ţ': 't'
    };
    
    return text.replace(/[ăâîșşțţ]/g, match => diacriticsMap[match] || match);
}

// Create custom stop word filter for Romanian
function createRomanianStopWordFilter(stopWords) {
    const stopWordFilter = function(token) {
        if (stopWords.indexOf(token) === -1) {
            return token;
        }
        return null;
    };
    
    return stopWordFilter;
}

// Simple Romanian stemmer
function romanianStemmer(token) {
    if (!token) return token;
    
    // Convert to lowercase and trim
    let word = token.toLowerCase().trim();
    
    // Words shorter than 3 characters are not stemmed
    if (word.length < 3) return word;
    
    // Common Romanian suffixes
    const suffixes = [
        'ilor', 'ului', 'elor', 'iile', 'ilor', 'atia', 'atie', 
        'ații', 'eați', 'ește', 'esc', 'ează', 'ați', 'ate', 'ata',
        'ati', 'ata', 'ând', 'eau', 'eal', 'ele', 'ile', 'ul', 'uri', 
        'eii', 'ii', 'ă', 'a', 'e', 'i', 'u'
    ];
    
    for (let suffix of suffixes) {
        if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
            return word.slice(0, word.length - suffix.length);
        }
    }
    
    return word;
}

// Main crawler function
async function crawlSite() {
    // Initialize search index
    searchIndex = initializeSearchIndex();
    
    // Launch headless browser
    const browser = await puppeteer.launch();
    console.log('Browser launched for crawling');
    
    try {
        // Queue of URLs to visit
        let urlsToVisit = [];
        
        // Check if sitemap exists and use it
        if (config.sitemapUrl) {
            try {
                console.log(`Attempting to load sitemap: ${config.sitemapUrl}`);
                const sitemapUrls = await extractUrlsFromSitemap(browser, config.sitemapUrl);
                console.log(`Found ${sitemapUrls.length} URLs in sitemap`);
                urlsToVisit = [...sitemapUrls];
            } catch (error) {
                console.warn(`Error loading sitemap: ${error.message}`);
                console.log(`Falling back to start URL: ${config.startUrl}`);
                urlsToVisit = [config.startUrl];
            }
        } else {
            urlsToVisit = [config.startUrl];
        }
        
        // Process URLs until queue is empty or max pages reached
        let processedCount = 0;
        
        while (urlsToVisit.length > 0 && processedCount < config.maxPages) {
            const url = urlsToVisit.shift();
            
            // Skip if already visited or matches ignore patterns
            if (visitedUrls.has(url) || shouldIgnoreUrl(url)) {
                continue;
            }
            
            console.log(`Crawling page ${processedCount + 1}/${config.maxPages}: ${url}`);
            
            // Visit the page and extract data
            const result = await processPage(browser, url);
            
            if (result) {
                // Add to visited set
                visitedUrls.add(url);
                processedCount++;
                
                // Add to search index
                const pageInfo = {
                    id: generateId(url),
                    url: url,
                    title: result.title,
                    content: result.content,
                    keywords: result.keywords,
                    type: result.type,
                    excerpt: createExcerpt(result.content, 200)
                };
                
                pageData.push(pageInfo);
                searchIndex.addDoc(pageInfo);
                
                // Add new links to the queue
                for (const newUrl of result.links) {
                    if (!visitedUrls.has(newUrl) && !urlsToVisit.includes(newUrl) && !shouldIgnoreUrl(newUrl)) {
                        urlsToVisit.push(newUrl);
                    }
                }
            }
        }
        
        console.log(`Crawling complete. Processed ${processedCount} pages.`);
    } catch (error) {
        console.error('Error during crawling:', error);
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
    
    // Serialize and save the search index
    saveSearchIndex();
}

// Process a single page
async function processPage(browser, url) {
    const page = await browser.newPage();
    
    try {
        // Set timeout for page load
        await page.setDefaultNavigationTimeout(30000);
        
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Extract page information
        const pageData = await page.evaluate(() => {
            // Extract title
            const title = document.title || '';
            
            // Remove unnecessary elements before getting content
            document.querySelectorAll('script, style, header, footer, nav').forEach(el => el.remove());
            
            // Extract content from main content areas
            const mainContent = document.querySelector('main') || 
                                document.querySelector('.content') || 
                                document.body;
            
            // Get text content
            let content = mainContent ? mainContent.textContent || '' : '';
            
            // Clean up text
            content = content.replace(/\s+/g, ' ').trim();
            
            // Extract meta keywords
            let keywords = [];
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords && metaKeywords.getAttribute('content')) {
                keywords = metaKeywords.getAttribute('content').split(',').map(k => k.trim());
            }
            
            // Extract all links on the page
            const links = Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('#'));
            
            // Determine page type
            let type = 'page';
            
            // Check if URL contains indicators of document
            if (window.location.href.includes('/documente/') || 
                window.location.href.includes('/documents/') || 
                window.location.href.endsWith('.pdf') || 
                window.location.href.endsWith('.doc') || 
                window.location.href.endsWith('.docx')) {
                type = 'document';
            }
            
            // Check page content for clues
            const h1 = document.querySelector('h1')?.textContent || '';
            if (h1.includes('Document') || h1.includes('Regulament') || 
                h1.includes('Hotărâre') || h1.includes('Lege')) {
                type = 'document';
            }
            
            return { title, content, keywords, links, type };
        });
        
        // Filter links to only those on the same domain
        const baseUrl = new URL(url);
        const filteredLinks = pageData.links
            .filter(link => {
                try {
                    const linkUrl = new URL(link);
                    return linkUrl.hostname === baseUrl.hostname;
                } catch (e) {
                    return false;
                }
            });
        
        return {
            title: pageData.title,
            content: pageData.content,
            keywords: pageData.keywords,
            links: filteredLinks,
            type: pageData.type
        };
    } catch (error) {
        console.warn(`Error processing ${url}: ${error.message}`);
        return null;
    } finally {
        await page.close();
    }
}

// Extract URLs from sitemap
async function extractUrlsFromSitemap(browser, sitemapUrl) {
    const page = await browser.newPage();
    
    try {
        await page.goto(sitemapUrl, { waitUntil: 'networkidle2' });
        
        // Extract URLs from sitemap
        const urls = await page.evaluate(() => {
            const urls = [];
            
            // Check if it's an XML sitemap
            const locs = document.querySelectorAll('url loc');
            
            if (locs.length > 0) {
                // XML sitemap
                locs.forEach(loc => {
                    urls.push(loc.textContent);
                });
            } else {
                // HTML sitemap (as fallback)
                document.querySelectorAll('a[href]').forEach(a => {
                    if (a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
                        urls.push(a.href);
                    }
                });
            }
            
            return urls;
        });
        
        return urls;
    } catch (error) {
        console.warn(`Error processing sitemap ${sitemapUrl}: ${error.message}`);
        throw error;
    } finally {
        await page.close();
    }
}

// Check if URL should be ignored
function shouldIgnoreUrl(url) {
    for (const pattern of config.ignoreUrlPatterns) {
        if (pattern.test(url)) {
            return true;
        }
    }
    return false;
}

// Generate a unique ID for a page based on its URL
function generateId(url) {
    try {
        return url.replace(/https?:\/\/[^/]+\//, '')
                 .replace(/\//g, '_')
                 .replace(/\.[^.]+$/, '') || 'home';
    } catch (e) {
        return Math.random().toString(36).substring(2, 10);
    }
}

// Create a text excerpt
function createExcerpt(text, maxLength = 200) {
    if (!text) return '';
    
    // Truncate text and add ellipsis if needed
    if (text.length > maxLength) {
        let excerpt = text.substring(0, maxLength);
        
        // Find last space to avoid cutting words
        const lastSpace = excerpt.lastIndexOf(' ');
        if (lastSpace > 0) {
            excerpt = excerpt.substring(0, lastSpace);
        }
        
        return excerpt + '...';
    }
    
    return text;
}

// Save the search index to a file
function saveSearchIndex() {
    try {
        // Prepare the data to save
        const indexData = {
            // Serialize the elasticlunr index
            index: searchIndex.toJSON(),
            // Include page data for reconstruction
            pages: pageData,
            // Add metadata
            meta: {
                version: '1.0',
                created: new Date().toISOString(),
                pageCount: pageData.length
            }
        };
        
        // Write to file
        fs.writeFileSync(
            path.resolve(config.outputFile),
            JSON.stringify(indexData, null, 2)
        );
        
        console.log(`Search index saved to ${config.outputFile}`);
        console.log(`Indexed ${pageData.length} pages`);
    } catch (error) {
        console.error('Error saving search index:', error);
    }
}

// Execute the crawler
crawlSite().catch(console.error);
