#!/bin/sh
set -e

if [ ! -f "data/icons-index.json" ]; then
  echo "No icon set found in the data volume — downloading from ARASAAC (one-time, ~330MB)..."
  node scripts/download-icons.js
fi

exec node src/server.js
