#!/usr/bin/env bash
set -euo pipefail

# Finds a jr*.zip file in the repo root and unzips into ./jr
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ZIP=$(ls jr*.zip 2>/dev/null | head -n1 || true)
if [[ -z "$ZIP" ]]; then
  echo "No jr*.zip file found in $ROOT_DIR. Place your jr archive as jr.zip or similar."
  exit 1
fi

echo "Unzipping $ZIP -> $ROOT_DIR/jr"
mkdir -p "$ROOT_DIR/jr"
unzip -o "$ZIP" -d "$ROOT_DIR/jr"
echo "Done."
