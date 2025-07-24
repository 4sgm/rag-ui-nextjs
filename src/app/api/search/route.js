// src/app/api/search/route.js

import { RagPipelineResponse, RagResult, RagAnswer, RagDocument } from '@/lib/ragPipelineResponse';

const workspace = process.env.DEEPSET_CLOUD_WORKSPACE || 'default';
const pipeline = process.env.DEEPSET_CLOUD_PIPELINE || 'my-pipeline';
const apiToken = process.env.DEEPSET_CLOUD_API_KEY;
// Construct the API URL for the deepset Cloud Search endpoint
const apiUrl = `https://api.cloud.deepset.ai/api/v1/workspaces/${workspace}/pipelines/${pipeline}/search`;

export async function POST(request) {
  // Extract the query from the incoming request
  const { query } = await request.json();

  console.log(`${__filename}: Received text:`, query);

  try {
    // Prepare the options for the API request to deepset Cloud
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        debug: true,
        view_prompts: false,
        queries: [query],
      }),
    };

    console.log(`${__filename}: apiUrl:`, apiUrl);
    console.log(`${__filename}: Request Options:\n`, requestOptions);
    // Send the request to the deepset Cloud API
    const res = await fetch(apiUrl, requestOptions);
    // Parse the JSON response
    const data = await res.json();

    console.log(`${__filename}: Response Data:\n`, data);
    // Log answers and documents for each result
    if (data && data.results && Array.isArray(data.results)) {
      data.results.forEach((result, idx) => {
        console.log(`Result #${idx + 1} - Query:`, result.query);
        console.log(`  Answers:`, JSON.stringify(result.answers, null, 2));
        console.log(`  Documents:`, JSON.stringify(result.documents, null, 2));
      });
    }
    // Create a RagPipelineResponse object from the API response
    const ragResponse = new RagPipelineResponse(data);

    ragResponse.processResults();

    console.log(`${__filename}: Processed and returning:\n`, ragResponse);
    // Return the processed response to the client
    return new Response(JSON.stringify({ response: ragResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // If any error occurs, log it and return an error response
    console.error(`${__filename}: Error:`, error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
