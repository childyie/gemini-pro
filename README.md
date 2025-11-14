# Gemini Pro Proxy for Cloudflare

This is a simple, streamlined Cloudflare Worker that acts as a proxy for the Google Gemini API. It uses a Durable Object with a location hint to ensure all API requests egress from North America, bypassing regional restrictions.

## Features

- **Pure Proxy**: Directly forwards your requests to the Gemini API. No extra features like load balancing or key management.
- **North American Egress**: Uses a Durable Object with `locationHint: 'wnam'` to ensure requests to Google are made from the US.
- **Stream Support**: Fully compatible with streaming responses from the Gemini API.
- **Direct Key Usage**: Uses the Gemini API key you provide in your client's request headers or query parameters.

## Deployment

1.  **Clone the project**:
    ```bash
    git clone <your-repo-url>
    cd gemini-pro
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Deploy to Cloudflare**:
    ```bash
    npm run deploy
    ```

## Usage

After deployment, configure your AI client to use the following:

-   **Base URL / Endpoint**: `https://<your-worker-url>`
-   **API Key**: Your Google Gemini API Key

The worker will automatically extract your API key from the `Authorization: Bearer <key>`, `x-goog-api-key: <key>`, or `?key=<key>` parameter and forward it to Google.
