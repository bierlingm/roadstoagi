#!/bin/bash
# Deploy Roads to AGI to Cloudflare Pages
set -e

cd "$(dirname "$0")/../site"
bun run build
npx wrangler pages deploy dist --project-name=roads-to-agi --branch=main --commit-dirty=true

echo "✓ Deployed to roadstoagi.org"
