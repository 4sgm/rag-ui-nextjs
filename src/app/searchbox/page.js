
"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Paper, Grid } from "@mui/material";
import AnswerCard from "./AnswerCard";
import ProductCard from "./ProductCard";

export default function SearchboxPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setAnswers([]);
    setProducts([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data.response || data);

      let foundAnswers = [];
      let foundProducts = [];
      if (data.response && Array.isArray(data.response.results)) {
        data.response.results.forEach((result) => {
          if (result.answers && Array.isArray(result.answers)) {
            foundAnswers.push(...result.answers);
          }
          if (result.documents && Array.isArray(result.documents)) {
            let header = null;
            if (result.documents.length > 0 && result.documents[0].content) {
              const firstLine = result.documents[0].content.split('\n')[0].replace(/\r$/, '');
              header = firstLine.split(',');
            }
            result.documents.forEach((doc) => {
              if (doc.content && header) {
                const lines = doc.content.split('\n');
                let rowLine = lines.length > 1 ? lines[1] : lines[0];
                rowLine = rowLine.replace(/\r$/, '');
                if (rowLine === header.join(',')) return;
                const values = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < rowLine.length; i++) {
                  const char = rowLine[i];
                  if (char === '"') {
                    inQuotes = !inQuotes;
                  } else if (char === ',' && !inQuotes) {
                    values.push(current);
                    current = '';
                  } else {
                    current += char;
                  }
                }
                values.push(current);
                const product = {};
                header.forEach((key, idx) => {
                  product[key] = values[idx] || '';
                });
                if (doc.meta) {
                  Object.entries(doc.meta).forEach(([k, v]) => {
                    if (!(k in product)) product[k] = v;
                  });
                }
                if (product.sku && product.name) {
                  foundProducts.push(product);
                }
              }
            });
          }
        });
      }
      setAnswers(foundAnswers);
      setProducts(foundProducts);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 6, p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#1976d2" }}>
          Product Search
        </Typography>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 32 }}>
          <TextField
            label="Type your product question"
            value={query}
            onChange={e => setQuery(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ maxWidth: 600 }}
            autoFocus
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !query.trim()}
            sx={{ height: 56, minWidth: 120, fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </form>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {/* Answers Section */}
        {answers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Answers</Typography>
            {answers.map((answer, idx) => (
              <AnswerCard key={answer.result_id || idx} answer={answer} />
            ))}
          </Box>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Product Recommendations</Typography>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.sku}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Fallback if no products or answers */}
        {results && answers.length === 0 && products.length === 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No answers or product recommendations found.
            </Typography>
            <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4, marginTop: 8 }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
