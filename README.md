# 🌙 Lunara — Real-Time Crypto Dashboard

> A real-time cryptocurrency dashboard with live price tracking, 7-day charts, and Redis caching. Built with Next.js and a glassmorphism UI.

![Stack](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square)
![Stack](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square)
![Stack](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat-square)
![Stack](https://img.shields.io/badge/Charts-Recharts-22B5BF?style=flat-square)
![Stack](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square)
![Stack](https://img.shields.io/badge/Tests-Jest-C21325?style=flat-square)
![CI](https://github.com/matteodr99/lunara/actions/workflows/ci.yml/badge.svg)

---

## 🚀 Features

- **Live Prices** — Top 10 cryptocurrencies by market cap, refreshed every 30 seconds
- **7-Day Chart** — Interactive price history chart powered by Recharts
- **Redis Caching** — Prices cached for 60 seconds via Upstash to avoid API rate limits
- **Market Stats** — Market cap, 24h volume, and 24h price change for each coin
- **Glassmorphism UI** — Animated background orbs, frosted glass panels, smooth transitions
- **Unit Tested** — Jest test suite covering formatting utilities and API logic
- **CI/CD** — GitHub Actions automatically runs tests on every push and pull request

---

## 🛠 Tech Stack

- **[Next.js 14](https://nextjs.org/)** — React framework with App Router and API Routes
- **[TypeScript](https://www.typescriptlang.org/)** — Type safety throughout
- **[Recharts](https://recharts.org/)** — Composable chart library for React
- **[Upstash Redis](https://upstash.com/)** — Serverless Redis for caching crypto prices
- **[CoinGecko API](https://www.coingecko.com/en/api)** — Free cryptocurrency market data
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[Jest](https://jestjs.io/)** + **[React Testing Library](https://testing-library.com/)** — Unit testing
- **[GitHub Actions](https://github.com/features/actions)** — CI/CD pipeline
- **[Vercel](https://vercel.com/)** — Deployment

---

## 📁 Project Structure

```
lunara/
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── app/
│   ├── api/
│   │   └── crypto/
│   │       └── route.ts      # API Route: fetches prices + Redis caching
│   ├── page.tsx              # Main dashboard UI
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── coingecko.ts          # CoinGecko API client + formatting utils
│   └── redis.ts              # Upstash Redis client
├── __tests__/
│   ├── coingecko.test.ts     # Unit tests for formatting utilities
│   └── crypto-api.test.ts    # Unit tests for API logic
├── jest.config.ts
├── jest.setup.ts
├── .env.local                # Environment variables (never commit!)
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A free [Upstash](https://upstash.com/) Redis database

### 1. Clone the repository

```bash
git clone https://github.com/matteodr99/lunara.git
cd lunara
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🧪 Running Tests

```bash
npm test
```

Expected output:

```
PASS  __tests__/coingecko.test.ts
  formatPrice
    ✓ formats prices >= 1 with 2 decimal places
    ✓ formats prices < 1 with more decimal places
    ✓ formats zero correctly
  formatMarketCap
    ✓ formats trillions correctly
    ✓ formats billions correctly
    ✓ formats millions correctly
    ✓ formats small values correctly

Tests: 7 passed
```

Tests run automatically on every push and pull request via **GitHub Actions**.

---

## 🔄 How Caching Works

Every time the frontend requests `/api/crypto`:

1. The API Route checks **Upstash Redis** for cached data
2. If cache exists → returns data immediately (source: `cache`)
3. If cache is empty → fetches from **CoinGecko API**, stores in Redis for **60 seconds**, then returns data (source: `api`)

This means CoinGecko is called at most once per minute, regardless of how many users are on the dashboard.

---

## 📡 API Reference

### `GET /api/crypto`

Returns the top 10 cryptocurrencies by market cap.

**Response**

```json
{
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "current_price": 65000,
      "price_change_percentage_24h": 2.5,
      "market_cap": 1280000000000,
      "total_volume": 35000000000,
      "image": "https://...",
      "sparkline_in_7d": { "price": [...] }
    }
  ],
  "source": "cache"
}
```

---

## 🔁 CI/CD Pipeline

Every push and pull request to `main` triggers the GitHub Actions workflow which:

1. Sets up Node.js 20
2. Installs frontend dependencies
3. Runs all unit tests with Jest
4. Reports pass/fail status directly on the commit and pull request

---

## 🚢 Production Deployment

### Vercel

1. Create an account at [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy — Vercel automatically handles the Next.js build and API Routes

---

## 🔮 Roadmap

- [ ] Search and filter cryptocurrencies
- [ ] Portfolio tracker with custom watchlist
- [ ] Price alerts and notifications
- [ ] Multiple timeframes (1D, 7D, 30D, 1Y)
- [ ] Currency switcher (USD, EUR, GBP)
- [ ] Integration tests

---

## 📄 License

MIT License — feel free to use this project as a base for your own work.

---

<p align="center">Built with 🌙 and ☕ coffee</p>
