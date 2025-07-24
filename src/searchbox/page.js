"use client";
import { useState } from "react";

export default function SearchboxPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSearch = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);
		try {
			const res = await fetch("/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});
			const data = await res.json();
			setResults(data.response || data);
		} catch (err) {
			setError("Search failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ maxWidth: 600, margin: "2rem auto", padding: 20 }}>
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
			{results && (
				<div style={{ marginTop: 24 }}>
					<h2>Results</h2>
					<pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4 }}>
						{JSON.stringify(results, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
