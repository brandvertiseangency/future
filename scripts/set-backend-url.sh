#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Usage: ./scripts/set-backend-url.sh https://your-backend.vercel.app
#
# Updates the backend Vercel URL in frontend/vercel.json
# ──────────────────────────────────────────────────────────────────────────────
set -e

if [ -z "$1" ]; then
  echo "❌  Usage: $0 <backend-vercel-url>"
  echo "    Example: $0 https://brandvertise-backend.vercel.app"
  exit 1
fi

NEW_URL="${1%/}"
VERCEL_JSON="frontend/vercel.json"

echo "🔄  Updating $VERCEL_JSON ..."
sed -i '' "s|\"destination\": \"https://[^\"]*\.vercel\.app/api/[^\"]*\"|\"destination\": \"${NEW_URL}/api/:path*\"|g" "$VERCEL_JSON"

echo "✅  frontend/vercel.json updated:"
grep "destination" "$VERCEL_JSON"

echo ""
echo "📋  Next steps:"
echo "   1. In Vercel Dashboard (frontend project) → Settings → Environment Variables:"
echo "      Set NEXT_PUBLIC_API_URL = ${NEW_URL}"
echo "   2. Commit & push:"
echo "      git add frontend/vercel.json && git commit -m 'Set backend Vercel URL' && git push"
