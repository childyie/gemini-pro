import { DurableObject } from 'cloudflare:workers';

const BASE_URL = 'https://generativelanguage.googleapis.com';

// Define the Durable Object class for the proxy
export class GeminiProxy extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const targetUrl = `${BASE_URL}${url.pathname}${url.search}`;

    // Extract API key from client request
    const apiKey = this.extractClientApiKey(request, url);
    if (!apiKey) {
      return new Response('API key is required.', { status: 400 });
    }

    // Create new headers for the upstream request, preserving Content-Type
    const upstreamHeaders = new Headers();
    if (request.headers.has('content-type')) {
      upstreamHeaders.set('content-type', request.headers.get('content-type')!);
    }
    upstreamHeaders.set('x-goog-api-key', apiKey);

    // Forward the request to the Gemini API
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    // Create response headers, setting CORS headers
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key');

    // Return the response from Gemini API, including support for streaming
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  /**
   * Extracts the client's API key from the request.
   * Supports query parameter, x-goog-api-key header, and Authorization header.
   */
  private extractClientApiKey(request: Request, url: URL): string | null {
    // Check for key in query parameter
    if (url.searchParams.has('key')) {
      return url.searchParams.get('key');
    }

    // Check for key in 'x-goog-api-key' header
    const googApiKey = request.headers.get('x-goog-api-key');
    if (googApiKey) {
      return googApiKey;
    }

    // Check for key in 'Authorization' header (Bearer token)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
