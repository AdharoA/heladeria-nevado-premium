# 🚀 DEPLOYMENT CHECKLIST - PageSpeed 50% Optimization

**Date**: December 6, 2025  
**Status**: ✅ Ready for Production  
**Target Score**: 55-60% (immediately), 70%+ (with Phase 2)

---

## Pre-Deployment Verification ✅

- [x] Build completed successfully (23.96s)
- [x] No compilation errors
- [x] 2487 modules processed correctly
- [x] 49 optimized chunks generated
- [x] All TypeScript checks passed
- [x] Code modified files compile without errors

## Files Modified (Ready to Deploy)

```
✅ client/src/components/Navigation.tsx       (aria-label added)
✅ client/src/components/AdaraWidget.tsx      (aria-label + dynamic label)
✅ client/src/pages/Home.tsx                  (color contrast + lazy loading)
✅ client/src/pages/Products.tsx              (image lazy loading + dimensions)
✅ client/src/App.tsx                         (<main> landmark added)
✅ client/src/main.tsx                        (unload listener cleanup)
✅ client/index.html                          (PayPal SDK updated)
✅ dist/public/                               (entire build output ready)
```

## Deployment Steps

### Step 1: Backup Current Production
```bash
# On your server
cp -r /path/to/public /path/to/public.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 2: Transfer New Build
```bash
# Option A: Direct file copy (if local access)
cp -r /local/path/dist/public/* /server/path/public/

# Option B: Via FTP/SFTP
# Upload entire dist/public/ directory contents

# Option C: Via Git (if using git deployment)
git pull origin main
pnpm build
```

### Step 3: Verify Transfer
```bash
# Check critical files are in place
ls -la /path/to/public/index.html
ls -la /path/to/public/robots.txt
ls -la /path/to/public/sitemap.xml
ls -la /path/to/public/.htaccess
```

### Step 4: Verify Server Configuration

```bash
# Test gzip compression is working
curl -I -H "Accept-Encoding: gzip" https://yoursite.com/
# Should show: Content-Encoding: gzip

# Verify cache headers
curl -I https://yoursite.com/assets/index-*.js
# Should show: Cache-Control: max-age=31536000, public, immutable

# Verify HTML is not cached aggressively
curl -I https://yoursite.com/
# Should show: Cache-Control: max-age=3600, must-revalidate
```

### Step 5: Wait for Propagation
⏱️ **WAIT 24-48 HOURS** for:
- DNS propagation
- .htaccess directives to take effect
- Browser cache updates
- CDN refresh (if using CloudFlare)

### Step 6: Test & Measure

#### Quick Test
```bash
# Check page loads quickly
curl -w "@curl-format.txt" -o /dev/null -s https://yoursite.com/
```

#### Measure in PageSpeed Insights
1. Go to: https://pagespeed.web.dev/
2. Enter your production URL
3. Wait 2-3 minutes for analysis
4. **Expected score: 55-60% minimum**

#### Chrome Lighthouse (Alternative)
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Compare with previous measurements

#### Real User Monitoring
1. Open Umami analytics dashboard
2. Check Core Web Vitals over time
3. Monitor FCP, LCP, CLS metrics
4. Compare day-over-day improvements

## Post-Deployment Checklist

### Immediate (First 24 hours)
- [ ] Site loads without errors
- [ ] All pages render correctly
- [ ] Images load properly (lazy loading working)
- [ ] Cart and checkout function normally
- [ ] Admin dashboard accessible
- [ ] No console errors in DevTools
- [ ] Mobile responsive design intact

### Validation (After 24-48 hours)
- [ ] gzip compression active on all files
- [ ] Cache headers present on responses
- [ ] 404 errors don't exist for valid pages
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] HTTPS certificate valid

### Performance Measurement (After 48 hours)
- [ ] PageSpeed Insights score improved
- [ ] Accessibility issues resolved (from ~10 to 0-2)
- [ ] Image delivery section improved
- [ ] Cache policy section shows positive feedback
- [ ] Core Web Vitals improving in real-time

## Rollback Plan (If Needed)

```bash
# If something goes wrong
rm -rf /path/to/public/*
cp -r /path/to/public.backup.YYYYMMDD_HHMMSS/* /path/to/public/

# Restart web server
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

---

## Files to Keep an Eye On

### Critical for SEO/Performance
- `dist/public/index.html` - Entry point (verify 105 KiB gzip)
- `dist/public/assets/index-*.js` - Main bundle (verify minified)
- `dist/public/assets/index--*.css` - Tailwind CSS
- `dist/public/.htaccess` - Server config (verify exists)
- `dist/public/robots.txt` - SEO file
- `dist/public/sitemap.xml` - Site map

### Verify Not Missing
```bash
# These must exist in production
test -f /path/to/public/.htaccess && echo "✓ .htaccess exists" || echo "✗ .htaccess missing"
test -f /path/to/public/robots.txt && echo "✓ robots.txt exists" || echo "✗ robots.txt missing"
test -f /path/to/public/sitemap.xml && echo "✓ sitemap.xml exists" || echo "✗ sitemap.xml missing"
test -f /path/to/public/index.html && echo "✓ index.html exists" || echo "✗ index.html missing"
```

---

## Expected Improvements

### Immediate (After Deploy + 48h Propagation)
```
Score: 27% → 50% (current) → 55-60% (with new fixes)

Improvements:
- Accessibility: +3-5 points (buttons, main landmark, contrast)
- Images: +2-3 points (lazy loading, dimensions)
- Deprecated APIs: +1-2 points (unload listener cleanup)
- Total: +6-10 points
```

### Phase 2 (With Image Optimization - Day 5-7)
```
Score: 60% → 70%+

Additional improvements:
- WebP conversion: +5-8 points
- JS minification: +3-4 points
- CSS cleanup: +1-2 points
- Total: +9-14 points
```

---

## Troubleshooting

### Pages Show Old Version
**Cause**: Browser cache or CDN  
**Solution**:
1. Wait another 24 hours
2. Hard refresh browser: `Ctrl+Shift+R` (Chrome/Firefox) or `Cmd+Shift+R` (Mac)
3. Clear CloudFlare cache if using CDN
4. Check HTTP headers show new content

### gzip Not Working
**Check**: `curl -I -H "Accept-Encoding: gzip" https://yoursite.com/`  
**Should show**: `Content-Encoding: gzip`  
**If missing**:
1. Verify Apache has mod_deflate enabled
2. Check .htaccess is in public root
3. Restart Apache: `sudo systemctl restart apache2`

### Images Not Lazy Loading
**Verify**:
1. Open DevTools → Network tab
2. Reload page
3. Scroll down
4. Images below fold should load on scroll
**If not**:
1. Check browser support (lazy loading works in 95%+ browsers)
2. Verify HTML has `loading="lazy"` attribute
3. Try incognito window (no browser extensions)

### Cache Headers Not Applied
**Check**: `curl -I https://yoursite.com/assets/index-*.js`  
**Should show**: `Cache-Control: max-age=31536000`  
**If missing**:
1. Verify .htaccess has FilesMatch rules
2. Check Apache mod_headers is enabled
3. Restart web server

---

## Success Metrics

✅ **Deployment Successful When**:
- Site loads without 404 errors
- All images display correctly
- Console shows no errors
- PageSpeed score improved minimum +5 points
- gzip compression active
- Cache headers present

---

## Support & Resources

- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Lighthouse Docs**: https://developers.google.com/web/tools/lighthouse
- **Core Web Vitals**: https://web.dev/vitals/
- **Apache Caching Guide**: https://httpd.apache.org/docs/2.4/mod/mod_expires.html

---

**Last Updated**: December 6, 2025  
**Deploy Status**: 🟢 Ready  
**Estimated Time to Deploy**: 15-30 minutes  
**Estimated Time to See Results**: 48 hours  
**Expected Score**: 55-60% minimum
