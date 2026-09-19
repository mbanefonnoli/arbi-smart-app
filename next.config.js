/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium', 'puppeteer'],
    // Next's file tracer only follows import/require, but @sparticuz/chromium's
    // Chromium binary lives in bin/ and is read from disk at runtime (never
    // imported) — without this, the tracer drops it from the deployed
    // function entirely, causing "libnss3.so: cannot open shared object
    // file" on Vercel even though it works locally (same bug found and
    // fixed in Rate Board's next.config.js).
    outputFileTracingIncludes: {
      '/api/arbitrage': ['./node_modules/@sparticuz/chromium/bin/**/*'],
    },
  },
};

module.exports = nextConfig;
