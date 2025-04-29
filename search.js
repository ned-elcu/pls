/**
 * search.js - Advanced search system using Elasticlunr.js
 * 
 * Features:
 * - Full-text search with Elasticlunr.js
 * - Automatic crawling and indexing of all site content
 * - Support for Romanian language (diacritics handling, stopwords)
 * - Advanced result ranking and highlighting
 * - Search suggestions and autocomplete
 * - Cached results
 */

// First, load Elasticlunr library
// Add this script tag to your HTML pages: <script src="https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js"></script>

/**
 * SiteSearch module using revealing module pattern
 */
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
        useServerIndex: true,  // Set to true to load a pre-built index, false to build on client
        indexUrl: '/pls/search-index.json', // URL for the pre-built index
        siteMapUrl: '/pls/sitemap.xml', // URL for the sitemap to use when building the index
        crawlStartUrl: '/pls/', // Starting URL for crawler if not using sitemap
        trackAnalytics: true,
        
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
    
    // Singleton pattern - store the search instance
    let _instance = null;
    
    // Initialize elasticlunr with configuration for Romanian
    function initializeSearchIndex() {
        if (_searchIndex !== null) return _searchIndex;
        
        // Configure elasticlunr for Romanian
        _searchIndex = elasticlunr(function() {
            this.setRef('id');               // document identifier field
            this.addField('title');          // title field with boost of 10
            this.addField('content');        // content field
            this.addField('keywords');       // keywords field with boost of 5
            this.addField('url');            // URL field
            
            // Register Romanian stop words
            this.pipeline.remove(elasticlunr.stopWordFilter);
            this.pipeline.add(createRomanianStopWordFilter(_searchConfig.stopWords));
            
            // Add Romanian stemmer
            this.pipeline.remove(elasticlunr.stemmer);
            this.pipeline.add(romanianStemmer);
            
            // Set custom tokenizer that handles Romanian diacritics
            this.tokenizer = romanianTokenizer;
        });
        
        return _searchIndex;
    }
    
    // Define a custom tokenizer for Romanian (handling diacritics)
    function romanianTokenizer(str) {
        if (!str) return [];
        
        // Normalize and remove diacritics
        str = normalizeRomanian(str);
        
        // Split on non-alphanumeric characters and convert to lowercase
        let tokens = str.toLowerCase()
            .split(/[^\p{L}0-9]+/u)
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
    
    // Debounce implementation
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Load or build the search index
    async function loadSearchIndex() {
        if (_indexReady) return;
        
        try {
            if (_searchConfig.useServerIndex) {
                // Load pre-built index from server
                await loadServerIndex();
            } else {
                // Build index by crawling the site
                await buildSearchIndex();
            }
            
            _indexReady = true;
            console.log('Search index is ready');
        } catch (error) {
            console.error('Error initializing search index:', error);
            
            // Fallback to simple index if loading fails
            buildFallbackIndex();
            _indexReady = true;
        }
    }
    
    // Load the search index from server
    async function loadServerIndex() {
        try {
            const response = await fetch(_searchConfig.indexUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load search index: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.index && data.pages) {
                // Load serialized index into elasticlunr
                _searchIndex = elasticlunr.Index.load(data.index);
                _pagesData = data.pages;
                console.log(`Loaded search index with ${_pagesData.length} pages`);
            } else {
                throw new Error('Invalid search index format');
            }
        } catch (error) {
            console.error('Error loading search index:', error);
            throw error;
        }
    }
    
    // Build search index by crawling the site
    async function buildSearchIndex() {
        // Initialize index
        _searchIndex = initializeSearchIndex();
        
        try {
            // Try to load sitemap
            const pages = await loadSitemap();
            
            // Process each page from the sitemap
            for (const pageUrl of pages) {
                try {
                    await indexPage(pageUrl);
                } catch (error) {
                    console.warn(`Failed to index page ${pageUrl}:`, error);
                }
            }
            
            console.log(`Built search index with ${_pagesData.length} pages`);
        } catch (error) {
            console.error('Error building search index:', error);
            throw error;
        }
    }
    
    // Load sitemap and extract URLs
    async function loadSitemap() {
        try {
            const response = await fetch(_searchConfig.siteMapUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load sitemap: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Extract URLs from sitemap
            const urls = Array.from(xmlDoc.querySelectorAll('url loc')).map(el => el.textContent);
            
            if (urls.length === 0) {
                throw new Error('No URLs found in sitemap');
            }
            
            return urls;
        } catch (error) {
            console.warn('Error loading sitemap:', error);
            
            // Fallback to single starting page
            return [_searchConfig.crawlStartUrl];
        }
    }
    
    // Index a single page
    async function indexPage(url) {
        try {
            // Fetch page content
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract page information
            const title = doc.querySelector('title')?.textContent || '';
            const content = extractPageContent(doc);
            const keywords = extractMetaKeywords(doc);
            
            // Create unique ID
            const id = url.replace(/https?:\/\/[^/]+\//, '').replace(/\//g, '_') || 'home';
            
            // Add to pages data
            const pageData = {
                id,
                url,
                title,
                content,
                keywords,
                type: determinePageType(url, doc),
                excerpt: createExcerpt(content, 200)
            };
            
            _pagesData.push(pageData);
            
            // Add to search index
            _searchIndex.addDoc(pageData);
            
            return pageData;
        } catch (error) {
            console.warn(`Error indexing page ${url}:`, error);
            throw error;
        }
    }
    
    // Extract content from page
    function extractPageContent(doc) {
        // Remove script and style elements
        doc.querySelectorAll('script, style, header, footer, nav').forEach(el => el.remove());
        
        // Extract text from main content areas
        const mainContent = doc.querySelector('main') || doc.querySelector('.content') || doc.body;
        
        // Get all text nodes
        let text = mainContent.textContent || '';
        
        // Clean up text
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    // Extract meta keywords
    function extractMetaKeywords(doc) {
        const metaKeywords = doc.querySelector('meta[name="keywords"]');
        if (metaKeywords && metaKeywords.getAttribute('content')) {
            return metaKeywords.getAttribute('content').split(',').map(k => k.trim());
        }
        return [];
    }
    
    // Determine page type
    function determinePageType(url, doc) {
        // Check if URL contains indicators of document
        if (url.includes('/documente/') || url.includes('/documents/') || 
            url.endsWith('.pdf') || url.endsWith('.doc') || url.endsWith('.docx')) {
            return 'document';
        }
        
        // Check page content for clues
        const h1 = doc.querySelector('h1')?.textContent || '';
        if (h1.includes('Document') || h1.includes('Regulament') || 
            h1.includes('Hotărâre') || h1.includes('Lege')) {
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
    
    // Build fallback search index with basic content
    function buildFallbackIndex() {
        console.log('Building fallback search index');
        
        // Initialize index
        _searchIndex = initializeSearchIndex();
        
        // Add basic pages
        const fallbackPages = [
            {
                id: 'home',
                url: '/pls/',
                title: 'Poliția Locală Slobozia - Pagina principală',
                content: 'Pagina principală a Poliției Locale Slobozia. Informații despre serviciile oferite, noutăți și evenimente recente.',
                keywords: ['politia locala', 'slobozia', 'siguranta publica', 'ordine publica'],
                type: 'page'
            },
            {
                id: 'despre-noi',
                url: '/pls/despre-noi',
                title: 'Despre Noi - Poliția Locală Slobozia',
                content: 'Informații generale despre Poliția Locală Slobozia, istoric, misiune, viziune și valori. Structura organizatorică și principalele atribuții.',
                keywords: ['despre', 'misiune', 'viziune', 'valori', 'structura', 'organizare', 'istoric'],
                type: 'page'
            },
            {
                id: 'acte-normative',
                url: '/pls/acte-normative',
                title: 'Acte Normative - Poliția Locală Slobozia',
                content: 'Documente legale care stau la baza funcționării Poliției Locale Slobozia. Lista include: LEGEA poliției locale nr. 155/2010, H.G. nr. 1332/2010, H.C.L. nr. 84/2008 privind adoptarea unor Regulamente şi Reglementări privind transportul în regim de taxi. H.C.L. nr. 257/2007 privind adoptarea Regulamentului pentru înregistrarea, H.C.L. nr. 111/2008 privind reglementarea unor obligaţii ale operatorilor economici.',
                keywords: ['acte normative', 'legi', 'hotarari', 'regulamente', 'hcl', 'documente', 'legislatie', 'H.C.L. nr. 84/2008', 'H.C.L. nr. 257/2007', 'H.C.L. nr. 111/2008'],
                type: 'page'
            },
            {
                id: 'contact',
                url: '/pls/contact',
                title: 'Contact - Poliția Locală Slobozia',
                content: 'Date de contact ale Poliției Locale Slobozia. Adresă, numere de telefon, email, program de funcționare și harta locației.',
                keywords: ['contact', 'adresa', 'telefon', 'email', 'program', 'harta'],
                type: 'page'
            },
            {
                id: 'petitii',
                url: '/pls/petitii',
                title: 'Petiții - Poliția Locală Slobozia',
                content: 'Informații despre depunerea și procesarea petițiilor, reclamațiilor și sesizărilor. Formular online pentru depunerea petițiilor.',
                keywords: ['petitii', 'reclamatii', 'sesizari', 'formular', 'plangeri'],
                type: 'page'
            }
        ];
        
        // Add pages to index
        fallbackPages.forEach(page => {
            _pagesData.push(page);
            _searchIndex.addDoc(page);
        });
        
        console.log(`Built fallback index with ${_pagesData.length} pages`);
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
    
    // Search implementation
    async function search(query, options = {}) {
        // Ensure index is ready
        if (!_indexReady) {
            await loadSearchIndex();
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
        
        // Track analytics if enabled
        if (_searchConfig.trackAnalytics) {
            trackSearchAnalytics(query, searchOptions);
        }
        
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
        const normalizedText = text;
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
    
    // Track search analytics
    function trackSearchAnalytics(query, options) {
        // Simple console analytics for now
        console.log(`Search analytics - Query: ${query}, Options:`, options);
        
        // In a real implementation, send to your analytics service
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'search',
                searchQuery: query,
                searchFilters: options.filters,
                searchPage: options.page,
                searchSortBy: options.sortBy
            });
        }
    }
    
    // Initialize
    function init(config = {}) {
        // Return existing instance if already initialized
        if (_instance) return _instance;
        
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
        
        // Start loading the search index
        loadSearchIndex().catch(err => {
            console.error('Error during search index initialization:', err);
        });
        
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
                    await loadSearchIndex();
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
        
        // Add script tag to load elasticlunr
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js';
        script.onload = function() {
            console.log('Elasticlunr loaded dynamically');
            initSearch();
        };
        script.onerror = function() {
            console.error('Failed to load Elasticlunr dynamically');
        };
        document.head.appendChild(script);
    } else {
        initSearch();
    }
    
    function initSearch() {
        // Initialize the search module
        window.siteSearch = SiteSearch.init({
            useServerIndex: false,  // Build index on client (change to true in production with a pre-built index)
            indexUrl: '/pls/search-index.json',
            siteMapUrl: '/pls/sitemap.xml',
            crawlStartUrl: '/pls/',
            maxResults: 100,
            debounceTime: 300
        });
        
        // Attach to search input in header (if any)
        const headerSearchInput = document.querySelector('.search-bar input');
        if (headerSearchInput) {
            headerSearchInput.addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length >= 2) {
                    // Get suggestions for header search
                    const suggestions = window.siteSearch.getSearchSuggestions(query);
                    
                    // Display suggestions in header
                    displayHeaderSuggestions(suggestions);
                } else {
                    // Clear suggestions
                    hideHeaderSuggestions();
                }
            });
            
            // Handle form submission
            const searchForm = headerSearchInput.closest('form');
            if (searchForm) {
                searchForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const query = headerSearchInput.value.trim();
                    if (query.length >= 2) {
                        // Redirect to search page
                        window.location.href = `/pls/cautare?q=${encodeURIComponent(query)}`;
                    }
                });
            }
        }
        
        // Check if we're on the search page
        const searchPageInput = document.getElementById('search-input');
        if (searchPageInput) {
            // Get query from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            
            // Set the search input value
            searchPageInput.value = query;
            
            // Perform search if we have a query
            if (query) {
                performSearch(query);
            }
            
            // Handle search form submission
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const query = searchPageInput.value.trim();
                    if (query) {
                        // Update URL
                        const url = new URL(window.location);
                        url.searchParams.set('q', query);
                        url.searchParams.set('page', '1');
                        window.history.pushState({}, '', url);
                        
                        // Perform search
                        performSearch(query);
                    }
                });
            }
            
            // Handle real-time suggestions
            searchPageInput.addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length >= 2) {
                    // Get and display suggestions
                    const suggestions = window.siteSearch.getSearchSuggestions(query);
                    displaySearchSuggestions(suggestions);
                } else {
                    // Clear suggestions
                    document.getElementById('search-suggestions').innerHTML = '';
                }
            });
        }
    }
    
    // Display suggestions in header search
    function displayHeaderSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            hideHeaderSuggestions();
            return;
        }
        
        // Look for existing suggestions container or create it
        let suggestionsContainer = document.querySelector('.header-search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'header-search-suggestions';
            document.querySelector('.search-bar').appendChild(suggestionsContainer);
        }
        
        // Generate HTML for suggestions
        let html = '<ul>';
        suggestions.forEach(suggestion => {
            html += `
                <li>
                    <a href="/pls/cautare?q=${encodeURIComponent(suggestion)}">
                        <i class="material-icons">search</i>
                        ${suggestion}
                    </a>
                </li>
            `;
        });
        html += '</ul>';
        
        // Set content and show
        suggestionsContainer.innerHTML = html;
        suggestionsContainer.style.display = 'block';
    }
    
    // Hide header suggestions
    function hideHeaderSuggestions() {
        const suggestionsContainer = document.querySelector('.header-search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    // Display search suggestions on search page
    function displaySearchSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) return;
        
        if (!suggestions || suggestions.length === 0) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        let html = '<ul>';
        suggestions.forEach(suggestion => {
            html += `
                <li>
                    <a href="#" onclick="quickSearch('${suggestion}'); return false;">
                        ${suggestion}
                    </a>
                </li>
            `;
        });
        html += '</ul>';
        
        suggestionsContainer.innerHTML = html;
    }
    
    // Perform search on search page
    async function performSearch(query, page = 1, sortBy = 'relevance', filters = {}) {
        const resultList = document.getElementById('result-list');
        if (!resultList) return;
        
        // Show loading state
        resultList.innerHTML = `
            <div class="search-loading">
                <div class="search-loading-spinner"></div>
                <p>Se încarcă rezultatele căutării...</p>
            </div>
        `;
        
        try {
            // Ensure search module is ready
            await window.siteSearch.waitForReady();
            
            // Perform search
            const searchResult = await window.siteSearch.search(query, {
                page,
                perPage: 10,
                sortBy,
                filters
            });
            
            // Update search summary
            const searchSummary = document.getElementById('search-summary');
            if (searchSummary) {
                searchSummary.innerHTML = `
                    S-au găsit <strong>${searchResult.totalResults}</strong> rezultate pentru 
                    <span class="search-term">"${query}"</span>
                `;
            }
            
            // Handle direct match if any
            const directMatchContainer = document.getElementById('direct-match-container');
            if (directMatchContainer) {
                if (searchResult.directMatch) {
                    directMatchContainer.innerHTML = `
                        <div class="direct-match">
                            <div class="direct-match-icon">
                                <i class="material-icons">${searchResult.directMatch.type === 'document' ? 'description' : 'find_in_page'}</i>
                            </div>
                            <div class="direct-match-content">
                                <h3>Rezultat exact găsit</h3>
                                <p>${searchResult.directMatch.title}</p>
                                <a href="${searchResult.directMatch.url}" class="direct-match-link">
                                    Accesează direct
                                    <i class="material-icons">arrow_forward</i>
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    directMatchContainer.innerHTML = '';
                }
            }
            
            // Update filter counts
            updateFilterCounts(searchResult);
            
            // Display results
            if (searchResult.totalResults > 0) {
                displaySearchResults(searchResult, query);
                displayPagination(searchResult.totalPages, page);
                displayRelatedSearches(searchResult);
            } else {
                showNoResultsState(query, searchResult);
            }
        } catch (error) {
            console.error('Error performing search:', error);
            resultList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon"><i class="material-icons">error</i></div>
                    <h3>Eroare de căutare</h3>
                    <p>A apărut o eroare în timpul căutării: ${error.message}</p>
                    <p>Vă rugăm să încercați din nou mai târziu.</p>
                </div>
            `;
        }
    }
    
    // Update filter counts in sidebar
    function updateFilterCounts(searchResult) {
        // Update total count
        const countAll = document.getElementById('count-all');
        if (countAll) {
            countAll.textContent = searchResult.totalResults || 0;
        }
        
        // Update type filter counts
        const facets = searchResult.facets || {};
        const countPage = document.getElementById('count-page');
        const countDocument = document.getElementById('count-document');
        
        if (countPage && facets.type) {
            countPage.textContent = facets.type.page || 0;
        }
        
        if (countDocument && facets.type) {
            countDocument.textContent = facets.type.document || 0;
        }
    }
    
    // Display search results
    function displaySearchResults(searchResult, query) {
        const resultList = document.getElementById('result-list');
        if (!resultList) return;
        
        let html = '';
        
        // Add each result
        searchResult.results.forEach(result => {
            // Determine icon based on result type
            const icon = result.type === 'document' ? 'description' : 'insert_drive_file';
            
            // Extract section from URL
            const urlParts = result.url.split('/');
            const section = urlParts.length > 2 ? urlParts[2] : 'general';
            
            // Generate highlighted excerpt
            const highlightedExcerpt = window.siteSearch.highlightSearchTerms(result.excerpt || '', query);
            
            html += `
                <div class="result-card" data-type="${result.type}" data-section="${section}">
                    <div class="result-meta">
                        <div class="result-type">
                            <i class="material-icons">${icon}</i>
                            ${result.type === 'document' ? 'Document' : 'Pagină'}
                        </div>
                        <a href="${result.url}" class="result-url" title="${result.url}">${result.url}</a>
                    </div>
                    <h3 class="result-title">
                        <a href="${result.url}">${window.siteSearch.highlightSearchTerms(result.title, query)}</a>
                    </h3>
                    <div class="result-excerpt">
                        ${highlightedExcerpt}
                    </div>
                    <div class="result-actions">
                        <a href="${result.url}" class="result-action">
                            <i class="material-icons">visibility</i>
                            Vizualizare
                        </a>
                        <a href="#" class="result-action" onclick="shareResult('${result.url}', '${result.title.replace(/'/g, "\\'")}'); return false;">
                            <i class="material-icons">share</i>
                            Distribuie
                        </a>
                    </div>
                </div>
            `;
        });
        
        resultList.innerHTML = html;
    }
    
    // Display pagination
    function displayPagination(totalPages, currentPage) {
        const paginationContainer = document.getElementById('search-pagination');
        if (!paginationContainer) return;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `
            <a href="#" 
               class="pagination-nav ${currentPage <= 1 ? 'disabled' : ''}" 
               onclick="navigateToPage(${currentPage - 1}); return false;"
               ${currentPage <= 1 ? 'aria-disabled="true"' : ''}>
                <i class="material-icons">chevron_left</i>
            </a>
        `;
        
        // Page numbers
        const maxPages = 5;
        const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPages / 2), totalPages - maxPages + 1));
        const endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <a href="#" 
                   class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                   onclick="navigateToPage(${i}); return false;"
                   aria-current="${i === currentPage ? 'page' : 'false'}">
                    ${i}
                </a>
            `;
        }
        
        // Next button
        html += `
            <a href="#" 
               class="pagination-nav ${currentPage >= totalPages ? 'disabled' : ''}" 
               onclick="navigateToPage(${currentPage + 1}); return false;"
               ${currentPage >= totalPages ? 'aria-disabled="true"' : ''}>
                <i class="material-icons">chevron_right</i>
            </a>
        `;
        
        paginationContainer.innerHTML = html;
    }
    
    // Display related searches
    function displayRelatedSearches(searchResult) {
        if (!searchResult.relatedSearches || searchResult.relatedSearches.length === 0) {
            return;
        }
        
        const container = document.createElement('div');
        container.className = 'related-searches';
        container.innerHTML = `
            <h3>Căutări similare:</h3>
            <div class="suggestion-list">
                ${searchResult.relatedSearches.map(term => 
                    `<a href="#" class="suggestion-item" onclick="quickSearch('${term}'); return false;">${term}</a>`
                ).join('')}
            </div>
        `;
        
        // Remove any existing related searches
        const existingRelated = document.querySelector('.related-searches');
        if (existingRelated) {
            existingRelated.remove();
        }
        
        // Add to page
        const pagination = document.querySelector('.search-pagination');
        if (pagination) {
            pagination.after(container);
        }
    }
    
    // Show no results state
    function showNoResultsState(query, searchResult) {
        const resultList = document.getElementById('result-list');
        if (!resultList) return;
        
        let suggestionsHTML = '';
        
        // Add search suggestions if available
        if (searchResult.suggestions && searchResult.suggestions.length > 0) {
            suggestionsHTML = `
                <h4>Încercați în schimb:</h4>
                <div class="suggestion-list">
                    ${searchResult.suggestions.map(suggestion => 
                        `<a href="#" class="suggestion-item" onclick="quickSearch('${suggestion}'); return false;">${suggestion}</a>`
                    ).join('')}
                </div>
            `;
        }
        
        resultList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon"><i class="material-icons">search_off</i></div>
                <h3>Niciun rezultat găsit</h3>
                <p>Nu am găsit niciun rezultat pentru căutarea "${query}". Vă rugăm să încercați alte cuvinte cheie.</p>
                ${suggestionsHTML}
                <div class="suggestion-list">
                    <a href="#" class="suggestion-item" onclick="quickSearch('gdpr'); return false;">GDPR</a>
                    <a href="#" class="suggestion-item" onclick="quickSearch('petitii'); return false;">Petiții</a>
                    <a href="#" class="suggestion-item" onclick="quickSearch('contact'); return false;">Contact</a>
                    <a href="#" class="suggestion-item" onclick="quickSearch('cariere'); return false;">Cariere</a>
                </div>
            </div>
        `;
        
        // Clear pagination
        const paginationContainer = document.getElementById('search-pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    }
});

// Global functions needed for the search page
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
    
    // Execute search
    window.siteSearch.search(query, {
        page,
        perPage: 10,
        sortBy,
        filters
    }).then(result => {
        // Update UI
        const searchSummary = document.getElementById('search-summary');
        if (searchSummary) {
            searchSummary.innerHTML = `
                S-au găsit <strong>${result.totalResults}</strong> rezultate pentru 
                <span class="search-term">"${query}"</span>
            `;
        }
        
        if (result.totalResults > 0) {
            displaySearchResults(result, query);
            displayPagination(result.totalPages, page);
        } else {
            showNoResultsState(query, result);
        }
    }).catch(error => {
        console.error('Error during pagination:', error);
    });
    
    // Scroll to top of results
    document.querySelector('.search-container').scrollIntoView({ behavior: 'smooth' });
};

window.quickSearch = function(query) {
    if (!query) return;
    
    // Update search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = query;
    }
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('q', query);
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url);
    
    // Clear search suggestions
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = '';
    }
    
    // Perform search
    window.siteSearch.search(query, {
        page: 1,
        perPage: 10,
        sortBy: url.searchParams.get('sortBy') || 'relevance'
    }).then(result => {
        // Update UI
        const searchSummary = document.getElementById('search-summary');
        if (searchSummary) {
            searchSummary.innerHTML = `
                S-au găsit <strong>${result.totalResults}</strong> rezultate pentru 
                <span class="search-term">"${query}"</span>
            `;
        }
        
        if (result.totalResults > 0) {
            displaySearchResults(result, query);
            displayPagination(result.totalPages, 1);
            displayRelatedSearches(result);
        } else {
            showNoResultsState(query, result);
        }
    }).catch(error => {
        console.error('Error during quick search:', error);
    });
};

window.shareResult = function(url, title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = url;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        alert('Link-ul a fost copiat în clipboard!');
    }
};

// Helper functions for DOM manipulation (internal use)
function displaySearchResults(searchResult, query) {
    const resultList = document.getElementById('result-list');
    if (!resultList || !window.siteSearch) return;
    
    let html = '';
    
    // Add each result
    searchResult.results.forEach(result => {
        // Determine icon based on result type
        const icon = result.type === 'document' ? 'description' : 'insert_drive_file';
        
        // Extract section from URL
        const urlParts = result.url.split('/');
        const section = urlParts.length > 2 ? urlParts[2] : 'general';
        
        // Generate highlighted excerpt
        const highlightedExcerpt = window.siteSearch.highlightSearchTerms(result.excerpt || '', query);
        const highlightedTitle = window.siteSearch.highlightSearchTerms(result.title, query);
        
        html += `
            <div class="result-card" data-type="${result.type}" data-section="${section}">
                <div class="result-meta">
                    <div class="result-type">
                        <i class="material-icons">${icon}</i>
                        ${result.type === 'document' ? 'Document' : 'Pagină'}
                    </div>
                    <a href="${result.url}" class="result-url" title="${result.url}">${result.url}</a>
                </div>
                <h3 class="result-title">
                    <a href="${result.url}">${highlightedTitle}</a>
                </h3>
                <div class="result-excerpt">
                    ${highlightedExcerpt}
                </div>
                <div class="result-actions">
                    <a href="${result.url}" class="result-action">
                        <i class="material-icons">visibility</i>
                        Vizualizare
                    </a>
                    <a href="#" class="result-action" onclick="shareResult('${result.url}', '${result.title.replace(/'/g, "\\'")}'); return false;">
                        <i class="material-icons">share</i>
                        Distribuie
                    </a>
                </div>
            </div>
        `;
    });
    
    resultList.innerHTML = html;
}

function displayPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('search-pagination');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <a href="#" 
           class="pagination-nav ${currentPage <= 1 ? 'disabled' : ''}" 
           onclick="navigateToPage(${currentPage - 1}); return false;"
           ${currentPage <= 1 ? 'aria-disabled="true"' : ''}>
            <i class="material-icons">chevron_left</i>
        </a>
    `;
    
    // Page numbers
    const maxPages = 5;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPages / 2), totalPages - maxPages + 1));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <a href="#" 
               class="pagination-btn ${i === currentPage ? 'active' : ''}" 
               onclick="navigateToPage(${i}); return false;"
               aria-current="${i === currentPage ? 'page' : 'false'}">
                ${i}
            </a>
        `;
    }
    
    // Next button
    html += `
        <a href="#" 
           class="pagination-nav ${currentPage >= totalPages ? 'disabled' : ''}" 
           onclick="navigateToPage(${currentPage + 1}); return false;"
           ${currentPage >= totalPages ? 'aria-disabled="true"' : ''}>
            <i class="material-icons">chevron_right</i>
        </a>
    `;
    
    paginationContainer.innerHTML = html;
}

function displayRelatedSearches(searchResult) {
    if (!searchResult.relatedSearches || searchResult.relatedSearches.length === 0) {
        return;
    }
    
    const container = document.createElement('div');
    container.className = 'related-searches';
    container.innerHTML = `
        <h3>Căutări similare:</h3>
        <div class="suggestion-list">
            ${searchResult.relatedSearches.map(term => 
                `<a href="#" class="suggestion-item" onclick="quickSearch('${term}'); return false;">${term}</a>`
            ).join('')}
        </div>
    `;
    
    // Remove any existing related searches
    const existingRelated = document.querySelector('.related-searches');
    if (existingRelated) {
        existingRelated.remove();
    }
    
    // Add to page
    const pagination = document.querySelector('.search-pagination');
    if (pagination) {
        pagination.after(container);
    }
}

function showNoResultsState(query, searchResult) {
    const resultList = document.getElementById('result-list');
    if (!resultList) return;
    
    let suggestionsHTML = '';
    
    // Add search suggestions if available
    if (searchResult.suggestions && searchResult.suggestions.length > 0) {
        suggestionsHTML = `
            <h4>Încercați în schimb:</h4>
            <div class="suggestion-list">
                ${searchResult.suggestions.map(suggestion => 
                    `<a href="#" class="suggestion-item" onclick="quickSearch('${suggestion}'); return false;">${suggestion}</a>`
                ).join('')}
            </div>
        `;
    }
    
    resultList.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon"><i class="material-icons">search_off</i></div>
            <h3>Niciun rezultat găsit</h3>
            <p>Nu am găsit niciun rezultat pentru căutarea "${query}". Vă rugăm să încercați alte cuvinte cheie.</p>
            ${suggestionsHTML}
            <div class="suggestion-list">
                <a href="#" class="suggestion-item" onclick="quickSearch('gdpr'); return false;">GDPR</a>
                <a href="#" class="suggestion-item" onclick="quickSearch('petitii'); return false;">Petiții</a>
                <a href="#" class="suggestion-item" onclick="quickSearch('contact'); return false;">Contact</a>
                <a href="#" class="suggestion-item" onclick="quickSearch('cariere'); return false;">Cariere</a>
            </div>
        </div>
    `;
    
    // Clear pagination
    const paginationContainer = document.getElementById('search-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}
