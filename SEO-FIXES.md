# SEO Fixes - Google Search Console Redirect Issue

## Problem
Google Search Console reported "Page with redirect" for the following URLs:
- `http://www.dolardehoy.app/`
- `https://www.dolardehoy.app/`

These URLs should redirect to the canonical URL: `https://dolardehoy.app/`

## Solutions Applied

### 1. Redirect Configuration (next.config.ts)
Added redirects to ensure all www traffic redirects to non-www:
- `www.dolardehoy.app` → `dolardehoy.app`
- This uses a 301 permanent redirect for SEO benefit

### 2. Enhanced Security Headers
Added additional security headers:
- `Strict-Transport-Security`: Forces HTTPS connections
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Referrer-Policy`: Controls referrer information

### 3. Canonical URLs (app/layout.tsx)
Updated metadata to explicitly define:
- Canonical URL: `https://dolardehoy.app`
- Alternate language variants
- Proper Open Graph and Twitter Card metadata

## What This Fixes

✅ **Eliminates duplicate content**: All variants now redirect to one canonical URL
✅ **Improves SEO**: 301 redirects tell search engines which version is preferred
✅ **Fixes Google Search Console errors**: No more "Page with redirect" warnings
✅ **Enhances security**: Added HSTS and other security headers

## Next Steps

1. **Deploy these changes** to production
2. **Request re-indexing** in Google Search Console:
   - Go to URL Inspection tool
   - Enter `https://www.dolardehoy.app/`
   - Click "Request Indexing"
3. **Validate the fix** in Search Console:
   - Go to "Page indexing" → "Page with redirect"
   - Click "VALIDATE FIX" button
4. **Wait for Google to re-crawl** (typically 1-7 days)

## Important Notes

- HTTP → HTTPS redirects should be handled at the hosting provider level (Vercel, Cloudflare, etc.)
- The www → non-www redirect is now handled by Next.js
- Make sure your hosting provider is configured to:
  - Issue SSL certificates for both `dolardehoy.app` and `www.dolardehoy.app`
  - Redirect HTTP to HTTPS

## Testing

After deployment, test these URLs should all redirect to `https://dolardehoy.app/`:
- `http://www.dolardehoy.app/`
- `http://dolardehoy.app/`
- `https://www.dolardehoy.app/`
- `https://dolardehoy.app/` (should load normally, no redirect)
