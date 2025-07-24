
"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { TextField, Button, Box, Typography, CircularProgress, Paper, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addReferences } from '@/utils/ragUtils';



const SearchboxPage = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]); // dynamic from Haystack
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recommendations, setRecommendations] = useState([]); // dynamic from Haystack
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch categories and recommendations from Haystack API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setHasSearched(true);
    setCategories([]);
    setRecommendations([]);
    setSelectedCategory(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputText }),
      });
      if (!res.ok) throw new Error('API error: ' + res.status);
      const data = await res.json();
      // Expecting categories and products in the response
      const cats = data.response.results[0].categories || [];
      const prods = data.response.results[0].products || [];
      setCategories(cats);
      setRecommendations(prods);
      if (cats.length > 0) setSelectedCategory(cats[0]);
    } catch (err) {
      setError('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  // When a category is clicked, filter recommendations for that category
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setRecommendations((prev) => prev.filter(p => p.category === cat));
  };

  return (
    <Box sx={{ background: '#f6f8fa', minHeight: '100vh', py: 6 }}>
      <Paper elevation={3} sx={{ maxWidth: 1200, mx: 'auto', p: 4, borderRadius: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, color: '#1976d2', fontWeight: 700, letterSpacing: 1 }}>
          Product Search
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
          <TextField
            label="Type your product question"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
            autoFocus
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !inputText.trim()}
            sx={{ height: 56, minWidth: 120, fontWeight: 600 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </form>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}
        {/* Mega Menu Layout */}
        {hasSearched && (
          <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
            {/* Categories */}
            <Paper sx={{ minWidth: 220, p: 2, background: '#f4f6fb', borderRadius: 2, boxShadow: 0 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Categories</Typography>
              {categories.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No categories found.</Typography>
              ) : (
                categories.map(cat => (
                  <Button
                    key={cat}
                    variant={cat === selectedCategory ? 'contained' : 'text'}
                    color={cat === selectedCategory ? 'primary' : 'inherit'}
                    onClick={() => handleCategoryClick(cat)}
                    sx={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      mb: 1,
                      fontWeight: cat === selectedCategory ? 700 : 400,
                      background: cat === selectedCategory ? '#e3f2fd' : 'none',
                    }}
                  >
                    {cat}
                  </Button>
                ))
              )}
            </Paper>
            {/* Product Recommendations */}
            <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} width="100%">
                  <CircularProgress size={40} />
                </Box>
              ) : recommendations.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  No product recommendations found.
                </Typography>
              ) : (
                recommendations.map(product => (
                  <Paper key={product.id} sx={{ width: 260, minHeight: 340, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <img src={product.image} alt={product.title} style={{ width: '100%', height: 140, objectFit: 'contain', background: '#f5f5f5', borderRadius: 8 }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>{product.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{product.description}</Typography>
                    <Typography variant="h6" color="primary">${product.price}</Typography>
                    <Button variant="contained" color="primary" sx={{ mt: 2, width: '100%' }}>Add to Cart</Button>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        )}
      </Paper>
      <Typography variant="caption" sx={{ color: '#888', mt: 2, display: 'block', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} WebJaguar Product Search. Powered by RAG API.
      </Typography>
    </Box>
  );
};

export default SearchboxPage;
