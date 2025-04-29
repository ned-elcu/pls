/**
 * search.js - Advanced search system using Elasticlunr.js
 * 
 * Features:
 * - Full-text search with Elasticlunr.js
 * - Website crawler for content indexing
 * - Support for Romanian language (diacritics handling, stopwords)
 * - Advanced result ranking and highlighting
 * - Search suggestions and autocomplete
 */

// SiteSearch module using revealing module pattern
const SiteSearch = (function() {
    // Private variables
    let _searchIndex = null;
    let _indexReady = false;
    let _searchCache = new Map();
    let _recentSearches = [];
    let _pagesData = [];
    
    // Search configuration
    const _searchConfig = {
        maxCacheSize: 50,
        maxRecentSearches: 10,
        debounceTime: 300,  // ms
        minQueryLength: 2,
        maxResults: 100,
        defaultPerPage: 10,
        highlightClass: 'search-highlight',
        maxCrawlDepth: 3,   // How deep to crawl links
        maxPages: 100,      // Maximum pages to index
        
        // Romanian stopwords
        stopWords: [
            'a', 'acea', 'aceasta', 'această', 'aceea', 'acei', 'aceia', 'acel', 'acela', 'acele', 'acelea', 'acest',
            'acesta', 'aceste', 'acestea', 'aceşti', 'aceştia', 'acolo', 'acord', 'acum', 'ai', 'aia', 'aibă', 'aici',
            'al', 'ala', 'ale', 'alea', 'altceva', 'altcineva', 'am', 'ar', 'are', 'as', 'aş', 'aşa', 'asta', 'astăzi',
            'astea', 'astfel', 'asupra', 'au', 'avea', 'avem', 'aveţi', 'avut', 'azi', 'aș', 'b', 'ba', 'bine', 'bucur',
            'bună', 'c', 'ca', 'care', 'caut', 'ce', 'cel', 'ceva', 'cineva', 'cine', 'cât', 'câţi', 'când', 'cât',
            'către', 'ceea', 'cei', 'celor', 'cine', 'cineva', 'cite', 'cîte', 'cîţi', 'cînd', 'cui', 'cum', 'cumva',
            'curând', 'curînd', 'd', 'da', 'daca', 'dacă', 'dar', 'datorită', 'dată', 'dau', 'de', 'deci', 'deja', 'deoarece',
            'departe', 'deşi', 'din', 'dinaintea', 'dintr', 'dintre', 'doar', 'doi', 'doilea', 'două', 'drept', 'după', 'dă',
            'e', 'ea', 'ei', 'el', 'ele', 'era', 'este', 'eu', 'eşti', 'f', 'face', 'fata', 'fi', 'fie', 'fiecare', 'fii',
            'fim', 'fiţi', 'fiu', 'fost', 'frumos', 'fără', 'g', 'geaba', 'graţie', 'h', 'hain', 'i', 'ia', 'iar', 'ieri',
            'ii', 'il', 'imi', 'împotriva', 'în', 'înainte', 'înaintea', 'încât', 'încît', 'încotro', 'între', 'întrucât',
            'întrucît', 'îţi', 'j', 'k', 'l', 'la', 'le', 'li', 'lor', 'lui', 'lângă', 'lîngă', 'm', 'ma', 'mai', 'mare',
            'mea', 'mei', 'mele', 'mereu', 'meu', 'mi', 'mie', 'mine', 'mod', 'mult', 'multă', 'mulţi', 'mulţumesc', 'mâine',
            'mîine', 'mă', 'n', 'ne', 'nevoie', 'ni', 'nici', 'nimeni', 'nimeri', 'nimic', 'nişte', 'noastră', 'noastre',
            'noi', 'noroc', 'nostru', 'nouă', 'noştri', 'nu', 'numai', 'o', 'or', 'ori', 'oricare', 'orice', 'oricine',
            'oricum', 'oricând', 'oricît', 'oriunde', 'p', 'pai', 'parca', 'pe', 'pentru', 'peste', 'pic', 'pina', 'plus',
            'poate', 'pot', 'prea', 'prima', 'primul', 'prin', 'printr', 'putini', 'puţin', 'puţina', 'puţină', 'până', 'pînă',
            'r', 'rog', 's', 'sa', 'sale', 'sau', 'se', 'si', 'sint', 'sintem', 'spate', 'spre', 'sub', 'sunt', 'suntem',
            'sunteţi', 'sus', 'sută', 'sînt', 'sîntem', 'sînteţi', 'să', 't', 'tale', 'te', 'timp', 'tine', 'toată', 'toate',
            'toată', 'tocmai', 'tot', 'toti', 'totul', 'totusi', 'totuşi', 'toţi', 'trei', 'treia', 'treilea', 'tu', 'tuturor',
            'tăi', 'tău', 'tîi', 'tîu', 'u', 'ul', 'ule', 'ului', 'un', 'una', 'unde', 'undeva', 'unei', 'uneia', 'unele',
            'uneori', 'unii', 'unor', 'unora', 'unu', 'unui', 'unuia', 'unul', 'v', 'va', 'vi', 'voastră', 'voastre', 'voi',
            'voştri', 'vostru', 'vouă', 'voştri', 'vreme', 'vreo', 'vreun', 'vă', 'x', 'z', 'zece', 'zero', 'zi', 'zice'
        ]
    };
    
    // Singleton pattern
    let _instance = null;
    
    // Register custom Romanian pipeline functions before using them
    if (elasticlunr && elasticlunr.Pipeline) {
        // Create custom stop word filter for Romanian and register it
        const romanianStopWordFilter = function(token) {
            if (_searchConfig.stopWords.indexOf(token) === -1) {
                return token;
            }
            return null;
        };
        elasticlunr.Pipeline.registerFunction(romanianStopWordFilter, 'romanianStopWordFilter');
        
        // Simple Romanian stemmer and register it
        const romanianStemmer = function(token) {
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
        };
        elasticlunr.Pipeline.registerFunction(romanianStemmer, 'romanianStemmer');
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
    
    // Initialize elasticlunr with configuration for Romanian
    function initializeSearchIndex() {
        if (_searchIndex !== null) return _searchIndex;
        
        // Configure elasticlunr for Romanian
        _searchIndex = elasticlunr(function() {
            this.setRef('id');
            this.addField('title');
            this.addField('content');
            this.addField('keywords');
            this.addField('url');
            
            // Use the registered Romanian pipeline functions
            this.pipeline.remove(elasticlunr.stopWordFilter);
            this.pipeline.add(elasticlunr.Pipeline.getRegisteredFunction('romanianStopWordFilter'));
            
            this.pipeline.remove(elasticlunr.stemmer);
            this.pipeline.add(elasticlunr.Pipeline.getRegisteredFunction('romanianStemmer'));
            
            // Set custom tokenizer that handles Romanian diacritics
            this.tokenizer = romanianTokenizer;
        });
        
        return _searchIndex;
    }
    
    // Debounce implementation
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Crawl website and build search index
    async function crawlWebsite() {
        // Initialize search index
        _searchIndex = initializeSearchIndex();
        
        // Set to keep track of visited URLs
        const visitedUrls = new Set();
        
        // Queue to hold URLs to visit
        const urlQueue = [{
            url: window.location.origin,
            depth: 0
        }];
        
        // Process URLs until queue is empty or max pages reached
        while (urlQueue.length > 0 && visitedUrls.size < _searchConfig.maxPages) {
            // Get next URL from queue
            const { url, depth } = urlQueue.shift();
            
            // Skip if already visited
            if (visitedUrls.has(url)) continue;
            
            try {
                console.log(`Crawling [${visitedUrls.size + 1}/${_searchConfig.maxPages}]: ${url}`);
                
                // Mark as visited
                visitedUrls.add(url);
                
                // Fetch and process the page
                const pageData = await fetchAndProcessPage(url);
                if (pageData) {
                    // Add to index
                    _pagesData.push(pageData);
                    _searchIndex.addDoc(pageData);
                    
                    // Add links to queue if not at max depth
                    if (depth < _searchConfig.maxCrawlDepth) {
                        for (const link of pageData.links || []) {
                            if (!visitedUrls.has(link) && 
                                !urlQueue.some(item => item.url === link) && 
                                isSameDomain(link, url)) {
                                urlQueue.push({
                                    url: link,
                                    depth: depth + 1
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error crawling ${url}:`, error);
            }
            
            // Add a small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Website crawling complete. Indexed ${_pagesData.length} pages.`);
        _indexReady = true;
    }
    
    // Check if URL is on the same domain
    function isSameDomain(url, baseUrl) {
        try {
            const urlObj = new URL(url);
            const baseUrlObj = new URL(baseUrl);
            return urlObj.hostname === baseUrlObj.hostname;
        } catch (e) {
            // If URL parsing fails, assume it's a relative URL (same domain)
            return true;
        }
    }
    
    // Fetch and process a page
    async function fetchAndProcessPage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract page information
            const title = doc.querySelector('title')?.textContent || '';
            const content = extractPageContent(doc);
            const keywords = extractMetaKeywords(doc);
            const links = extractLinks(doc, url);
            
            // Create unique ID
            const id = generatePageId(url);
            
            return {
                id,
                url,
                title,
                content,
                keywords,
                links,
                type: determinePageType(url, doc),
                excerpt: createExcerpt(content, 200)
            };
        } catch (error) {
            console.error(`Error processing page ${url}:`, error);
            return null;
        }
    }
    
    // Generate a page ID from URL
    function generatePageId(url) {
        try {
            // Convert URL to a path-like string
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            if (path === '/') path = '/home';
            
            // Clean up the path to make a valid ID
            return path.replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
                       .replace(/[^a-z0-9-_]/gi, '_')  // Replace non-alphanumeric chars
                       .toLowerCase()
                       || 'home';  // Fallback to 'home' if empty
        } catch (e) {
            // If URL parsing fails, generate a random ID
            return 'page_' + Math.random().toString(36).substring(2, 10);
        }
    }
    
    // Extract content from page
    function extractPageContent(doc) {
        // Create a clone to avoid modifying the original document
        const docClone = doc.cloneNode(true);
        
        // Remove script, style, and other non-content elements
        docClone.querySelectorAll('script, style, meta, link, noscript, svg, iframe, header, footer, nav').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        // Extract text from main content areas
        const mainContent = docClone.querySelector('main') || 
                           docClone.querySelector('article') ||
                           docClone.querySelector('.content') || 
                           docClone.querySelector('.main') ||
                           docClone.body;
        
        // Get text content
        let text = mainContent ? mainContent.textContent || '' : '';
        
        // Clean up text
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    // Extract meta keywords
    function extractMetaKeywords(doc) {
        // Try meta keywords
        const metaKeywords = doc.querySelector('meta[name="keywords"]');
        if (metaKeywords && metaKeywords.getAttribute('content')) {
            return metaKeywords.getAttribute('content').split(',').map(k => k.trim());
        }
        
        // Try to extract keywords from headings if no meta keywords
        const keywords = [];
        
        // Extract text from headings
        const headings = doc.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
            const text = heading.textContent.trim();
            if (text) {
                // Split by common separators and filter out short words
                text.split(/[\s,.-]+/)
                    .filter(word => word.length > 3)
                    .forEach(word => keywords.push(word.toLowerCase()));
            }
        });
        
        // Return unique keywords
        return [...new Set(keywords)];
    }
    
    // Extract links from page
    function extractLinks(doc, baseUrl) {
        const links = [];
        const anchors = doc.querySelectorAll('a[href]');
        
        anchors.forEach(anchor => {
            let href = anchor.getAttribute('href');
            
            // Skip empty links, javascript: links, hash links, etc.
            if (!href || href.startsWith('javascript:') || href === '#' || href.startsWith('tel:') || href.startsWith('mailto:')) {
                return;
            }
            
            try {
                // Resolve relative URLs
                const absoluteUrl = new URL(href, baseUrl).href;
                
                // Add if it's an HTML page (skip PDFs, images, etc.)
                if (!absoluteUrl.match(/\.(pdf|jpg|jpeg|png|gif|svg|mp4|webp|css|js|xml|json|zip|rar)$/i)) {
                    links.push(absoluteUrl);
                }
            } catch (e) {
                console.warn(`Invalid URL: ${href}`);
            }
        });
        
        return links;
    }
    
    // Determine page type
    function determinePageType(url, doc) {
        // Check if URL contains indicators of document
        if (url.includes('/documente/') || 
            url.includes('/documents/') || 
            url.includes('/acte/') ||
            url.includes('/formulare/') ||
            url.endsWith('.pdf') || 
            url.endsWith('.doc') || 
            url.endsWith('.docx')) {
            return 'document';
        }
        
        // Check page content for clues
        const h1 = doc.querySelector('h1')?.textContent || '';
        if (h1.includes('Document') || 
            h1.includes('Regulament') || 
            h1.includes('Hotărâre') || 
            h1.includes('Lege') ||
            h1.includes('Formular') ||
            h1.includes('Cerere')) {
            return 'document';
        }
        
        // Look for document indicators in the content
        const content = doc.body.textContent || '';
        if (content.includes('Document oficial') || 
            content.includes('Hotărârea nr.') || 
            content.includes('Legea nr.')) {
            return 'document';
        }
        
        // Default to page
        return 'page';
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
    
    // Search implementation
    async function search(query, options = {}) {
        // Initialize search index if not already done
        if (!_indexReady) {
            await crawlWebsite();
        }
        
        const defaults = {
            page: 1,
            perPage: _searchConfig.defaultPerPage,
            filters: {},
            sortBy: 'relevance'
        };
        
        const searchOptions = { ...defaults, ...options };
        const cacheKey = `${query}|${JSON.stringify(searchOptions)}`;
        
        // Check cache
        if (_searchCache.has(cacheKey)) {
            return _searchCache.get(cacheKey);
        }
        
        // Add to recent searches
        addToRecentSearches(query);
        
        // Empty query check
        if (!query.trim() || query.length < _searchConfig.minQueryLength) {
            return {
                query,
                totalResults: 0,
                currentPage: searchOptions.page,
                totalPages: 0,
                perPage: searchOptions.perPage,
                results: [],
                suggestions: getSearchSuggestions('', 5),
                facets: { type: {} }
            };
        }
        
        try {
            // Normalize query
            const normalizedQuery = normalizeRomanian(query);
            
            // Search configuration
            const config = {
                fields: {
                    title: { boost: 10 },
                    content: { boost: 1 },
                    keywords: { boost: 5 },
                    url: { boost: 2 }
                },
                expand: true,  // Expand query with stemmer
                bool: 'OR'     // Match any term (more results)
            };
            
            // Perform the search
            let searchResults = _searchIndex.search(normalizedQuery, config);
            
            // Map results to page data
            let results = searchResults.map(result => {
                const page = _pagesData.find(p => p.id === result.ref);
                if (!page) return null;
                
                return {
                    ...page,
                    score: result.score,
                    excerpt: generateExcerpt(page.content, normalizedQuery.split(' '), 200)
                };
            }).filter(Boolean);
            
            // Apply filters
            if (searchOptions.filters) {
                for (const [key, value] of Object.entries(searchOptions.filters)) {
                    if (value) {
                        results = results.filter(item => item[key] === value);
                    }
                }
            }
            
            // Sort results
            if (searchOptions.sortBy === 'date' && results[0]?.date) {
                results.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (searchOptions.sortBy === 'title') {
                results.sort((a, b) => a.title.localeCompare(b.title));
            }
            // Default is by score, which is already done by elasticlunr
            
            // Set up pagination
            const totalResults = results.length;
            const totalPages = Math.ceil(totalResults / searchOptions.perPage);
            const startIndex = (searchOptions.page - 1) * searchOptions.perPage;
            const endIndex = Math.min(startIndex + searchOptions.perPage, totalResults);
            
            // Get paginated results
            const paginatedResults = results.slice(startIndex, endIndex);
            
            // Compute facets
            const facets = {
                type: {}
            };
            
            results.forEach(item => {
                if (item.type) {
                    facets.type[item.type] = (facets.type[item.type] || 0) + 1;
                }
            });
            
            // Determine if we have a direct match
            const directMatch = results.length > 0 && results[0].score > 10 
                ? results[0] : null;
            
            // Generate related searches
            const relatedSearches = getRelatedSearches(query, results);
            
            // Generate search suggestions
            const suggestions = getSearchSuggestions(query);
            
            // Final search result object
            const result = {
                query,
                totalResults,
                currentPage: searchOptions.page,
                totalPages,
                perPage: searchOptions.perPage,
                results: paginatedResults,
                directMatch,
                facets,
                relatedSearches,
                suggestions
            };
            
            // Cache the result
            _searchCache.set(cacheKey, result);
            
            // Manage cache size
            if (_searchCache.size > _searchConfig.maxCacheSize) {
                const firstKey = _searchCache.keys().next().value;
                _searchCache.delete(firstKey);
            }
            
            return result;
        } catch (error) {
            console.error('Error performing search:', error);
            
            // Return empty result on error
            return {
                query,
                totalResults: 0,
                currentPage: searchOptions.page,
                totalPages: 0,
                perPage: searchOptions.perPage,
                results: [],
                suggestions: getSearchSuggestions(query, 5),
                error: error.message
            };
        }
    }
    
    // Store recent searches
    function addToRecentSearches(query) {
        if (!query || query.length < 3) return;
        
        // Remove if already exists and add to beginning
        _recentSearches = _recentSearches.filter(item => item !== query);
        _recentSearches.unshift(query);
        
        // Limit size
        if (_recentSearches.length > _searchConfig.maxRecentSearches) {
            _recentSearches = _recentSearches.slice(0, _searchConfig.maxRecentSearches);
        }
        
        // Store in localStorage
        try {
            localStorage.setItem('pls_recent_searches', JSON.stringify(_recentSearches));
        } catch (e) {
            console.warn('Failed to save recent searches to localStorage', e);
        }
    }
    
    // Generate excerpt with search term context
    function generateExcerpt(text, searchTerms, maxLength = 200) {
        if (!text) return '';
        
        // Find first occurrence of any search term
        let bestPos = -1;
        let bestTerm = '';
        
        for (const term of searchTerms) {
            const normalizedText = normalizeRomanian(text.toLowerCase());
            const normalizedTerm = normalizeRomanian(term.toLowerCase());
            const pos = normalizedText.indexOf(normalizedTerm);
            
            if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
                bestPos = pos;
                bestTerm = term;
            }
        }
        
        // If no terms found, use start of text
        if (bestPos === -1) {
            if (text.length > maxLength) {
                return text.substring(0, maxLength) + '...';
            }
            return text;
        }
        
        // Create excerpt around search term
        const contextBefore = Math.floor((maxLength - bestTerm.length) / 2);
        const contextAfter = maxLength - bestTerm.length - contextBefore;
        
        let start = Math.max(0, bestPos - contextBefore);
        let end = Math.min(text.length, bestPos + bestTerm.length + contextAfter);
        
        // Adjust to avoid cutting words
        if (start > 0) {
            const prevSpace = text.lastIndexOf(' ', start);
            if (prevSpace !== -1 && start - prevSpace < 15) {
                start = prevSpace + 1;
            }
        }
        
        if (end < text.length) {
            const nextSpace = text.indexOf(' ', end);
            if (nextSpace !== -1 && nextSpace - end < 15) {
                end = nextSpace;
            }
        }
        
        let excerpt = text.substring(start, end);
        
        // Add ellipsis
        if (start > 0) excerpt = '...' + excerpt;
        if (end < text.length) excerpt = excerpt + '...';
        
        return excerpt;
    }
    
    // Generate search suggestions
    function getSearchSuggestions(query, maxSuggestions = 5) {
        if (!query || query.length < 2) return [];
        
        const normalizedQuery = normalizeRomanian(query.toLowerCase());
        const suggestions = new Set();
        
        // Add recent searches that match
        _recentSearches.forEach(search => {
            if (normalizeRomanian(search.toLowerCase()).includes(normalizedQuery)) {
                suggestions.add(search);
            }
        });
        
        // Add suggestions from page titles
        _pagesData.forEach(page => {
            if (normalizeRomanian(page.title.toLowerCase()).includes(normalizedQuery)) {
                suggestions.add(page.title);
            }
            
            // Add from keywords
            if (page.keywords && Array.isArray(page.keywords)) {
                page.keywords.forEach(keyword => {
                    if (normalizeRomanian(keyword.toLowerCase()).includes(normalizedQuery)) {
                        suggestions.add(keyword);
                    }
                });
            }
        });
        
        return Array.from(suggestions).slice(0, maxSuggestions);
    }
    
    // Generate related searches
    function getRelatedSearches(query, results, maxRelated = 3) {
        if (!query || results.length === 0) return [];
        
        // Extract terms from query
        const queryTerms = normalizeRomanian(query).toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2);
        
        if (queryTerms.length === 0) return [];
        
        // Extract terms from top results
        const termCounts = {};
        
        // Only use top results
        const topResults = results.slice(0, 5);
        
        topResults.forEach(result => {
            // Extract terms from title
            const titleTerms = normalizeRomanian(result.title).toLowerCase()
                .split(/\s+/)
                .filter(term => term.length > 2);
            
            // Count terms not in query
            titleTerms.forEach(term => {
                if (!queryTerms.includes(term)) {
                    termCounts[term] = (termCounts[term] || 0) + 2;
                }
            });
            
            // Extract from content (with lower weight)
            const contentTerms = normalizeRomanian(result.content.substring(0, 1000)).toLowerCase()
                .split(/\s+/)
                .filter(term => term.length > 3);
            
            contentTerms.forEach(term => {
                if (!queryTerms.includes(term)) {
                    termCounts[term] = (termCounts[term] || 0) + 1;
                }
            });
        });
        
        // Sort terms by count
        const topTerms = Object.entries(termCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([term]) => term);
        
        // Create related searches by combining with original query
        const relatedSearches = [];
        
        for (const term of topTerms) {
            if (relatedSearches.length >= maxRelated) break;
            relatedSearches.push(`${query} ${term}`);
        }
        
        return relatedSearches;
    }
    
    // Highlight search terms in text
    function highlightSearchTerms(text, query) {
        if (!text || !query) return text;
        
        // Extract query terms
        const queryTerms = normalizeRomanian(query).toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2)
            .sort((a, b) => b.length - a.length); // Highlight longest terms first
        
        let highlightedText = text;
        
        // Highlight each term
        for (const term of queryTerms) {
            const regex = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span class="${_searchConfig.highlightClass}">$1</span>`);
        }
        
        return highlightedText;
    }
    
    // Initialize
    function init(config = {}) {
        // Return existing instance if already initialized
        if (_instance) return _instance;
        
        // Make sure elasticlunr is available
        if (typeof elasticlunr === 'undefined') {
            console.error('Elasticlunr library not found! Please include elasticlunr.js before initializing SiteSearch.');
            return null;
        }
        
        // Merge configuration
        Object.assign(_searchConfig, config);
        
        // Load recent searches from localStorage
        try {
            const storedSearches = localStorage.getItem('pls_recent_searches');
            if (storedSearches) {
                _recentSearches = JSON.parse(storedSearches);
            }
        } catch (e) {
            console.warn('Failed to load recent searches from localStorage', e);
        }
        
        // Create debounced search function for real-time search
        const debouncedSearch = debounce(search, _searchConfig.debounceTime);
        
        // Create the public API
        _instance = {
            search,
            searchRealTime: debouncedSearch,
            highlightSearchTerms,
            getSearchSuggestions,
            clearSearchCache: () => _searchCache.clear(),
            getRecentSearches: () => [..._recentSearches],
            clearRecentSearches: () => {
                _recentSearches = [];
                localStorage.removeItem('pls_recent_searches');
            },
            isReady: () => _indexReady,
            waitForReady: async () => {
                if (!_indexReady) {
                    await crawlWebsite();
                }
                return _indexReady;
            },
            configure: newConfig => {
                Object.assign(_searchConfig, newConfig);
                return _instance;
            }
        };
        
        return _instance;
    }
    
    // Return public API
    return {
        init
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if elasticlunr is available
    if (typeof elasticlunr === 'undefined') {
        console.error('Elasticlunr library not found! Please include elasticlunr.js before this script.');
        return;
    }
    
    // Initialize the search module
    window.siteSearch = SiteSearch.init();
});

// Global function for navigation - removing other helper functions 
// to avoid conflicts with index.html
window.navigateToPage = function(page) {
    const url = new URL(window.location);
    const query = url.searchParams.get('q') || '';
    const sortBy = url.searchParams.get('sortBy') || 'relevance';
    
    // Update URL parameters
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    
    // Get filters
    const filters = {};
    const typeFilter = url.searchParams.get('type');
    const sectionFilter = url.searchParams.get('section');
    
    if (typeFilter) filters.type = typeFilter;
    if (sectionFilter) filters.section = sectionFilter;
    
    // Execute search with updated page
    if (window.siteSearch) {
        window.siteSearch.search(query, {
            page,
            perPage: 10,
            sortBy,
            filters
        });
    }
};

// Quick search function
window.quickSearch = function(query) {
    if (!query) return;
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('q', query);
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url);
    
    // Perform search
    if (window.siteSearch) {
        window.siteSearch.search(query);
    }
};

// Share result function
window.shareResult = function(url, title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        // Copy to clipboard fallback
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = url;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (window.showToast) {
            window.showToast('content_copy', 'Link copiat', 'Link-ul a fost copiat în clipboard!');
        } else {
            alert('Link-ul a fost copiat în clipboard!');
        }
    }
};
