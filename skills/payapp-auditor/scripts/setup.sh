#!/bin/bash
# setup.sh — Install dependencies for PayApp Auditor skill
# Run this once before first use

set -e

echo "🔧 PayApp Auditor — Setup"
echo "========================="

# Check system dependencies
echo ""
echo "Checking system dependencies..."

MISSING=()

if ! command -v pdftoppm &>/dev/null; then
  MISSING+=("poppler-utils (provides pdftoppm)")
fi

if ! command -v qpdf &>/dev/null; then
  MISSING+=("qpdf")
fi

if ! command -v pdfinfo &>/dev/null; then
  MISSING+=("poppler-utils (provides pdfinfo)")
fi

if ! command -v node &>/dev/null; then
  MISSING+=("nodejs")
fi

if ! command -v zip &>/dev/null; then
  MISSING+=("zip")
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Missing system dependencies:"
  for dep in "${MISSING[@]}"; do
    echo "   - $dep"
  done
  echo ""
  echo "Install with:"
  echo "  Ubuntu/Debian: sudo apt install poppler-utils qpdf nodejs zip"
  echo "  macOS:         brew install poppler qpdf node zip"
  echo ""
else
  echo "✅ All system dependencies installed"
fi

# Install Node.js dependencies for Excel generation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "Installing Node.js dependencies..."

if [ -f "$SCRIPT_DIR/package.json" ]; then
  cd "$SCRIPT_DIR"
  npm install --production 2>/dev/null
else
  cd "$SCRIPT_DIR"
  npm init -y 2>/dev/null
  npm install xlsx js-yaml 2>/dev/null
fi

echo "✅ Node.js dependencies installed"

echo ""
echo "🎉 Setup complete! You can now use /payapp:start"
