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
                `connect-src 'self' ${process.env.NEXT_PUBLIC_WS_URL} ws://127.0.0.1:8080 ${process.env.NEXT_PUBLIC_WSS_URL}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;