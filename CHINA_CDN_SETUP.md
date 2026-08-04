# China CDN Configuration Guide

## Current Status
- ✅ Vercel Global (fast in most regions)
- ⚠️ Mainland China (blocked/slow)

## Solution: Cloudflare China Optimization

Cloudflare provides the best balance of **cost, ease, and China performance** without ICP license requirements.

---

## **Option 1: Cloudflare (Recommended - No Business Registration Needed)**

### Step 1: Set Up Cloudflare
1. Go to https://dash.cloudflare.com/
2. Sign up (free account is fine)
3. Click "Add a site"
4. Enter domain: `ackley-hartnett-portal.vercel.app`
5. Select **Free Plan**
6. Update nameservers at your domain registrar

### Step 2: Configure for China
1. In Cloudflare Dashboard → **Caching**
   - Set "Cache Level" to **Cache Everything**
   - Set "Browser Cache TTL" to **30 minutes**

2. Go to **Speed** → **Optimization**
   - Enable "Brotli compression"
   - Enable "Early Hints"
   - Enable "Minify" (HTML, CSS, JS)

3. Go to **Rules** → **Page Rules**
   - Add rule: `*ackley-hartnett-portal.vercel.app/*`
   - Set cache level to "Cache Everything"
   - Browser cache TTL: 30 minutes

4. Go to **Network** settings:
   - Enable "HTTP/2 to Origin"
   - Enable "0-RTT Connection Resumption"

### Step 3: Monitor China Performance
- Use **Cloudflare Analytics** to monitor China traffic
- Check latency from China regions

---

## **Option 2: Alibaba Cloud CDN (Best for Mainland China - Requires ICP)**

If you plan to register a business in China or already have one:

1. Get ICP License (requires Chinese business registration)
2. Go to Alibaba Cloud: https://www.aliyun.com/product/cdn
3. Set up CDN domain
4. Origin: `ackley-hartnett-portal.vercel.app`
5. Configure regional nodes for China

**Cost:** ~$20-50/month  
**Performance:** 95ms average from China

---

## **Option 3: Tencent Cloud CDN (Alternative to Alibaba)**

Similar to Alibaba, also requires ICP:

1. Register with Tencent Cloud: https://cloud.tencent.com/
2. Apply for CDN service
3. Point domain to Tencent CDN nodes
4. Origin: Vercel

**Cost:** ~$15-40/month  
**Performance:** ~90ms average from China

---

## **Comparison**

| Feature | Cloudflare | Alibaba | Tencent |
|---------|-----------|---------|---------|
| Setup Time | 5 minutes | 2-4 weeks | 2-4 weeks |
| ICP License Required | ❌ No | ✅ Yes | ✅ Yes |
| China Performance | Good (200-400ms) | Excellent (80-120ms) | Excellent (80-120ms) |
| Cost | Free-$200/mo | $20-50/mo | $15-40/mo |
| No Business Registration | ✅ Yes | ❌ No | ❌ No |

---

## **Recommended Path**

### **Immediate (This Week):**
1. ✅ Set up **Cloudflare** (free, no registration needed)
2. ✅ Test from China using VPN or China speed test: https://www.webpagetest.com/
3. Monitor performance in Cloudflare Analytics

### **Future (If Performance Not Sufficient):**
- Evaluate **Alibaba Cloud CDN** or **Tencent Cloud CDN**
- Requires Chinese business registration + ICP license
- Provides 30-50% better performance in mainland China

---

## **Testing China Access**

After Cloudflare setup, test with:

1. **WebPageTest** (China locations):
   - https://www.webpagetest.com/
   - Select China locations (Shanghai, Beijing, Guangzhou)
   - Test URL: `https://ackley-hartnett-portal.vercel.app`

2. **China Speed Test Services:**
   - https://www.17ce.com/ (测速网)
   - https://www.boce.com/ (博彩网)

3. **Expected Results:**
   - Without optimization: 1000ms+ from China
   - With Cloudflare: 300-500ms from China
   - With Alibaba/Tencent: 100-200ms from China

---

## **Implementation Checklist**

- [ ] Create Cloudflare account
- [ ] Add domain to Cloudflare
- [ ] Update nameservers at registrar
- [ ] Configure caching rules
- [ ] Enable optimizations (Brotli, Early Hints)
- [ ] Test from China using WebPageTest
- [ ] Monitor Cloudflare Analytics
- [ ] (Optional) Apply for ICP license for better performance

---

## **Need Help?**

1. **Domain issues?** Make sure nameservers are updated (can take 24-48 hours)
2. **Still slow?** Check Cloudflare analytics for cache hit rate
3. **Want full ICP solution?** Let me know and we can explore Alibaba/Tencent setup

---

## **Current Site Status**

- **Domain:** ackley-hartnett-portal.vercel.app
- **Origin:** Vercel Global Edge Network
- **China Status:** ⚠️ Available but optimized for international traffic

After Cloudflare setup:
- **China Status:** ✅ Optimized with edge caching

After ICP + Alibaba/Tencent:
- **China Status:** 🚀 Full mainland China optimization
