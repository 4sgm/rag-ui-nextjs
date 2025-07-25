import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL || 'http://localhost:9200';
const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX || 'products';

export async function POST(request) {
  const { query } = await request.json();
  // Build OpenSearch query for SKU or name (case-insensitive, partial match)
  const searchBody = {
    query: {
      bool: {
        should: [
          { match: { sku: { query, fuzziness: 'AUTO' } } },
          { match: { name: { query, fuzziness: 'AUTO' } } }
        ]
      }
    }
  };

  try {
    const res = await fetch(`${OPENSEARCH_URL}/${OPENSEARCH_INDEX}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });
    const data = await res.json();
    // Return hits as products
    const products = (data.hits?.hits || []).map(hit => hit._source);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
