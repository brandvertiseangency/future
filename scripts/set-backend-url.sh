#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Usage: ./scripts/set-backend-url.sh https://your-new-railway-url.up.railway.app
#
# Updates the Railway backend URL in:
#   1. frontend/vercel.json  (rewrite destination)
#   2. .env.local            (NEXT_PUBLIC_API_URL for local dev — optional)
# ──────────────────────────────────────────────────────────────────────────────
set -e

if [ -z "$1" ]; then
  echo "❌  Usage: $0 <new-railway-url>"
  echo "    Example: $0 https://future-production.up.railway.app"
  exit 1
fi

NEW_URL="${1%/}"   # strip trailing slash
VERCEL_JSON="frontend/vercel.json"

echo "🔄  Updating $VERCEL_JSON ..."
# Replace the destination line (works with BSD sed on macOS)
sed -i '' "s|\"destination\": \"https://.*\.up\.railway\.app/api/:\*\"|\"destination\": \"${NEW_URL}/api/:path*\"|g" "$VERCEL_JSON"

echo "✅  vercel.json updated:"
grep "destination" "$VERCEL_JSON"

echo ""
echo "📋  Next steps:"
echo "   1. In Vercel Dashboard → Settings → Environment Variables:"
echo "      Set NEXT_PUBLIC_API_URL = ${NEW_URL}"
echo "   2. Commit & push this change:"
echo "      git add frontend/vercel.json && git commit -m 'Update Railway backend URL' && git push"
echo "   3. Vercel will auto-redeploy."
