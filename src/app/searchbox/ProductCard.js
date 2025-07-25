import React from "react";

export default function ProductCard({ product }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, width: 220, background: "#fff" }}>
      {product.thumbnail && (
        <img src={product.thumbnail} alt={product.name} style={{ width: "100%", height: 120, objectFit: "contain", marginBottom: 8 }} />
      )}
      <div style={{ fontWeight: "bold", fontSize: 16 }}>{product.name}</div>
      {product.price && <div style={{ color: "#0070f3", fontWeight: 500 }}>${product.price}</div>}
      {product.shortDescription && <div style={{ fontSize: 13, margin: "8px 0" }}>{product.shortDescription}</div>}
      <div style={{ fontSize: 12, color: "#888" }}>SKU: {product.sku}</div>
    </div>
  );
}
