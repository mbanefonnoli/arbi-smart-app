# Arbi Board

Checks whether routing an NGN/RON/EUR conversion through the third currency
as an intermediary hop beats a direct quote — using real rates from Wise,
TransferGo, and Taptap Send (no AI-invented numbers).

Companion app to [Rate Board](https://github.com/mbanefonnoli/money_transfrer),
reusing the same provider scrapers.

## Run locally

```
npm install
cp .env.local.example .env.local   # add your WISE_API_KEY
npm run dev
```

Opens on http://localhost:3001 (port 3000 is left free for Rate Board).

## Deploying

Standalone Next.js 14 app — deploy to Vercel like any other, with
`WISE_API_KEY` set as an environment variable. TransferGo/Taptap Send are
scraped via a headless browser (`puppeteer-core` + `@sparticuz/chromium` in
production, full `puppeteer` locally — see `lib/providers/browser.ts`), so
a single arbitrage check can take 15-25s: it's up to three sequential
3-provider rounds (direct, then two hops), not cached or precomputed.
