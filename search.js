/**
 * search.js - Advanced search system for Poliția Locală Slobozia website
 * 
 * Features:
 * - Better search algorithm with stemming and fuzzy matching
 * - Debounced real-time search
 * - Search suggestions and autocomplete
 * - Cached results
 * - Analytics tracking
 * - Prepared for backend integration
 * - Faceted search support
 * - Advanced search operators
 */

/**
 * Search module using revealing module pattern for better encapsulation
 */
const SiteSearch = (function() {
  // Private variables
  let _searchIndex = {};
  let _searchCache = new Map();
  let _recentSearches = [];
  let _searchConfig = {
    maxCacheSize: 50,
    maxRecentSearches: 10,
    debounceTime: 300,  // ms
    minQueryLength: 2,
    fuzzyMatchThreshold: 0.7,
    maxResults: 100,
    defaultPerPage: 10,
    highlightClass: 'search-highlight',
    searchEndpoint: '/api/search', // For future backend integration
    useServerSearch: false,        // Set to true when backend is ready
    trackAnalytics: true,
    stopWords: ['si', 'in', 'la', 'de', 'pe', 'cu', 'pentru', 'din', 'sau', 'este', 'sunt'],
    searchableFields: ['title', 'content', 'keywords', 'url'],
    fieldWeights: {
      title: 10,
      url: 8,
      keywords: 6,
      content: 4,
      importance: 1
    }
  };
  
  // Singleton pattern - store the search instance when it's initialized
  let _instance = null;
  
  // Current search state
  let _currentSearchState = {
    query: '',
    page: 1,
    filters: {},
    sortBy: 'relevance'
  };
  
  // Debounce implementation
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Simple stemming function for Romanian language
  // In production, consider using a proper stemming library like snowball-stemmer
  function stemWord(word) {
    if (word.length < 4) return word;
    
    // Handle some common Romanian suffixes (simplified)
    const suffixes = ['ilor', 'ului', 'elor', 'ile', 'ul', 'uri', 'ele', 'ii', 'lor', 'i', 'e'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }
  
  // Normalize text: lowercase, remove diacritics, remove punctuation
  function normalizeText(text) {
    if (!text) return '';
    
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Remove diacritics (ă, â, î, ș, ț)
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    text = text.replace(/ă/g, 'a')
               .replace(/â/g, 'a')
               .replace(/î/g, 'i')
               .replace(/ș/g, 's')
               .replace(/ț/g, 't');
    
    // Remove punctuation
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    
    // Remove extra spaces
    text = text.replace(/\s{2,}/g, ' ').trim();
    
    return text;
  }
  
  // Calculate Levenshtein distance for fuzzy matching
  function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  // Calculate similarity score between 0 and 1
  function calculateSimilarity(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength > 0 ? 1 - distance / maxLength : 1;
  }
  
  // Process text to remove stop words and apply stemming
  function processText(text) {
    if (!text) return [];
    
    const normalizedText = normalizeText(text);
    const words = normalizedText.split(/\s+/);
    
    // Remove stop words and apply stemming
    return words
      .filter(word => word.length > 2 && !_searchConfig.stopWords.includes(word))
      .map(word => stemWord(word));
  }
  
  // Extract meaningful terms from text
  function extractTerms(text) {
    const processedWords = processText(text);
    const terms = new Set();
    
    // Add individual terms
    processedWords.forEach(word => terms.add(word));
    
    // Add bigrams (pairs of adjacent words)
    for (let i = 0; i < processedWords.length - 1; i++) {
      terms.add(`${processedWords[i]} ${processedWords[i + 1]}`);
    }
    
    return Array.from(terms);
  }
  
  // Parse search query to handle operators
  function parseQuery(queryString) {
    const rawQuery = queryString.trim();
    const result = {
      original: rawQuery,
      normalized: normalizeText(rawQuery),
      terms: [],
      exactPhrases: [],
      excludeTerms: [],
      operators: {}
    };
    
    // Extract exact phrases (text in quotes)
    const exactPhraseRegex = /"([^"]*)"/g;
    let match;
    while ((match = exactPhraseRegex.exec(rawQuery)) !== null) {
      if (match[1].trim()) {
        result.exactPhrases.push(normalizeText(match[1]));
      }
    }
    
    // Remove the exact phrases from the query for further processing
    let remainingQuery = rawQuery.replace(exactPhraseRegex, '');
    
    // Extract excluded terms (prefixed with -)
    const excludeTermRegex = /\s-(\w+)/g;
    while ((match = excludeTermRegex.exec(remainingQuery)) !== null) {
      if (match[1].trim()) {
        result.excludeTerms.push(normalizeText(match[1]));
      }
    }
    
    // Replace excluded terms with spaces for further processing
    remainingQuery = remainingQuery.replace(excludeTermRegex, ' ');
    
    // Extract operator filters (field:value)
    const operatorRegex = /(\w+):(\w+)/g;
    while ((match = operatorRegex.exec(remainingQuery)) !== null) {
      const field = match[1].toLowerCase();
      const value = normalizeText(match[2]);
      result.operators[field] = value;
    }
    
    // Replace operators with spaces for further processing
    remainingQuery = remainingQuery.replace(operatorRegex, ' ');
    
    // Process remaining terms
    result.terms = processText(remainingQuery);
    
    return result;
  }
  
  // Generate a search excerpt with context
  function generateExcerpt(text, searchTerms, maxLength = 160) {
    if (!text) return '';
    
    // Try to find the best position for an excerpt
    let bestPosition = 0;
    let bestScore = -1;
    
    const normalizedText = normalizeText(text);
    
    // Find the position with most matches
    for (let i = 0; i < normalizedText.length; i++) {
      let score = 0;
      
      for (const term of searchTerms) {
        if (normalizedText.substring(i, i + term.length).toLowerCase() === term.toLowerCase()) {
          score += 10 + term.length;  // More weight for longer terms
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestPosition = i;
      }
    }
    
    // If no matches found, just take the beginning
    if (bestScore === -1) {
      bestPosition = 0;
    }
    
    // Extract excerpt
    let startPos = Math.max(0, bestPosition - maxLength / 2);
    let endPos = Math.min(text.length, startPos + maxLength);
    
    // Adjust to avoid cutting words
    while (startPos > 0 && text[startPos] !== ' ') {
      startPos--;
    }
    
    while (endPos < text.length && text[endPos] !== ' ') {
      endPos++;
    }
    
    let excerpt = text.substring(startPos, endPos);
    
    // Add ellipsis if needed
    if (startPos > 0) {
      excerpt = '...' + excerpt;
    }
    
    if (endPos < text.length) {
      excerpt = excerpt + '...';
    }
    
    return excerpt;
  }
  
  // Calculate relevance score for an item
  function calculateScore(item, parsedQuery) {
    let score = 0;
    const matchDetails = [];
    const weights = _searchConfig.fieldWeights;
    
    // Process each searchable field
    for (const field of _searchConfig.searchableFields) {
      if (!item[field]) continue;
      
      const fieldValue = normalizeText(String(item[field]));
      
      // Check for exact phrases (highest priority)
      for (const phrase of parsedQuery.exactPhrases) {
        if (fieldValue.includes(phrase)) {
          const bonus = weights[field] * 20;
          score += bonus;
          matchDetails.push(`Expresie exactă în ${field}: "${phrase}" (+${bonus})`);
        }
      }
      
      // Check for term matches
      for (const term of parsedQuery.terms) {
        // Exact term match
        if (fieldValue.includes(` ${term} `) || fieldValue.startsWith(term + ' ') || fieldValue.endsWith(' ' + term) || fieldValue === term) {
          const bonus = weights[field] * 10;
          score += bonus;
          matchDetails.push(`Termen exact în ${field}: "${term}" (+${bonus})`);
        }
        // Partial term match
        else if (fieldValue.includes(term)) {
          const bonus = weights[field] * 5;
          score += bonus;
          matchDetails.push(`Termen parțial în ${field}: "${term}" (+${bonus})`);
        }
        // Fuzzy match for longer terms
        else if (term.length > 3) {
          // For arrays (like keywords), check each item
          if (Array.isArray(item[field])) {
            for (const value of item[field]) {
              const normalizedValue = normalizeText(String(value));
              const similarity = calculateSimilarity(term, normalizedValue);
              
              if (similarity >= _searchConfig.fuzzyMatchThreshold) {
                const bonus = weights[field] * 3 * similarity;
                score += bonus;
                matchDetails.push(`Potrivire fuzzy în ${field}: "${term}" ~ "${value}" (${Math.round(similarity * 100)}%, +${Math.round(bonus)})`);
              }
            }
          } else {
            // For string fields, check for fuzzy matches within words
            const fieldWords = fieldValue.split(/\s+/);
            for (const word of fieldWords) {
              const similarity = calculateSimilarity(term, word);
              
              if (similarity >= _searchConfig.fuzzyMatchThreshold) {
                const bonus = weights[field] * 3 * similarity;
                score += bonus;
                matchDetails.push(`Potrivire fuzzy în ${field}: "${term}" ~ "${word}" (${Math.round(similarity * 100)}%, +${Math.round(bonus)})`);
              }
            }
          }
        }
      }
      
      // Check for operator matches
      for (const [operator, value] of Object.entries(parsedQuery.operators)) {
        if (operator === field || (operator === 'type' && field === 'type')) {
          if (String(item[field]).toLowerCase() === value) {
            const bonus = weights[field] * 15;
            score += bonus;
            matchDetails.push(`Operator ${operator}:${value} (+${bonus})`);
          }
        }
      }
    }
    
    // Check for excluded terms (negative scoring)
    for (const excludeTerm of parsedQuery.excludeTerms) {
      for (const field of _searchConfig.searchableFields) {
        if (!item[field]) continue;
        
        const fieldValue = normalizeText(String(item[field]));
        
        if (fieldValue.includes(excludeTerm)) {
          score -= 1000;  // Large penalty to effectively exclude
          matchDetails.push(`Termen exclus găsit: "${excludeTerm}" (-1000)`);
          break;
        }
      }
    }
    
    // Add base importance score
    if (typeof item.importance === 'number') {
      const importanceScore = item.importance * weights.importance;
      score += importanceScore;
      matchDetails.push(`Scor de importanță: ${importanceScore}`);
    }
    
    // Special handling for document format queries
    if (/^[a-z]+\.?\s*\d+\s*\/\s*\d{4}$/i.test(parsedQuery.original) && item.type === 'document') {
      score += 150;
      matchDetails.push(`Format document (+150)`);
    }
    
    return { score, matchDetails };
  }
  
  // Generate search suggestions based on query prefix
  function generateSuggestions(query, maxSuggestions = 5) {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = normalizeText(query.toLowerCase());
    const suggestions = new Set();
    
    // Add recent searches that start with the query
    _recentSearches.forEach(search => {
      if (normalizeText(search).startsWith(normalizedQuery)) {
        suggestions.add(search);
      }
    });
    
    // Add popular terms from the index
    for (const key in _searchIndex) {
      const item = _searchIndex[key];
      
      // Check title
      if (normalizeText(item.title).includes(normalizedQuery)) {
        suggestions.add(item.title);
      }
      
      // Check keywords
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          if (normalizeText(keyword).startsWith(normalizedQuery)) {
            suggestions.add(keyword);
          }
        });
      }
    }
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }
  
  // Store a search in recent searches
  function addToRecentSearches(query) {
    if (!query || query.length < 3) return;
    
    // Remove if already exists
    _recentSearches = _recentSearches.filter(item => item !== query);
    
    // Add to the beginning
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
  
  // Get search results with excerpts and highlighting
  function processSearchResults(items, parsedQuery) {
    const allTerms = [...parsedQuery.terms, ...parsedQuery.exactPhrases.flatMap(phrase => phrase.split(/\s+/))];
    
    return items.map(item => {
      // Generate excerpt if item has content
      if (item.content) {
        item.excerpt = generateExcerpt(item.content, allTerms);
      }
      
      // Add additional metadata
      item.queryTerms = allTerms;
      
      return item;
    });
  }
  
  // Client-side search implementation
  async function clientSearch(query, options = {}) {
    const defaults = {
      page: 1,
      perPage: _searchConfig.defaultPerPage,
      filters: {},
      sortBy: 'relevance'
    };
    
    const searchOptions = { ...defaults, ...options };
    const cacheKey = `${query}|${JSON.stringify(searchOptions)}`;
    
    // Check cache first
    if (_searchCache.has(cacheKey)) {
      return _searchCache.get(cacheKey);
    }
    
    // Add to recent searches
    if (query.trim()) {
      addToRecentSearches(query);
    }
    
    // Track analytics if enabled
    if (_searchConfig.trackAnalytics) {
      trackSearchAnalytics(query, searchOptions);
    }
    
    // Handle empty query
    if (!query.trim() || query.length < _searchConfig.minQueryLength) {
      return {
        query,
        totalResults: 0,
        currentPage: searchOptions.page,
        totalPages: 0,
        perPage: searchOptions.perPage,
        results: [],
        suggestions: generateSuggestions('', 5)
      };
    }
    
    // Parse the search query
    const parsedQuery = parseQuery(query);
    
    // Array to store search results with relevance scores
    const searchResults = [];
    
    // Process each item in our index
    for (const key in _searchIndex) {
      const item = _searchIndex[key];
      
      // Apply filters if any
      let passesFilters = true;
      for (const [filter, value] of Object.entries(searchOptions.filters)) {
        if (item[filter] !== value) {
          passesFilters = false;
          break;
        }
      }
      
      if (!passesFilters) continue;
      
      // Calculate score
      const { score, matchDetails } = calculateScore(item, parsedQuery);
      
      // If we have any match, add this item to results
      if (score > 0) {
        searchResults.push({
          ...item,
          score,
          matchDetails
        });
      }
    }
    
    // Sort results
    if (searchOptions.sortBy === 'date' && searchResults[0]?.date) {
      searchResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (searchOptions.sortBy === 'title') {
      searchResults.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default sort by relevance (score)
      searchResults.sort((a, b) => b.score - a.score);
    }
    
    // Limit to max results
    const limitedResults = searchResults.slice(0, _searchConfig.maxResults);
    
    // Calculate pagination
    const totalResults = limitedResults.length;
    const totalPages = Math.ceil(totalResults / searchOptions.perPage);
    const startIndex = (searchOptions.page - 1) * searchOptions.perPage;
    const endIndex = Math.min(startIndex + searchOptions.perPage, totalResults);
    const paginatedResults = limitedResults.slice(startIndex, endIndex);
    
    // Process results to add excerpts and highlights
    const processedResults = processSearchResults(paginatedResults, parsedQuery);
    
    // Generate facets
    const facets = generateFacets(searchResults);
    
    // Generate related searches
    const relatedSearches = generateRelatedSearches(query, searchResults);
    
    // Determine if we have a direct match
    const directMatch = searchResults.length > 0 && searchResults[0].score > 200 ? 
      searchResults[0] : null;
    
    // Generate search suggestions
    const suggestions = generateSuggestions(query);
    
    // Build the result object
    const result = {
      query,
      parsedQuery,
      totalResults,
      currentPage: searchOptions.page,
      totalPages,
      perPage: searchOptions.perPage,
      results: processedResults,
      directMatch,
      facets,
      relatedSearches,
      suggestions
    };
    
    // Cache the results
    _searchCache.set(cacheKey, result);
    
    // Manage cache size
    if (_searchCache.size > _searchConfig.maxCacheSize) {
      const firstKey = _searchCache.keys().next().value;
      _searchCache.delete(firstKey);
    }
    
    return result;
  }
  
  // Server-side search implementation (for future use)
  async function serverSearch(query, options = {}) {
    const defaults = {
      page: 1,
      perPage: _searchConfig.defaultPerPage,
      filters: {},
      sortBy: 'relevance'
    };
    
    const searchOptions = { ...defaults, ...options };
    const cacheKey = `${query}|${JSON.stringify(searchOptions)}`;
    
    // Check cache first
    if (_searchCache.has(cacheKey)) {
      return _searchCache.get(cacheKey);
    }
    
    // Add to recent searches
    if (query.trim()) {
      addToRecentSearches(query);
    }
    
    // Track analytics if enabled
    if (_searchConfig.trackAnalytics) {
      trackSearchAnalytics(query, searchOptions);
    }
    
    try {
      // Prepare request parameters
      const params = new URLSearchParams({
        q: query,
        page: searchOptions.page,
        perPage: searchOptions.perPage,
        sortBy: searchOptions.sortBy,
        ...Object.entries(searchOptions.filters).reduce((acc, [key, value]) => {
          acc[`filter_${key}`] = value;
          return acc;
        }, {})
      });
      
      // Send request to server
      const response = await fetch(`${_searchConfig.searchEndpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the results
      _searchCache.set(cacheKey, result);
      
      // Manage cache size
      if (_searchCache.size > _searchConfig.maxCacheSize) {
        const firstKey = _searchCache.keys().next().value;
        _searchCache.delete(firstKey);
      }
      
      return result;
    } catch (error) {
      console.error('Error performing server search:', error);
      
      // Fallback to client search if server fails
      return clientSearch(query, options);
    }
  }
  
  // Perform search with appropriate method
  async function performSearch(query, options = {}) {
    // Update current search state
    _currentSearchState = {
      query,
      page: options.page || 1,
      filters: options.filters || {},
      sortBy: options.sortBy || 'relevance'
    };
    
    // Choose search method based on configuration
    if (_searchConfig.useServerSearch) {
      return serverSearch(query, options);
    } else {
      return clientSearch(query, options);
    }
  }
  
  // Generate facets from search results for filtering
  function generateFacets(results) {
    const facets = {
      type: {},
      // Add more facet fields as needed
    };
    
    results.forEach(item => {
      // Count by type
      if (item.type) {
        facets.type[item.type] = (facets.type[item.type] || 0) + 1;
      }
      
      // Add more facet counting as needed
    });
    
    return facets;
  }
  
  // Generate related searches based on results
  function generateRelatedSearches(query, results, maxRelated = 3) {
    if (results.length === 0) return [];
    
    // Extract terms from top results
    const termsCount = {};
    const originalTerms = new Set(processText(query));
    
    // Process top results
    results.slice(0, 10).forEach(item => {
      // Process title
      processText(item.title).forEach(term => {
        if (!originalTerms.has(term)) {
          termsCount[term] = (termsCount[term] || 0) + 3;
        }
      });
      
      // Process keywords
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          processText(keyword).forEach(term => {
            if (!originalTerms.has(term)) {
              termsCount[term] = (termsCount[term] || 0) + 2;
            }
          });
        });
      }
    });
    
    // Sort terms by frequency
    const sortedTerms = Object.entries(termsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term]) => term);
    
    // Combine with original query to create related searches
    const relatedSearches = [];
    const originalQuery = query.trim();
    
    for (const term of sortedTerms) {
      if (relatedSearches.length >= maxRelated) break;
      relatedSearches.push(`${originalQuery} ${term}`);
    }
    
    return relatedSearches;
  }
  
  // Track search analytics
  function trackSearchAnalytics(query, options) {
    // In a real implementation, this would send data to an analytics service
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'search',
        searchQuery: query,
        searchFilters: options.filters,
        searchPage: options.page,
        searchSortBy: options.sortBy
      });
    }
    
    // For future backend analytics
    if (_searchConfig.useServerSearch) {
      // Could send a separate analytics call to the server
      try {
        navigator.sendBeacon('/api/analytics/search', JSON.stringify({
          query,
          timestamp: new Date().toISOString(),
          options
        }));
      } catch (e) {
        // Silent fail for analytics
      }
    }
  }
  
  // Highlight search terms in text
  function highlightSearchTerms(text, query) {
    if (!text || !query) return text;
    
    const parsedQuery = parseQuery(query);
    let highlightedText = text;
    const terms = [
      ...parsedQuery.terms,
      ...parsedQuery.exactPhrases,
      ...parsedQuery.exactPhrases.flatMap(phrase => phrase.split(/\s+/))
    ];
    
    // Sort terms by length (longest first) to avoid nested highlights
    const sortedTerms = [...new Set(terms)]
      .filter(term => term.length > 2)
      .sort((a, b) => b.length - a.length);
    
    // Highlight each term
    for (const term of sortedTerms) {
      const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      highlightedText = highlightedText.replace(regex, match => 
        `<span class="${_searchConfig.highlightClass}">${match}</span>`
      );
    }
    
    return highlightedText;
  }
  
  // Initialize search module
  function init(config = {}) {
    // Only initialize once
    if (_instance) return _instance;
    
    // Merge configuration
    _searchConfig = { ..._searchConfig, ...config };
    
    // Load recent searches from localStorage
    try {
      const storedSearches = localStorage.getItem('pls_recent_searches');
      if (storedSearches) {
        _recentSearches = JSON.parse(storedSearches);
      }
    } catch (e) {
      console.warn('Failed to load recent searches from localStorage', e);
    }
    
    // Load the search index either from a hardcoded source or via AJAX
    if (_searchConfig.indexUrl && !_searchConfig.useServerSearch) {
      fetch(_searchConfig.indexUrl)
        .then(response => response.json())
        .then(data => {
          _searchIndex = data;
        })
        .catch(error => {
          console.error('Failed to load search index:', error);
          // Fallback to hardcoded index
          _searchIndex = window.fallbackSearchIndex || {};
        });
    } else {
      // Use the hardcoded index as a fallback
      _searchIndex = window.fallbackSearchIndex || {};
    }
    
    // Create debounced search function for real-time search
    const debouncedSearch = debounce(performSearch, _searchConfig.debounceTime);
    
    // Create the instance
    _instance = {
      search: performSearch,
      searchRealTime: debouncedSearch,
      highlightSearchTerms,
      getSearchSuggestions: generateSuggestions,
      clearSearchCache: () => _searchCache.clear(),
      getRecentSearches: () => [..._recentSearches],
      clearRecentSearches: () => {
        _recentSearches = [];
        localStorage.removeItem('pls_recent_searches');
      },
      getCurrentSearchState: () => ({ ..._currentSearchState }),
      configure: newConfig => {
        _searchConfig = { ..._searchConfig, ...newConfig };
        return _instance;
      }
    };
    
    return _instance;
  }
  
  // Return the public API
  return {
    init
  };
})();

// The sample search index for offline/fallback mode
window.fallbackSearchIndex = {
    // Main pages
    "acasa": {
        url: "/pls/",
        title: "Acasă - Poliția Locală Slobozia",
        content: "Pagina principală a Poliției Locale Slobozia. Informații despre serviciile oferite, noutăți și evenimente recente.",
        keywords: ["politia locala", "slobozia", "siguranta publica", "ordine publica"],
        type: "page",
        importance: 10
    },
    "despre-noi": {
        url: "/pls/despre-noi",
        title: "Despre Noi - Poliția Locală Slobozia",
        content: "Informații generale despre Poliția Locală Slobozia, istoric, misiune, viziune și valori. Structura organizatorică și principalele atribuții.",
        keywords: ["despre", "misiune", "viziune", "valori", "structura", "organizare", "istoric"],
        type: "page",
        importance: 9
    },
    "gdpr": {
        url: "/pls/gdpr",
        title: "GDPR - Poliția Locală Slobozia",
        content: "Informații despre conformitatea cu Regulamentul General privind Protecția Datelor (GDPR). Politica de confidențialitate și prelucrare a datelor cu caracter personal.",
        keywords: ["gdpr", "protectia datelor", "confidentialitate", "date personale", "regulament"],
        type: "page",
        importance: 8
    },
    "contact": {
        url: "/pls/contact",
        title: "Contact - Poliția Locală Slobozia",
        content: "Date de contact ale Poliției Locale Slobozia. Adresă, numere de telefon, email, program de funcționare și harta locației.",
        keywords: ["contact", "adresa", "telefon", "email", "program", "harta"],
        type: "page",
        importance: 9
    },
    "petitii": {
        url: "/pls/petitii",
        title: "Petiții - Poliția Locală Slobozia",
        content: "Informații despre depunerea și procesarea petițiilor, reclamațiilor și sesizărilor. Formular online pentru depunerea petițiilor.",
        keywords: ["petitii", "reclamatii", "sesizari", "formular", "plangeri"],
        type: "page",
        importance: 8
    },
    "cariere": {
        url: "/pls/cariere",
        title: "Cariere - Poliția Locală Slobozia",
        content: "Oportunități de carieră în cadrul Poliției Locale Slobozia. Posturi vacante, condiții de participare la concursuri și etapele procesului de recrutare.",
        keywords: ["cariere", "job", "angajare", "recrutare", "concurs", "posturi vacante"],
        type: "page",
        importance: 7
    },
    
    // Documents
    "og-43-1997": {
        url: "/pls/documente/og-43-1997",
        title: "O.G. nr. 43/1997 privind regimul drumurilor",
        content: "Ordonanța Guvernului nr. 43/1997 privind regimul drumurilor, republicată, cu modificările și completările ulterioare. Document legislativ important pentru activitatea poliției locale.",
        keywords: ["og 43", "og 43/1997", "ordonanta", "regimul drumurilor", "legislatie", "documente"],
        type: "document",
        importance: 7
    },
    "legea-155-2010": {
        url: "/pls/documente/legea-155-2010",
        title: "Legea nr. 155/2010 a poliției locale",
        content: "Legea nr. 155/2010 a poliției locale, republicată, cu modificările și completările ulterioare. Cadrul legal de organizare și funcționare a poliției locale.",
        keywords: ["legea 155", "legea 155/2010", "politia locala", "lege", "legislatie", "documente"],
        type: "document",
        importance: 9
    },
    "hcl-1-2011": {
        url: "/pls/documente/hcl-1-2011",
        title: "HCL nr. 1/2011 privind înființarea Poliției Locale Slobozia",
        content: "Hotărârea Consiliului Local nr. 1/2011 privind înființarea Poliției Locale Slobozia ca serviciu public local, cu personalitate juridică.",
        keywords: ["hcl 1", "hcl 1/2011", "hotarare", "infiintare", "consiliu local", "documente"],
        type: "document", 
        importance: 8
    },
    
    // Additional pages
    "acte-normative": {
        url: "/pls/acte-normative",
        title: "Acte Normative - Poliția Locală Slobozia",
        content: "Lista actelor normative care reglementează organizarea și funcționarea Poliției Locale Slobozia. Legi, ordonanțe, hotărâri și alte documente relevante.",
        keywords: ["acte normative", "legi", "ordonante", "hotarari", "legislatie"],
        type: "page",
        importance: 7
    },
    "atributii": {
        url: "/pls/atributii",
        title: "Atribuții - Poliția Locală Slobozia",
        content: "Atribuțiile Poliției Locale Slobozia conform legii. Competențe în domeniul ordinii publice, circulației, mediului, comerțului și construcțiilor.",
        keywords: ["atributii", "competente", "ordine publica", "circulatie", "mediu", "comert"],
        type: "page",
        importance: 8
    },
    "conducere": {
        url: "/pls/conducere",
        title: "Conducere - Poliția Locală Slobozia",
        content: "Prezentarea echipei de conducere a Poliției Locale Slobozia. Director executiv, directori adjuncți și șefi de servicii.",
        keywords: ["conducere", "director", "management", "echipa", "leadership"],
        type: "page",
        importance: 7
    }
};

// Create a DOM-ready function
function onDOMReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Initialize search when DOM is ready
onDOMReady(() => {
  // Initialize with default configuration
  window.siteSearch = SiteSearch.init({
    // Configuration options
    useServerSearch: false, // Set to true when backend is available
    indexUrl: '/pls/api/search-index.json', // URL to load search index
    debounceTime: 300,
    minQueryLength: 2,
    maxCacheSize: 50,
    maxResults: 100,
    defaultPerPage: 10,
    fuzzyMatchThreshold: 0.7,
    trackAnalytics: true,
    highlightClass: 'search-highlight'
  });
  
  // Attach to search form if exists
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchSuggestions = document.getElementById('search-suggestions');
  
  if (searchForm && searchInput) {
    // Handle form submission
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();
      
      if (query.length >= 2) {
        const results = await window.siteSearch.search(query);
        displaySearchResults(results);
      }
    });
    
    // Handle real-time search
    searchInput.addEventListener('input', async () => {
      const query = searchInput.value.trim();
      
      if (query.length >= 2) {
        // Get suggestions while typing
        const suggestions = window.siteSearch.getSearchSuggestions(query);
        displaySearchSuggestions(suggestions);
        
        // Perform real-time search
        const results = await window.siteSearch.searchRealTime(query);
        displaySearchResults(results);
      } else if (query.length === 0) {
        // Clear results when input is empty
        if (searchResults) {
          searchResults.innerHTML = '';
        }
        
        if (searchSuggestions) {
          searchSuggestions.innerHTML = '';
        }
      }
    });
  }
  
  // Get URL parameters for search
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get('q');
  
  // If search query is in URL, perform search
  if (queryParam && searchInput) {
    searchInput.value = queryParam;
    window.siteSearch.search(queryParam).then(displaySearchResults);
  }
});

// Display search results
function displaySearchResults(results) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;
  
  if (results.totalResults === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <p>Nu s-au găsit rezultate pentru <strong>${results.query}</strong>.</p>
        <div class="search-suggestions">
          <h3>Încercați:</h3>
          <ul>
            <li>Verificați ortografia cuvintelor introduse</li>
            <li>Folosiți cuvinte-cheie diferite</li>
            <li>Folosiți termeni mai generali</li>
          </ul>
        </div>
      </div>
    `;
    return;
  }
  
  // Build results HTML
  let resultsHTML = `
    <div class="search-summary">
      <p>S-au găsit <strong>${results.totalResults}</strong> rezultate pentru <strong>${results.query}</strong></p>
    </div>
    <div class="search-results-list">
  `;
  
  // Add direct match notification if exists
  if (results.directMatch) {
    resultsHTML += `
      <div class="direct-match">
        <p>Rezultat direct: <a href="${results.directMatch.url}">${results.directMatch.title}</a></p>
      </div>
    `;
  }
  
  // Add each result
  results.results.forEach(item => {
    let excerpt = item.excerpt ? 
      window.siteSearch.highlightSearchTerms(item.excerpt, results.query) : '';
    
    resultsHTML += `
      <div class="search-result-item">
        <h3><a href="${item.url}">${window.siteSearch.highlightSearchTerms(item.title, results.query)}</a></h3>
        <div class="search-result-url">${item.url}</div>
        ${excerpt ? `<div class="search-result-excerpt">${excerpt}</div>` : ''}
        <div class="search-result-meta">
          <span class="search-result-type">${item.type === 'document' ? 'Document' : 'Pagină'}</span>
        </div>
      </div>
    `;
  });
  
  // Add pagination if needed
  if (results.totalPages > 1) {
    resultsHTML += '<div class="search-pagination">';
    
    for (let i = 1; i <= results.totalPages; i++) {
      resultsHTML += `
        <a href="#" class="search-page-link ${i === results.currentPage ? 'active' : ''}" 
           data-page="${i}">${i}</a>
      `;
    }
    
    resultsHTML += '</div>';
  }
  
  // Add related searches if available
  if (results.relatedSearches && results.relatedSearches.length > 0) {
    resultsHTML += `
      <div class="related-searches">
        <h3>Căutări similare:</h3>
        <ul>
          ${results.relatedSearches.map(term => 
            `<li><a href="/pls/search?q=${encodeURIComponent(term)}">${term}</a></li>`
          ).join('')}
        </ul>
      </div>
    `;
  }
  
  resultsHTML += '</div>';
  
  // Update the DOM
  searchResults.innerHTML = resultsHTML;
  
  // Add pagination event handlers
  const pageLinks = searchResults.querySelectorAll('.search-page-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      const page = parseInt(link.getAttribute('data-page'), 10);
      const query = document.getElementById('search-input').value.trim();
      
      if (query) {
        const results = await window.siteSearch.search(query, { page });
        displaySearchResults(results);
        
        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
      }
    });
  });
}

// Display search suggestions
function displaySearchSuggestions(suggestions) {
  const searchSuggestions = document.getElementById('search-suggestions');
  if (!searchSuggestions || !suggestions || suggestions.length === 0) {
    if (searchSuggestions) {
      searchSuggestions.innerHTML = '';
    }
    return;
  }
  
  let suggestionsHTML = '<ul class="search-suggestions-list">';
  
  suggestions.forEach(suggestion => {
    suggestionsHTML += `
      <li><a href="/pls/search?q=${encodeURIComponent(suggestion)}">${suggestion}</a></li>
    `;
  });
  
  suggestionsHTML += '</ul>';
  
  searchSuggestions.innerHTML = suggestionsHTML;
  
  // Add click handlers for suggestions
  const suggestionLinks = searchSuggestions.querySelectorAll('a');
  suggestionLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const suggestion = link.textContent;
      const searchInput = document.getElementById('search-input');
      
      if (searchInput) {
        searchInput.value = suggestion;
        window.siteSearch.search(suggestion).then(displaySearchResults);
        
        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set('q', suggestion);
        window.history.pushState({}, '', url);
        
        // Hide suggestions
        searchSuggestions.innerHTML = '';
      }
    });
  });
}
