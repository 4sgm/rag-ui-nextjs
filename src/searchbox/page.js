"use client";
import { useState } from "react";

export default function SearchboxPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSearch = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);
		setProducts([]);
		try {
			const res = await fetch("/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});
			const data = await res.json();
			setResults(data.response || data);

			// Try to extract products from the response
			let foundProducts = [];
			if (data && data.results && Array.isArray(data.results)) {
				// If your API returns products in a 'documents' array inside each result
				data.results.forEach((result) => {
					if (result.documents && Array.isArray(result.documents)) {
						result.documents.forEach((doc) => {
							// If doc.meta contains product info, use it
							if (doc.meta && doc.meta.sku && doc.meta.name) {
								foundProducts.push(doc.meta);
							}
						});
					}
				});
			}
			setProducts(foundProducts);
		} catch (err) {
			setError("Search failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ maxWidth: 900, margin: "2rem auto", padding: 20 }}>
			<h1>Product Search</h1>
			<form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search products..."
					style={{ flex: 1, padding: 8 }}
				/>
				<button type="submit" disabled={loading || !query} style={{ padding: 8 }}>
					{loading ? "Searching..." : "Search"}
				</button>
			</form>
			{error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}

			{products.length > 0 && (
				<div style={{ marginTop: 32 }}>
					<h2>Product Recommendations</h2>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
						{products.map((product) => (
							<div key={product.sku} style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, width: 220, background: "#fff" }}>
								<img src={product.thumbnail} alt={product.name} style={{ width: "100%", height: 120, objectFit: "contain", marginBottom: 8 }} />
								<div style={{ fontWeight: "bold", fontSize: 16 }}>{product.name}</div>
								{product.price && <div style={{ color: "#0070f3", fontWeight: 500 }}>${product.price}</div>}
								{product.shortDescription && <div style={{ fontSize: 13, margin: "8px 0" }}>{product.shortDescription}</div>}
								<div style={{ fontSize: 12, color: "#888" }}>SKU: {product.sku}</div>
							</div>
						))}
					</div>
				</div>
			)}

			{results && products.length === 0 && (
				<div style={{ marginTop: 24 }}>
					<h2>No product recommendations found</h2>
					<pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4 }}>
						{JSON.stringify(results, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
