# Market Intelligence Portal - API Configuration Guide

## Overview

The Market Intelligence Portal aggregates real-time commodity, forex, news, and tariff data from **free APIs**, updating every hour automatically.

---

## Free APIs Setup

### 1. **NewsAPI.org** (News Articles)
**Coverage:** Business, war, geopolitical risk, commodity news  
**Free Tier:** 100 requests/day, last 30 days of news

```bash
# Get free API key
Visit: https://newsapi.org
Sign up for free account
Copy API key
```

**Add to Vercel:**
```
NEWSAPI_KEY=your_api_key_here
```

---

### 2. **ExchangeRate-API** (Forex/Currency Data)
**Coverage:** USD vs all major currencies  
**Free Tier:** 1,500 requests/month

```bash
Visit: https://exchangerate-api.com
Sign up for free account
Copy API key
```

**Add to Vercel:**
```
EXCHANGERATE_API_KEY=your_api_key_here
```

---

### 3. **Alpha Vantage** (Commodities & Metals)
**Coverage:** Precious metals (Gold, Silver), commodities  
**Free Tier:** 5 calls/minute, 500 calls/day

```bash
Visit: https://www.alphavantage.co
Sign up for free account
Copy API key
```

**Add to Vercel:**
```
ALPHAVANTAGE_API_KEY=your_api_key_here
```

---

### 4. **FRED API** (Oil, Natural Gas, Copper)
**Coverage:** US Energy Information Admin data  
**Free Tier:** Unlimited (with registration)

```bash
Visit: https://fred.stlouisfed.org/docs/api/fred/
Get free API key
```

**Add to Vercel:**
```
FRED_API_KEY=your_api_key_here
```

---

## Alternative/Supplementary APIs

| Data Type | API | Free Tier | Coverage |
|-----------|-----|-----------|----------|
| **Metals** | Metals-API | 500/mo | Gold, Silver, Copper |
| **Oil** | EIA API | Unlimited | Oil, Natural Gas, LNG |
| **Stocks** | IEX Cloud | 100/day | Stocks (pharma sector) |
| **Forex** | Fixer.io | 100/mo | 170 currencies |
| **Crypto** | CoinGecko | Unlimited | Optional commodity tracking |

---

## Tariff Data Strategy

### Option 1: **UN Trade Data API** (Recommended)
```
https://api.tradingeconomics.com/
```
- Free tier available
- 180+ countries
- Updated regularly

### Option 2: **Government Sources**
- US: https://www.usitc.gov/
- EU: https://ec.europa.eu/taxation_customs/
- China: http://cics.cnglobaltraders.com/

### Option 3: **Manual Database** (Included)
Pre-populated with major trading partners. Update quarterly from government sources.

---

## Setup Instructions

### 1. Add API Keys to Vercel

Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**

Add:
```
NEWSAPI_KEY=your_newsapi_key
EXCHANGERATE_API_KEY=your_exchangerate_key
ALPHAVANTAGE_API_KEY=your_alphavantage_key
FRED_API_KEY=your_fred_key
```

### 2. Deploy

```bash
git add -A
git commit -m "Configure market intelligence APIs"
git push
# Deploy via Vercel Dashboard or CLI
vercel --prod
```

### 3. Test

Visit: `https://[your-domain]/portal/market-intelligence`

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│           Market Intelligence Portal                │
├─────────────────────────────────────────────────────┤
│                                                       │
│  API Aggregation Layer                              │
│  ├─ NewsAPI → News & Alerts                         │
│  ├─ ExchangeRate-API → Forex Rates                  │
│  ├─ Alpha Vantage → Metals                          │
│  ├─ FRED API → Energy Data                          │
│  └─ Built-in DB → Tariffs                           │
│                                                       │
│  Caching Layer (1-hour TTL)                         │
│  └─ In-memory cache with automatic refresh          │
│                                                       │
│  Dashboard Display                                  │
│  ├─ Commodities (Gold, Silver, Oil, Gas, Copper)   │
│  ├─ Forex (USD vs 15+ currencies)                   │
│  ├─ News (categorized by impact)                    │
│  └─ Tariffs (by country & sector)                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Automatic Updates

The system **automatically updates every hour** via:

1. **Vercel Cron** (Pro/Enterprise) - Recommended
   ```javascript
   // vercel.json or vercel.ts
   {
     "crons": [{
       "path": "/api/market-intelligence",
       "schedule": "0 * * * *"  // Every hour
     }]
   }
   ```

2. **Manual Refresh** - Use the "Refresh" button in the portal

3. **Client-side Polling** - Page auto-refreshes data hourly

---

## Rate Limits & Best Practices

| API | Limit | Strategy |
|-----|-------|----------|
| **NewsAPI** | 100/day | Batch 10-15 queries, cache 1 hour |
| **ExchangeRate** | 1,500/mo | Call 24x daily (1/hour), cache |
| **Alpha Vantage** | 5/min, 500/day | Space requests, use cache |
| **FRED** | Unlimited | Safe to call frequently |

---

## Troubleshooting

### "API Key Invalid"
- Check key is correct in Vercel env vars
- Verify account is activated (some APIs send confirmation email)
- Try refreshing in portal

### "Rate Limit Exceeded"
- Wait 1 hour for next automatic update
- Premium tier needed for higher limits
- Consider using backup API for that data type

### "News Not Loading"
- Check NewsAPI key (most common issue)
- Verify you have >0 daily requests left
- Try specific query keywords

### "Tariffs Not Updating"
- Manual data (updated quarterly from sources)
- No API call needed, just check latest source

---

## Cost Analysis

| Service | Free Tier | Monthly Cost (Paid) |
|---------|-----------|-------------------|
| NewsAPI | 100/day | ~$29/month (unlimited) |
| ExchangeRate | 1,500/mo | $9/month (unlimited) |
| Alpha Vantage | 500/day | $0 (sufficient for free) |
| FRED | Unlimited | $0 |
| **Total Free** | - | **$0/month** |
| **Total Premium** | - | **~$40/month** |

---

## Enhancement Ideas

- [ ] Add SMS/email alerts for high-impact news
- [ ] Price charts with historical data (TradingView API)
- [ ] Custom tariff alerts by country
- [ ] Pharma sector stock monitoring
- [ ] Supply chain disruption tracking
- [ ] Currency crisis early warnings
- [ ] Commodity price predictions
- [ ] Integration with Knowledge Base (auto-upload news)

---

## Support & Documentation

- **NewsAPI:** https://newsapi.org/docs
- **ExchangeRate:** https://exchangerate-api.com/docs
- **Alpha Vantage:** https://www.alphavantage.co/documentation/
- **FRED:** https://fred.stlouisfed.org/docs/api/fred/

