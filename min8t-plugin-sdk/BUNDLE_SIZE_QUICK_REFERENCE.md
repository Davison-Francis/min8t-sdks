# Bundle Size Monitoring - Quick Reference

**Last Updated**: 2025-10-26

---

## Current Bundle Status 📊

| Bundle | Raw | Gzipped | Brotli | Budget | Status |
|--------|-----|---------|--------|--------|--------|
| **Modern** | 7.43 KB | 2.54 KB | 2.14 KB | 500 KB | ✅ **1.52%** |
| **Legacy** | 9.93 KB | 3.28 KB | 2.79 KB | 500 KB | ✅ **2.03%** |

**Savings**: Modern bundle is **25.2% smaller** (used by 97% of users)

---

## Quick Commands

```bash
# Build with automatic metric export
npm run build

# View bundle size report
npm run bundle:report

# View differential loading report
npm run differential:report

# Check bundle size only
npm run size

# Analyze bundle composition
npm run build:analyze
```

---

## Build Pipeline Flow

```
npm run build
    │
    ├─> webpack (builds bundles)
    ├─> check-bundle-size.js (validates)
    │   └─> dist/bundle-sizes.json ✅
    │
    └─> update-bundle-metadata.js
        └─> package.json bundleSize ✅
```

**Result**: Metrics auto-update within **100ms** (file watch)

---

## Budget Limits

| Metric | Warning | Error | Current | Status |
|--------|---------|-------|---------|--------|
| **Raw** | 400 KB | 500 KB | 7.43 KB | ✅ |
| **Gzipped** | 80 KB | 100 KB | 2.54 KB | ✅ |

**Utilization**: 1.52% (Modern) / 2.03% (Legacy)

---

## What Happens on Build

1. ✅ Webpack builds modern + legacy bundles
2. ✅ check-bundle-size.js validates sizes
3. ✅ bundle-sizes.json generated in `dist/`
4. ✅ package.json bundleSize metadata updated
5. ✅ Backend file watch triggers (if running)
6. ✅ Prometheus metrics updated (<100ms)

---

## CI/CD Integration

**On Pull Request**:
- ✅ Builds bundles
- ✅ Compares with base branch
- ✅ Posts PR comment with size changes
- ❌ **Fails build if budget exceeded**

**Example PR Comment**:
```markdown
## 📦 Bundle Size Report
Modern: 7.43 KB (+0.05 KB, +0.7%)
Legacy: 9.93 KB (+0.12 KB, +1.2%)
Budget: 500 KB ✅
```

---

## Prometheus Metrics

**Endpoint**: `http://localhost:3000/metrics`

**Available Metrics**:
```promql
plugin_bundle_size_bytes{version="1.0.0",compression="none"}
plugin_bundle_size_bytes{version="1.0.0",compression="gzip"}
plugin_bundle_size_bytes{version="1.0.0",compression="brotli"}
```

**Example Queries**:
```promql
# Budget utilization
(plugin_bundle_size_bytes{compression="none"} / 512000) * 100

# Compression ratio
(1 - (plugin_bundle_size_bytes{compression="gzip"} / plugin_bundle_size_bytes{compression="none"})) * 100
```

---

## Alerts 🚨

| Alert | Severity | Trigger |
|-------|----------|---------|
| **BundleSizeBudgetExceeded** | 🔴 Critical | > 500KB |
| **BundleSizeRegression** | 🔴 Critical | > 10% increase |
| **BundleSizeApproachingBudget** | 🟡 Warning | > 400KB (80%) |
| **BundleSizeIncrease** | 🟡 Warning | > 5% increase |

---

## Troubleshooting

### Build Fails: "Bundle exceeds size limit"

**Solution**:
1. Run `npm run build:analyze` to identify large dependencies
2. Remove unused imports
3. Check for duplicate dependencies
4. Use dynamic imports for non-critical features

### Metrics Not Updating

**Solution**:
1. Verify `dist/bundle-sizes.json` exists
2. Check backend logs for "[Metrics] Updated bundle size..."
3. Restart backend service
4. Verify `BUNDLE_UPDATE_INTERVAL` env variable

### PR Comment Missing

**Solution**:
1. Ensure PR affects `frontend/**` files
2. Check GitHub Actions workflow status
3. Verify workflow permissions
4. Check CI/CD logs for errors

---

## File Locations

| File | Purpose |
|------|---------|
| `frontend/dist/bundle-sizes.json` | Exported metrics (auto-generated) |
| `frontend/package.json` | Bundle metadata |
| `frontend/scripts/check-bundle-size.js` | Validation + export |
| `frontend/scripts/update-bundle-metadata.js` | Metadata updater |
| `frontend/scripts/bundle-report.js` | Comprehensive report |
| `frontend/scripts/differential-report.js` | Modern vs legacy comparison |
| `src/monitoring/PerformanceMetrics.ts` | Auto-update logic |
| `prometheus/bundle-size-alerts.yml` | Alert rules |
| `.github/workflows/bundle-size-tracking.yml` | CI/CD automation |

---

## Optimization Tips

### Keep Bundle Small
✅ **DO**:
- Use tree-shaking (webpack already configured)
- Import only what you need: `import { method } from 'library'`
- Use dynamic imports for non-critical features
- Minimize dependencies
- Use minification (already enabled)

❌ **DON'T**:
- Import entire libraries: `import _ from 'lodash'` ❌
- Add large dependencies without review
- Duplicate code across modules
- Include development dependencies in production

### Monitor Regularly
- Check `npm run bundle:report` after adding dependencies
- Review bundle analyzer before merging
- Watch for incremental growth over time
- Alert team if size increases >5%

---

## Browser Compatibility

### Modern Bundle (ES2015+) - 97% of Users
- ✅ Chrome 61+ (Sept 2017)
- ✅ Safari 11+ (Sept 2017)
- ✅ Firefox 60+ (May 2018)
- ✅ Edge 16+ (Sept 2017)

### Legacy Bundle (ES5) - 3% of Users
- ⚠️ Internet Explorer 11
- ⚠️ Older browsers

**HTML Usage**:
```html
<!-- Modern (97% of users, 25% smaller) -->
<script type="module" src="/dist/min8t.modern.js"></script>

<!-- Legacy (3% of users, fallback) -->
<script nomodule src="/dist/min8t.legacy.js"></script>
```

---

## Performance Impact

**Network Savings** (Modern vs Legacy):
- Raw: **-2.5 KB** (25.2% smaller)
- Gzipped: **-760 B** (22.6% smaller)
- Brotli: **-665 B** (23.3% smaller)

**Monthly Bandwidth Savings**:
- 10,000 users: **7.03 MB**
- 100,000 users: **70.3 MB**
- 1,000,000 users: **703 MB**

---

## Need Help?

**Documentation**:
- Full implementation: `FIX_25_SUMMARY.md`
- Verification report: `FIX_25_VERIFICATION.md`
- Status overview: `BUNDLE_METRICS_STATUS.md`

**Common Questions**:
1. **How often do metrics update?**
   - Immediately on build (file watch, <100ms)
   - Every 5 minutes (periodic refresh)
   - On service startup

2. **Where are metrics stored?**
   - `frontend/dist/bundle-sizes.json` (generated on build)
   - `package.json` bundleSize section
   - Prometheus metrics endpoint

3. **What triggers CI/CD bundle checks?**
   - Pull requests affecting `frontend/**`
   - Pushes to `main` or `develop`

4. **Can I disable automatic updates?**
   - Not recommended, but set `BUNDLE_UPDATE_INTERVAL=999999999` (11 days)

---

**Quick Status Check**:
```bash
# Build and check everything
cd services/15_plugin_sdk_service/frontend
npm run build && npm run bundle:report

# Expected: ✅ All checks pass, metrics exported
```

---

*Quick Reference Card - Bundle Size Monitoring*
*Updated: 2025-10-26*
