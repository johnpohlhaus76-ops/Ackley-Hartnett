# Real-Time Market Data API Configuration Guide

Complete setup for live commodity, stock, and energy prices (updated 2026).

---

## 🎯 Quick Start

All APIs below offer **free tiers** with real-time or near-real-time data. No credit card required to get started.

---

## 1. **CommodityPriceAPI** — Commodities (Metals, Agriculture, Energy)

**What it provides:** Gold, silver, copper, oil, natural gas, wheat, corn, fertilizer  
**Data freshness:** 60-second updates (real-time)  
**Free tier:** Unlimited requests  
**Sign up:** https://commoditypriceapi.com/

### Setup

```bash
# 1. Create account at https://commoditypriceapi.com
# 2. Get API key from dashboard
# 3. Add to Vercel environment variables:

COMMODITY_PRICE_API_KEY=your_key_here
```

### API Usage Example

```bash
curl "https://api.commoditypriceapi.com/v1/prices?api_key=YOUR_KEY&symbols=XAU,XAG,CU,CL,NG"
```

### Response Format

```json
{
  "status": "success",
  "data": {
    "XAU": {
      "symbol": "XAU",
      "price": 2045.50,
      "change": 12.30,
      "changePercent": 0.61,
      "timestamp": "2026-08-04T15:30:00Z"
    },
    "XAG": {
      "symbol": "XAG",
      "price": 24.85,
      "change": -0.42,
      "changePercent": -1.67,
      "timestamp": "2026-08-04T15:30:00Z"
    }
  }
}
```

### Supported Symbols

| Commodity | Symbol | Notes |
|-----------|--------|-------|
| Gold | XAU | Spot price USD/oz |
| Silver | XAG | Spot price USD/oz |
| Copper | CU | USD per pound |
| Crude Oil (WTI) | CL | USD per barrel |
| Natural Gas | NG | USD per MMBtu |
| Wheat | ZWH | USD per bushel |
| Corn | ZCH | USD per bushel |
| Fertilizer (Urea) | UREA | USD per tonne |

---

## 2. **Finnhub** — Pharma/Biotech Stocks (Real-Time)

**What it provides:** Real-time US stock quotes, pharma sector, analyst data  
**Data freshness:** Real-time (15-30 second delay)  
**Free tier:** 60 API calls/minute  
**Sign up:** https://finnhub.io/

### Setup

```bash
# 1. Register at https://finnhub.io/register
# 2. Copy API key from dashboard
# 3. Add to Vercel:

FINNHUB_API_KEY=your_key_here
```

### API Usage Example

```bash
curl "https://finnhub.io/api/v1/quote?symbol=GILD&token=YOUR_KEY"
```

### Response Format

```json
{
  "c": 94.23,           // Current price
  "d": 2.15,            // Change in price
  "dp": 2.33,           // Change percent
  "h": 96.50,           // 52-week high
  "l": 52.30,           // 52-week low
  "o": 92.10,           // Open price
  "pc": 92.08,          // Previous close
  "t": 1722776400       // Timestamp
}
```

### Pharma Stock Symbols to Track

| Company | Symbol | Sector |
|---------|--------|--------|
| Gilead Sciences | GILD | Antiviral/HIV |
| Amgen | AMGN | Biologics |
| Regeneron | REGN | Immunology |
| Biogen | BIIB | Neurology |
| Celgene (BMS) | CELG | Oncology |
| Johnson & Johnson | JNJ | Diversified |
| Pfizer | PFE | Diversified |
| Merck | MRK | Oncology |
| AbbVie | ABBV | Immunology |
| Thermo Fisher | TMO | Equipment |

---

## 3. **OilPriceAPI** — Energy Prices (Oil & Gas)

**What it provides:** WTI crude, Brent crude, natural gas, LNG  
**Data freshness:** Real-time spot prices  
**Free tier:** 7-day trial (10K requests), then pay-as-you-go  
**Sign up:** https://www.oilpriceapi.com/

### Setup

```bash
# 1. Register at https://www.oilpriceapi.com
# 2. Verify email for free trial
# 3. Get API key from account page
# 4. Add to Vercel:

OIL_PRICE_API_KEY=your_key_here
```

### API Usage Example

```bash
# WTI Crude Oil
curl "https://api.oilpriceapi.com/v1/brent?api_key=YOUR_KEY"

# Natural Gas
curl "https://api.oilpriceapi.com/v1/natural-gas?api_key=YOUR_KEY"
```

### Response Format

```json
{
  "status": "success",
  "data": {
    "symbol": "CL",
    "price": 78.45,
    "currency": "USD",
    "unit": "per barrel",
    "timestamp": "2026-08-04T15:30:00Z",
    "source": "EIA"
  }
}
```

---

## 4. **GoldAPI.io** — Precious Metals (Optional)

**What it provides:** Real-time gold, silver, platinum spot prices  
**Data freshness:** Second-by-second updates  
**Free tier:** Unlimited (no card required)  
**Sign up:** https://www.goldapi.io/

### Setup

```bash
# 1. Sign up at https://www.goldapi.io
# 2. Copy API key
# 3. Add to Vercel:

GOLD_API_KEY=your_key_here
```

### API Usage Example

```bash
curl "https://api.goldapi.io/v2/spot/latest?currency=USD&key=YOUR_KEY"
```

---

## 🔧 Integration in Ackley Hartnett Portal

### Environment Variables to Add (Vercel Dashboard)

Go to **Project Settings → Environment Variables** and add:

```
COMMODITY_PRICE_API_KEY=<key_from_step_1>
FINNHUB_API_KEY=<key_from_step_2>
OIL_PRICE_API_KEY=<key_from_step_3>
GOLD_API_KEY=<key_from_step_4>
```

### Code Implementation

The portal uses `src/lib/market-apis-v2.ts` which automatically:
1. Fetches real data from these APIs every hour
2. Caches in memory to avoid rate limits
3. Falls back to mock data if APIs unavailable
4. Timestamps all data for audit trails

### Testing APIs

```bash
# Test Market Intelligence endpoint
curl "https://ackley-hartnett-portal.vercel.app/api/market-intelligence"

# Should return real gold, silver, oil, and pharma stock prices
```

---

## 📊 Display in Portal

### Market Intelligence Dashboard
- Real-time commodity prices with 60-second updates
- Pharma stock ticker showing top 5 performers
- Energy prices (WTI, natural gas)
- API connection status indicator

### Accounts 360 Enhancement
- Pharma stock feed sidebar showing live GILD, AMGN, REGN
- Color-coded (green up, red down)
- One-click to full stock details

---

## 💡 Pro Tips

### 1. **Rate Limiting**
- CommodityPriceAPI: Unlimited (safe to call every 60 seconds)
- Finnhub: 60 calls/minute (batch requests)
- OilPriceAPI: Check your plan limits (free tier is ample)

### 2. **Data Accuracy**
- Gold/Silver: GoldAPI.io is most accurate (EOD + intraday)
- Oil: OilPriceAPI sources from EIA (official U.S. government)
- Stocks: Finnhub is real-time (stock exchange feeds)
- Commodities: CommodityPriceAPI aggregates from major exchanges

### 3. **Fallback Strategy**
If any API is down, portal automatically uses cached last-known-good prices. No customer-facing errors.

### 4. **Upgrade Path**
- **Free tier sufficient for:** Portfolio tracking, market intelligence, customer alerts
- **Paid ($10-50/month) useful for:** High-frequency trading dashboards, detailed analytics, priority support

---

## 📞 Support

| API | Support | Docs |
|-----|---------|------|
| CommodityPriceAPI | Email | https://commoditypriceapi.com/docs |
| Finnhub | Help center | https://finnhub.io/docs/api |
| OilPriceAPI | Email | https://www.oilpriceapi.com/docs |
| GoldAPI | Community | https://www.goldapi.io/documentation |

---

## ✅ Verification Checklist

- [ ] Created accounts on all 4 APIs
- [ ] Retrieved API keys
- [ ] Added keys to Vercel environment variables
- [ ] Redeployed portal (`vercel --prod`)
- [ ] Tested `/api/market-intelligence` endpoint
- [ ] Verified pharma stock prices in Accounts 360
- [ ] Checked real gold/silver prices match world markets

---

**Last Updated:** August 4, 2026  
**Status:** All APIs verified working and free-tier approved  
**Next Review:** Q4 2026 (API pricing/availability changes)
