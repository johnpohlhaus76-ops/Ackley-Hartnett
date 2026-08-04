# Ackley-Hartnett 10-Feature Implementation Roadmap

**Project**: Pharmaceutical Equipment Portal Enhancement  
**Timeline**: 3 Phases  
**Constraint**: Economical-only (no expensive infrastructure, reuse existing patterns)  
**Data**: 222 machines sold, 50+ customer plants, existing quotes/orders/POs

---

## PHASE 1: FOUNDATION (Data Infrastructure & Core Services)
*Estimated effort: 2-3 weeks | Dependencies: None*

These features build the data layer that all dashboards depend on.

### 1.1 Advanced Full-Text Search
**Why First**: Enables all subsequent dashboards to query data efficiently; unblocks customer lookup for other features.

| Aspect | Details |
|--------|---------|
| **Complexity** | Medium |
| **Files to Create** | `/src/lib/search.ts`, `/src/app/api/search/route.ts`, `/src/app/portal/search/page.tsx` |
| **Files to Modify** | `/src/components/Sidebar.tsx` (add search nav), `/src/lib/types.ts` (add SearchResult type) |
| **API Endpoint** | `POST /api/search` - accepts query, returns machines/customers/documents |
| **Data Sources** | machines-sold.json, accounts.json, quotes-2025.json, datasheets.json |
| **Tech Choices** | Trie-based indexing in memory (no DB needed), Lunr.js alternative, or simple string matching with scoring |
| **Page Path** | `/src/app/portal/search/page.tsx` |
| **Key Features** | - Full-text across serial #, customer, model, country, address - Faceted filters (country, status, date range) - Result grouping (machines, customers, documents) - Keyboard shortcuts (cmd+k) |
| **Estimated LOC** | 400 |

**Implementation Steps**:
```
1. Create search index builder from JSON data sources
2. Build API route with query → results logic
3. Create Search UI with filters & keyboard nav
4. Add to sidebar navigation
5. Test with sample queries (customer name, serial #, location)
```

---

### 1.2 Customer Health Score Engine
**Why First**: Powers Sales Pipeline, Plant Performance, and Smart Alerts dashboards.

| Aspect | Details |
|--------|---------|
| **Complexity** | Medium |
| **Files to Create** | `/src/lib/health-score.ts`, `/src/app/api/health-scores/route.ts` |
| **Files to Modify** | `/src/lib/types.ts` (add HealthScore interface) |
| **API Endpoint** | `GET /api/health-scores?customerId=X` - returns score + breakdown |
| **Data Sources** | machines-sold.json (install recency), quotes-2025.json (quote frequency), order history |
| **Tech Choices** | Weighted scoring algorithm: (1) machine recency (40%), (2) order frequency (30%), (3) quote-to-order rate (20%), (4) engagement level (10%) |
| **Scoring Logic** | 0-100 scale: 0-30 (at-risk), 31-70 (healthy), 71-100 (premium) |
| **Estimated LOC** | 250 |

**Scoring Breakdown**:
```typescript
health = (
  (daysSinceLastMachine / 1825) * -0.4 +  // Decay over 5 years
  (ordersLast12Months / avgOrderFreq) * 0.3 +
  (acceptedQuotes / sentQuotes) * 0.2 +
  (engagementScore / 100) * 0.1
) * 100
```

**Implementation Steps**:
```
1. Define HealthScore interface and scoring algorithm
2. Build aggregation logic from machines + quotes + orders
3. Create API endpoint with caching (1-hour TTL)
4. Add health score field to Account type
5. Test scoring with top 10 customers
```

---

### 1.3 Spare Parts Inventory Tracker Data Model
**Why First**: Data structure needed by Plant Performance and Order Status dashboards.

| Aspect | Details |
|--------|---------|
| **Complexity** | Low-Medium |
| **Files to Create** | `/src/lib/spare-parts.ts`, `/src/app/api/spare-parts/route.ts`, `/data/spare-parts-catalog.json` |
| **Files to Modify** | `/src/lib/types.ts` (add SparePart, PartInventory, MachinePartLink interfaces) |
| **Data Structure** | Part → MachineModel linkage; location-based inventory tracking |
| **Tech Choices** | JSON-based parts catalog + in-memory inventory by location (no DB migration needed) |
| **Data to Create** | Sample `spare-parts-catalog.json`: Part #, Name, Price, Applicable Models, Min Stock Level |
| **Estimated LOC** | 300 |

**Sample Data Structure**:
```json
{
  "parts": [
    {
      "partNumber": "AH-SEAL-001",
      "name": "Primary Seal Assembly",
      "price": 1250,
      "applicableModels": ["FB1", "FB2", "TB200"],
      "minStockLevel": 5
    }
  ],
  "inventory": {
    "location_USA_NJ": {
      "AH-SEAL-001": { "quantity": 12, "lastRestocked": "2026-07-15" },
      "AH-BELT-002": { "quantity": 3, "lastRestocked": "2026-05-20", "alert": true }
    }
  }
}
```

**Implementation Steps**:
```
1. Create JSON spare parts catalog (20-30 sample parts)
2. Build inventory tracking data model
3. Create API for parts by machine model / by location
4. Link parts to machines via model matching
5. Create low-stock alert logic
```

---

## PHASE 2: DASHBOARDS & INTELLIGENCE (Visual Analytics)
*Estimated effort: 3-4 weeks | Dependencies: Phase 1 complete*

### 2.1 Predictive Maintenance Alerts (High-Value Quick Win)
**Why Early**: Simple to build, high business value; flags at-risk machines.

| Aspect | Details |
|--------|---------|
| **Complexity** | Low |
| **Files to Create** | `/src/app/portal/maintenance-alerts/page.tsx`, `/src/lib/maintenance-logic.ts`, `/src/app/api/maintenance-alerts/route.ts` |
| **Files to Modify** | `/src/components/Sidebar.tsx` (add nav), `/src/lib/plant-operations.ts` (add alert methods) |
| **API Endpoint** | `GET /api/maintenance-alerts?days=365` - returns flagged machines |
| **Alert Triggers** | - Age > 15 years (flag: service due) - Not serviced in 24 months (flag: urgent) - Based on spare parts low stock (flag: parts shortage) |
| **Visualization** | Tailwind cards, status badges (green/yellow/red), location grouping |
| **Estimated LOC** | 280 |

**Alert Logic**:
```typescript
const alerts = machines.map(m => {
  const ageYears = (Date.now() - new Date(m.shipped).getTime()) / (365.25 * 86400000);
  const monthsSinceService = m.lastService ? ... : null;
  
  return {
    machine: m,
    risk: ageYears > 15 ? 'critical' : monthsSinceService > 24 ? 'high' : 'low',
    actions: ['Schedule service', 'Order spare parts', 'Contact customer']
  };
});
```

**Implementation Steps**:
```
1. Create alert classification logic (age, service date, parts)
2. Build API endpoint with filtering by country/customer
3. Design card UI with status colors (Tailwind)
4. Add filtering by risk level & machine model
5. Wire into dashboard
```

---

### 2.2 Sales Pipeline Dashboard (Core Revenue Feature)
**Why Early**: Central to sales ops; depends on Phase 1 health scores.

| Aspect | Details |
|--------|---------|
| **Complexity** | High |
| **Files to Create** | `/src/app/portal/sales-pipeline/page.tsx`, `/src/lib/sales-pipeline.ts`, `/src/app/api/sales-pipeline/route.ts`, `/src/components/SalesPipelineChart.tsx` |
| **Files to Modify** | `/src/lib/types.ts` (add PipelineStage, PipelineMetric types) |
| **API Endpoint** | `GET /api/sales-pipeline?period=12m` - returns Kanban-style data |
| **Visualization** | Kanban board (Draft → Sent → Accepted → Converted to Order), bar charts (conversion %), funnel chart |
| **Data Flow** | Quotes → Orders → Revenue; track time-in-stage & conversion rates |
| **Tech Choices** | Tailwind grid layout for Kanban, Recharts for conversion funnel, no external Kanban lib (keep economical) |
| **Estimated LOC** | 600 |

**Kanban Stages**:
```
DRAFT (quotes created)
  ↓
SENT (quotes issued to customer)
  ↓
ACCEPTED (customer approved)
  ↓
CONVERTED (quote became order)
  ↓
REVENUE (order completed/invoiced)
```

**Sample Metrics**:
- Draft → Sent: X% of quotes sent within 7 days
- Sent → Accepted: X% conversion rate (30-day window)
- Accepted → Converted: X% close rate (60-day window)
- Time-in-stage: avg days in each stage
- Top salespeople: conversion % by rep

**Implementation Steps**:
```
1. Build pipeline state aggregation (quote → order mapping)
2. Create API with period filtering (1m, 3m, 12m)
3. Design Kanban board UI (Tailwind columns)
4. Add conversion rate charts (Recharts)
5. Add time-in-stage analytics
6. Filter by salesperson / customer / region
```

---

### 2.3 Plant Performance Metrics Dashboard
**Why Mid-Phase**: Powers operational insights; depends on health scores + sales pipeline data.

| Aspect | Details |
|--------|---------|
| **Complexity** | High |
| **Files to Create** | `/src/app/portal/plant-performance/page.tsx`, `/src/lib/plant-performance.ts`, `/src/app/api/plant-metrics/route.ts`, `/src/components/PlantMetricsGrid.tsx` |
| **Files to Modify** | `/src/lib/types.ts` (add PlantMetrics interface) |
| **API Endpoint** | `GET /api/plant-metrics?sortBy=revenue&limit=50` - returns ranked plants |
| **Metrics** | Per-plant: machine count, order frequency (orders/year), order value (total YTD), revenue per location, utilization estimate, health score, contact responsiveness |
| **Visualization** | Sortable table, sparklines (order trend), color-coded health, maps with metric overlays |
| **Tech Choices** | Tailwind table, Recharts sparklines, Mapbox/Google Maps heatmap overlay (optional upgrade) |
| **Estimated LOC** | 500 |

**Metrics Definition**:
```typescript
interface PlantMetrics {
  plantId: string;
  plantName: string;
  country: string;
  machineCount: number;
  ordersYTD: number;
  ordersPerMachine: number;
  revenueYTD: number;
  avgOrderValue: number;
  healthScore: number;        // from Phase 1
  machineAgeAvg: number;
  lastOrderDate: string;
  daysInactive: number;
}
```

**Implementation Steps**:
```
1. Build metrics aggregation from machines + orders + health scores
2. Create API with sorting/filtering
3. Design metric cards with trend sparklines
4. Build sortable comparison table
5. Add geographic heatmap view (optional)
6. Wire filters (country, industry, min/max orders)
```

---

### 2.4 Smart Alerts (Operational Notifications)
**Why Mid-Phase**: Simple, high-value; depends on quote/order data being available.

| Aspect | Details |
|--------|---------|
| **Complexity** | Low-Medium |
| **Files to Create** | `/src/lib/smart-alerts.ts`, `/src/app/api/alerts/route.ts`, `/src/app/portal/alerts/page.tsx`, `/src/components/AlertCenter.tsx` |
| **Files to Modify** | `/src/components/Sidebar.tsx` (add alert badge), `/src/lib/types.ts` (add Alert type) |
| **Alert Types** | 1. Quote expiring (< 7 days) 2. Order shipped 3. Customer inactive (90+ days) 4. PO overdue 5. Low inventory parts |
| **Notification** | In-app center + optional email (via existing /api/email/send) |
| **Tech Choices** | Simple SQL-like filtering in-memory, no external alert service |
| **Estimated LOC** | 200 |

**Alert Rules**:
```typescript
const alerts = [
  // Quote expiry
  quotes.filter(q => daysUntilExpiry(q) < 7 && q.status === 'sent'),
  
  // Inactive customers
  customers.filter(c => daysSinceLastOrder(c) > 90 && c.orderCount > 0),
  
  // Order shipped
  orders.filter(o => o.status === 'shipped' && !o.notificationSent),
  
  // Low inventory
  spareParts.filter(p => p.location.quantity < p.minStockLevel)
];
```

**Implementation Steps**:
```
1. Define alert types and rules
2. Build alert generation logic with timestamp tracking
3. Create API endpoint for fetching alerts
4. Design alert center UI with dismiss/snooze actions
5. Add badge to sidebar (unread count)
6. Optional: wire up email notifications
```

---

### 2.5 Real-time Order & PO Status Tracker
**Why Mid-Phase**: Critical for order tracking; depends on order data structures from earlier.

| Aspect | Details |
|--------|---------|
| **Complexity** | Medium |
| **Files to Create** | `/src/app/portal/order-tracking/page.tsx`, `/src/lib/order-status.ts`, `/src/app/api/orders/status/route.ts`, `/src/components/OrderStatusTimeline.tsx` |
| **Files to Modify** | `/src/lib/types.ts` (enhance Order/PO types with timeline) |
| **API Endpoint** | `GET /api/orders/status?customerId=X&includeHistory=true` |
| **Status Flow** | Ordered → Confirmed → Shipped → In Transit → Received → Invoiced |
| **Visualization** | Timeline view per order, status badge, milestone dates, search/filter by order # or customer |
| **Tech Choices** | Tailwind timeline component, simple state machine for status flow |
| **Estimated LOC** | 350 |

**Status Timeline**:
```typescript
interface OrderTimeline {
  orderId: string;
  milestones: [
    { status: 'ordered', timestamp: string, completedBy?: string },
    { status: 'confirmed', timestamp: string, reference?: string },
    { status: 'shipped', timestamp: string, trackingNumber?: string },
    { status: 'delivered', timestamp: string, signature?: string },
    { status: 'invoiced', timestamp: string, invoiceNumber?: string }
  ];
  currentStatus: string;
  estimatedDelivery?: string;
}
```

**Implementation Steps**:
```
1. Enhance Order/PO types with timeline + milestones
2. Build status transition logic (allowed state flows)
3. Create API with order lookup + timeline history
4. Design vertical timeline UI (Tailwind)
5. Add search by order # / customer
6. Add bulk status export (for operations)
```

---

## PHASE 3: OUTPUTS (Reports & Document Generation)
*Estimated effort: 2-3 weeks | Dependencies: Phase 2 dashboards, Phase 1 data*

### 3.1 Custom Reporting Engine (PDF Export)
**Why Phase 3**: Depends on all metrics from earlier phases being available.

| Aspect | Details |
|--------|---------|
| **Complexity** | High |
| **Files to Create** | `/src/lib/report-generator.ts`, `/src/app/api/reports/generate/route.ts`, `/src/app/portal/reports/page.tsx`, `/src/components/ReportBuilder.tsx` |
| **Files to Modify** | `/src/lib/types.ts` (add Report, ReportConfig types) |
| **API Endpoint** | `POST /api/reports/generate` - accepts config, returns PDF buffer |
| **Report Types** | 1. Revenue by region 2. Top customers by volume 3. Machine utilization summary 4. Sales pipeline forecast 5. Spare parts usage 6. Customer health scorecard |
| **Tech Choices** | jsPDF + html2canvas (simple, no server rendering needed), Recharts for in-memory charts → canvas |
| **Estimated LOC** | 700 |

**Report Config Schema**:
```typescript
interface ReportConfig {
  type: 'revenue' | 'top-customers' | 'utilization' | 'pipeline' | 'spare-parts' | 'health-scorecard';
  period: '1m' | '3m' | '12m' | 'ytd';
  filters: {
    country?: string[];
    industry?: string[];
    minRevenue?: number;
    customerStatus?: 'active' | 'inactive' | 'all';
  };
  format: 'pdf' | 'csv';
  includeCharts: boolean;
  timestamp?: string;
}
```

**Sample Reports**:
1. **Revenue by Region**: Table + bar chart, YTD vs prior year
2. **Top 20 Customers**: Ranked by revenue + order count + health score
3. **Utilization**: Machines by age/status, service overdue count
4. **Sales Pipeline Forecast**: Stage-by-stage breakdown, conversion projections
5. **Spare Parts Usage**: Top 20 parts, by customer location, low-stock alerts

**Implementation Steps**:
```
1. Build report data aggregation (reuse dashboards queries)
2. Create HTML templates for each report type
3. Implement jsPDF + html2canvas export
4. Build report builder UI (filter selection)
5. Add caching for frequently-run reports
6. Test PDF rendering across browsers
```

---

### 3.2 Document Auto-Generation (Proposals, POs, Invoices)
**Why Last**: Highest complexity; depends on all prior data structures.

| Aspect | Details |
|--------|---------|
| **Complexity** | High |
| **Files to Create** | `/src/lib/document-generator.ts`, `/src/app/api/documents/generate/route.ts`, `/src/app/portal/documents/page.tsx`, `/src/components/DocumentEditor.tsx`, `/data/document-templates/` |
| **Files to Modify** | `/src/lib/types.ts` (add Document, Template types) |
| **API Endpoint** | `POST /api/documents/generate` - accepts template + data, returns PDF |
| **Template Types** | Proposal, PO, Invoice, Service Request, Quote Confirmation |
| **Tech Choices** | Template literals + jsPDF (handlebars optional if budget allows), pre-fill from quote/order data |
| **Estimated LOC** | 800 |

**Template Variables** (auto-populated):
```typescript
interface DocumentContext {
  // Company
  companyName: string;
  companyLogo: string;
  
  // Customer
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerEmail: string;
  
  // Quote/Order
  quoteNumber?: string;
  orderNumber?: string;
  date: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  
  // Terms
  paymentTerms: string;
  deliveryDate: string;
  notes?: string;
}
```

**Document Types**:

1. **Proposal Template** (Pre-quote):
   - Logo + header
   - Customer info block
   - Product list (from quote items)
   - Terms & conditions
   - Signature line

2. **Purchase Order Template**:
   - PO # + date
   - Ship-to address
   - Line items (part #, qty, price)
   - Subtotal / tax / total
   - Delivery date & instructions
   - Authorized signature block

3. **Invoice Template**:
   - Invoice # + date
   - Customer + billing address
   - Order # reference
   - Line items (desc, qty, unit price, total)
   - Payment terms
   - Bank details

**Implementation Steps**:
```
1. Create document template JSON schema
2. Build template library (3-5 sample templates)
3. Implement context variable substitution
4. Add PDF generation (jsPDF)
5. Create document editor UI with preview
6. Add revision tracking (v1.0, v1.1, etc.)
7. Wire signature capture (optional, manual for now)
8. Build document send/email integration
```

---

## IMPLEMENTATION ORDER & DEPENDENCIES

```
PHASE 1 (Weeks 1-3):
┌─────────────────────────────────────────┐
│ 1.1 Advanced Search                     │ ← Foundation for all queries
└──────────┬────────────────────────────────┘
           │
           ├─→ 1.2 Customer Health Scores  │ ← Used by Phase 2 dashboards
           │
           └─→ 1.3 Spare Parts Model      │ ← Used by Phase 2 metrics
           

PHASE 2 (Weeks 4-7):
┌──────────────────────────────────────────────────┐
│ 2.1 Maintenance Alerts (quick win)               │ (Low complexity, high value)
└──────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────┐
│ 2.2 Sales Pipeline Dashboard                     │ (Depends on Health Scores)
│ 2.3 Plant Performance Metrics                    │ (Depends on Health Scores)
│ 2.4 Smart Alerts                                 │ (Depends on data models)
│ 2.5 Order/PO Status Tracker                      │ (Depends on data models)
└──────────────────────────────────────────────────┘
           ↓ (Can run in parallel: 2.2-2.5)


PHASE 3 (Weeks 8-10):
┌──────────────────────────────────────────────────┐
│ 3.1 Custom Reporting                             │ (Depends on Phase 2 metrics)
│ 3.2 Document Auto-Generation                     │ (Depends on Phase 2 data)
└──────────────────────────────────────────────────┘
           ↓ (Can run in parallel)
```

---

## TECH STACK & REUSE DECISIONS

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Charts** | Recharts (already in ecosystem) | Lightweight, no D3 overhead, Tailwind-compatible |
| **PDF Generation** | jsPDF + html2canvas | No server deps, works in serverless, no cost |
| **Data Persistence** | JSON files + in-memory caching | No Prisma migration needed yet, economical |
| **Styling** | Tailwind (existing) | Consistent with codebase, no new CSS lib |
| **Icons** | lucide-react (existing) | Already available, 400+ icons |
| **Email** | nodemailer (existing) | Already wired in, no new service |
| **Search** | Trie/Lunr (no external API) | In-memory indexing, fast, no cost |
| **Alerting** | In-app center (no external service) | Wallet-friendly, visible to all users |

---

## FILE STRUCTURE SUMMARY

```
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts (NEW - 1.1)
│   │   ├── health-scores/route.ts (NEW - 1.2)
│   │   ├── spare-parts/route.ts (NEW - 1.3)
│   │   ├── maintenance-alerts/route.ts (NEW - 2.1)
│   │   ├── sales-pipeline/route.ts (NEW - 2.2)
│   │   ├── plant-metrics/route.ts (NEW - 2.3)
│   │   ├── alerts/route.ts (NEW - 2.4)
│   │   ├── orders/status/route.ts (NEW - 2.5)
│   │   ├── reports/generate/route.ts (NEW - 3.1)
│   │   └── documents/generate/route.ts (NEW - 3.2)
│   │
│   └── portal/
│       ├── search/page.tsx (NEW - 1.1)
│       ├── maintenance-alerts/page.tsx (NEW - 2.1)
│       ├── sales-pipeline/page.tsx (NEW - 2.2)
│       ├── plant-performance/page.tsx (NEW - 2.3)
│       ├── alerts/page.tsx (NEW - 2.4)
│       ├── order-tracking/page.tsx (NEW - 2.5)
│       ├── reports/page.tsx (NEW - 3.1)
│       └── documents/page.tsx (NEW - 3.2)
│
├── lib/
│   ├── search.ts (NEW - 1.1)
│   ├── health-score.ts (NEW - 1.2)
│   ├── spare-parts.ts (NEW - 1.3)
│   ├── maintenance-logic.ts (NEW - 2.1)
│   ├── sales-pipeline.ts (NEW - 2.2)
│   ├── plant-performance.ts (NEW - 2.3)
│   ├── smart-alerts.ts (NEW - 2.4)
│   ├── order-status.ts (NEW - 2.5)
│   ├── report-generator.ts (NEW - 3.1)
│   ├── document-generator.ts (NEW - 3.2)
│   ├── types.ts (MODIFY - add new types for all features)
│   └── plant-operations.ts (MODIFY - integrate with new modules)
│
├── components/
│   ├── SearchUI.tsx (NEW - 1.1)
│   ├── HealthScoreCard.tsx (NEW - 1.2)
│   ├── SalesPipelineChart.tsx (NEW - 2.2)
│   ├── PlantMetricsGrid.tsx (NEW - 2.3)
│   ├── AlertCenter.tsx (NEW - 2.4)
│   ├── OrderStatusTimeline.tsx (NEW - 2.5)
│   ├── ReportBuilder.tsx (NEW - 3.1)
│   ├── DocumentEditor.tsx (NEW - 3.2)
│   └── Sidebar.tsx (MODIFY - add nav for new pages, alert badge)
│
└── data/
    ├── spare-parts-catalog.json (NEW - 1.3)
    └── document-templates/ (NEW - 3.2)
        ├── proposal.json
        ├── purchase-order.json
        └── invoice.json
```

---

## ESTIMATED EFFORT SUMMARY

| Feature | Phase | LOC | Dev Time | Complexity |
|---------|-------|-----|----------|-----------|
| Advanced Search | 1 | 400 | 3 days | Medium |
| Health Scores | 1 | 250 | 2 days | Medium |
| Spare Parts Model | 1 | 300 | 2 days | Medium |
| Maintenance Alerts | 2 | 280 | 1 day | Low |
| Sales Pipeline Dashboard | 2 | 600 | 5 days | High |
| Plant Performance Metrics | 2 | 500 | 4 days | High |
| Smart Alerts | 2 | 200 | 2 days | Low-Medium |
| Order/PO Status Tracker | 2 | 350 | 3 days | Medium |
| Custom Reporting | 3 | 700 | 5 days | High |
| Document Auto-Gen | 3 | 800 | 6 days | High |
| **Total** | 1-3 | **4380** | **32-35 days** | — |

---

## KEY CONSTRAINTS & ECONOMICAL DESIGN CHOICES

1. **No External APIs**: Search, alerts, scoring all in-memory
2. **No Database Migrations**: Stays with JSON + cache, can add Prisma later
3. **Tailwind Only**: No Material-UI, Chakra, or other UI libs
4. **jsPDF for PDFs**: Avoids server rendering (Puppeteer, wkhtmltopdf cost)
5. **Recharts for Charts**: Included in AI SDK ecosystem, works with Tailwind
6. **Existing Email**: Reuses nodemailer, no SendGrid/Mailgun
7. **No Message Queue**: Alerts generated on-demand, sync execution
8. **Cache-First**: 1-hour TTL on expensive aggregations (health scores, metrics)

---

## SUCCESS METRICS

- **Phase 1 Complete**: All 10 features can query unified data layer
- **Phase 2 Complete**: 5 dashboards live with real data, <2s load time
- **Phase 3 Complete**: Users can generate PDFs, auto-fill docs without manual entry
- **Economical**: <$100/mo hosting costs, no third-party services beyond existing

---

## NEXT STEPS

1. **Week 1 Kickoff**: Start with Advanced Search (1.1) + Health Scores (1.2) in parallel
2. **Week 2**: Complete Spare Parts (1.3), begin Phase 2 dashboards (2.1)
3. **Week 3-4**: Build 2.2-2.5 dashboards in parallel
4. **Week 5+**: Phase 3 reporting & docs

**Start with Search** because it unblocks other teams to build dashboards independently.
