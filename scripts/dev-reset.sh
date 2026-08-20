#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Stopping processes on port 3004..."
for _ in 1 2 3; do
  lsof -ti:3004 | xargs kill -9 2>/dev/null || true
  pkill -9 -f "toros-knife-tool.*next" 2>/dev/null || true
  sleep 1
done

if lsof -nP -iTCP:3004 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 3004 still in use. Close the other terminal running next dev, then retry."
  exit 1
fi

echo "Clearing .next cache..."
if [ -d .next ]; then
  find .next -mindepth 1 -delete 2>/dev/null || rm -rf .next
fi

echo "Starting dev server on http://127.0.0.1:3004"
exec npm run dev
