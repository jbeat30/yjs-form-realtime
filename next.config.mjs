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
                `connect-src 'self' ws://localhost:8080 ws://127.0.0.1:8080 wss://${process.env.NEXT_PUBLIC_WWS_DOMAIN};` ,
          },
        ],
      },
    ];
  },
};

export default nextConfig;