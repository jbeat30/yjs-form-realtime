/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
                "default-src 'self'; " +
                "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "connect-src 'self' ws://localhost:8080 ws://127.0.0.1:8080 wss://y-websocket-test-6g6q.onrender.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;