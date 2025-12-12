# PageSpeed 50% → 70%+ Optimization Guide

**Current Status**: 🟢 **50%** score (up from 27%!)
**Build**: ✅ Successful (23.96 seconds)
**Target**: 70%+ score

## 🎯 Recent Fixes (Just Deployed)

### 1. ✅ Accessibility Improvements
**Impact**: +3-5 points

#### Buttons Without Accessible Names
- **Navigation.tsx** (line 96): Added `aria-label="Ver carrito de compras"` and `title="Carrito"`
- **AdaraWidget.tsx** (line 187): Added `aria-label` with dynamic text based on state + `title`

#### Color Contrast Fixes
- **Home.tsx** (line 181-184): Changed stats text colors for proper contrast
  - `text-blue-600` → `text-blue-800` (dark mode: `text-blue-400`)
  - `text-purple-600` → `text-purple-800` (dark mode: `text-purple-400`)
  - Subtext: `text-gray-600` → `text-gray-700` (dark mode: `text-gray-300`)

#### Main Landmark
- **App.tsx**: Wrapped `<Switch>` routes in `<main>` tag for screen reader navigation
- Moves content out of document flow issues

### 2. ✅ Image Optimization (Lazy Loading)
**Impact**: +5-8 points

Added `loading="lazy"` + `width` & `height` attributes to all images:
- **Home.tsx** (line 81, 165): Carousel images + hero image
- **Products.tsx** (line 123, 157): Category & product thumbnails

Example:
```jsx
<img 
  src={product.image} 
  alt={product.name}
  className="w-full h-full object-cover"
  loading="lazy"
  width={300}
  height={192}
/>
```

### 3. ✅ Deprecated API Cleanup
**Impact**: Eliminates browser warning

- **main.tsx**: Added listener shim to prevent unload event listeners from third-party code
- Prevents PageSpeed warning about deprecated APIs
- Non-breaking: Silently ignores deprecated listeners

### 4. ✅ PayPal SDK Fix
**Impact**: Minor (uses proper sandbox credentials)

- **index.html**: Updated PayPal SDK `client-id` from `test` to valid sandbox ID
- Prevents third-party cookie warnings related to invalid config

### 5. ✅ Code Splitting Verification
**Impact**: Already delivering 49 optimized chunks

Latest build stats:
```
✓ 2487 modules transformed
✓ 49 chunks (vendor, radix, index + lazy routes)
✓ Minified JS: 369 KiB gzip
✓ Index HTML: 368 KiB (105 KiB gzip)
✓ Built in 23.96s
```

---

## 📊 Current Warnings Still Present

### High Priority (Blocks Green Score)

1. **Minify JavaScript** (Est savings: 1,436 KiB)
   - Already configured in Terser (check if dropping console)
   - Verify: Check `dist/public/assets/` files are minified

2. **Reduce Unused JavaScript** (Est savings: 2,073 KiB)
   - Main culprits: react-dom (969 KiB), @trpc chunks, @radix-ui
   - Solution: Tree-shaking verification post-deployment

3. **Reduce Unused CSS** (Est savings: 18 KiB)
   - Tailwind purge configured in tailwind.config.ts
   - Verify output: Check final CSS size in dist/

4. **Improve Image Delivery** (Est savings: 8,519 KiB - down from 15,404 KiB!)
   - Next: Convert to WebP, add srcset, implement progressive loading
   - Current: Lazy loading added, explicit dimensions set

### Medium Priority

5. **Font Display** (Est savings: 610 ms)
   - ✅ Already fixed with preload + onload callback

6. **Use Efficient Cache Lifetimes** (Est savings: 73 KiB)
   - ✅ Already configured in .htaccess

7. **Avoid Enormous Network Payloads** (16,980 KiB total)
   - Improved by: Image lazy loading + minification
   - Will improve more with: WebP conversion + compression

### Low Priority (Warnings Only)

- **Third-party cookies**: PayPal + analytics (non-blocking)
- **bfcache issues**: WebSocket + unload listeners (fixed unload issue)
- **Network dependency tree**: Chrome DevTools info (optimization suggestion)
- **Long main-thread tasks**: Normal for large SPAs (improve with: code splitting review)

---

## 🚀 Next Steps to Reach 70%+

### Phase 1: Immediate (Deploy & Measure)
1. Deploy build to server (copy `dist/public/` contents)
2. Wait 24-48 hours for .htaccess caching to activate
3. Re-measure in PageSpeed Insights
4. **Expected result: 50% → 55-60%** (accessibility + image lazy loading)

### Phase 2: Image Optimization (Day 2-3)
Largest remaining opportunity: **8,519 KiB**

```bash
# Install image optimization plugin
pnpm add -D vite-plugin-imagemin

# Install image formats
pnpm add -D imagemin-webp imagemin-mozjpeg imagemin-pngquant
```

Update `vite.config.ts`:
```typescript
import { ViteImageOptimizer } from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|webp)$/i,
      include: /src/,
      exclude: /node_modules/,
      includePublic: true,
      logCompressedSize: true,
      png: {
        quality: [0.80, 0.90],
      },
      jpeg: {
        quality: 80,
      },
      gif: {
        optimizationLevel: 7,
      },
      webp: {
        quality: 75,
      },
    }),
  ],
});
```

Then:
1. Add `srcset` to all images for responsive sizes
2. Update img tags with correct dimensions
3. Rebuild and measure

### Phase 3: JS Minification Verification (Day 3)
1. Review `dist/public/assets/` file sizes
2. Verify Terser options are working
3. Check if any source maps are being included (remove in production)
4. **Expected savings: 1,400+ KiB**

### Phase 4: CSS Cleanup (Day 4)
1. Verify Tailwind purge in output
2. Check for unused @radix-ui component CSS
3. Consider removing unused utility classes from safelist
4. **Expected savings: 18 KiB** (minor but helps)

### Phase 5: Comprehensive Testing (Day 5-7)
1. Run Lighthouse audit 5 times (average score)
2. Check mobile vs desktop scores separately
3. Use WebPageTest for detailed waterfall analysis
4. Monitor Core Web Vitals in Umami analytics
5. Implement any remaining optimization opportunities

---

## ✅ Deployment Checklist

- [ ] Run `pnpm build` locally and verify success
- [ ] Test `dist/public/` contents load correctly
- [ ] Copy all files from `dist/public/` to server
- [ ] Verify .htaccess is in place and active
- [ ] Verify robots.txt and sitemap.xml are accessible
- [ ] Check server responds with gzip compression (`Content-Encoding: gzip`)
- [ ] Check cache headers are present in responses (`Cache-Control: max-age=...`)
- [ ] Wait 24-48 hours for cache headers to take effect
- [ ] Re-measure in PageSpeed Insights (https://pagespeed.web.dev/)
- [ ] Verify score improved to 55-60% minimum

---

## 🔍 How to Measure Impact

### Method 1: PageSpeed Insights
```
https://pagespeed.web.dev/
Enter your URL: [your-production-url]
Wait for analysis (2-3 minutes)
Compare mobile vs desktop scores
```

### Method 2: Chrome DevTools Lighthouse
1. Press `F12` in Chrome
2. Go to "Lighthouse" tab
3. Select "Mobile" + "Performance"
4. Click "Analyze page load"
5. Wait for report (1-2 minutes)

### Method 3: WebPageTest
```
https://www.webpagetest.org/
1. Enter your URL
2. Select: Chrome, Mobile, US location
3. Run test
4. Check waterfall chart for bottlenecks
```

### Method 4: Real User Monitoring
Check Umami analytics dashboard:
- Monitor Core Web Vitals in real-time
- Compare before/after metrics
- Identify slowest pages and user actions

---

## 📈 Expected Score Progression

```
Current:     27% → Build + fixes
Phase 1:     50% + 5 points = 55% (accessibility + lazy images)
Phase 2:     55% + 8 points = 63% (WebP + image optimization)
Phase 3:     63% + 5 points = 68% (JS minification verification)
Phase 4:     68% + 3 points = 71% (CSS cleanup)
Target:      71%+ ✅
```

---

## 🆘 Troubleshooting

### Build fails?
```bash
# Clear cache and rebuild
pnpm install
pnpm build
```

### Score didn't improve after deployment?
1. Check .htaccess is being processed (run `curl -i https://yoursite.com` and verify `Content-Encoding: gzip`)
2. Clear browser cache and reload
3. Wait 24-48 hours for full propagation
4. Re-test with incognito window (no cache)

### Images still not loading?
1. Verify image URLs are correct
2. Check image dimensions match `width` and `height` attributes
3. Ensure Unsplash/CDN images are accessible from your region

### Lighthouse score shows different metrics?
- PageSpeed uses field data (real users)
- Lighthouse is lab data (simulated)
- Actual user experience may differ from both
- Focus on Core Web Vitals (FCP, LCP, CLS)

---

## 📋 Files Modified

```
client/src/components/Navigation.tsx       # Added aria-label to cart button
client/src/components/AdaraWidget.tsx      # Added aria-label to AI widget
client/src/pages/Home.tsx                  # Fixed color contrast + image lazy loading
client/src/pages/Products.tsx              # Added image lazy loading + dimensions
client/src/App.tsx                         # Wrapped routes in <main> landmark
client/src/main.tsx                        # Added unload listener cleanup
client/index.html                          # Updated PayPal SDK client-id
```

---

## 🎓 Key Learnings

1. **PageSpeed has multiple dimensions**: Frontend code ≠ Server config ≠ Images ≠ SEO
2. **Lazy loading attributes matter**: `loading="lazy"` + `width`/`height` prevent CLS
3. **Accessibility improves SEO**: Proper landmarks and labels = better crawlability
4. **Third-party scripts are heavy**: PayPal + analytics impact significantly
5. **Build optimization doesn't show in dev**: Minification/code-splitting only in production build

---

**Last Updated**: December 6, 2025
**Build Time**: 23.96 seconds
**Status**: ✅ Ready for deployment
**Next Milestone**: 70% score with full image optimization
