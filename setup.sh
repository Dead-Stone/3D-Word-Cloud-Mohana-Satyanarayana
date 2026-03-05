#!/usr/bin/env bash
set -e

# ── backend ───────────────────────────────────────────────────────────────────
echo "==> Setting up Python backend..."
cd backend

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# Works on both macOS (bin/) and Windows Git Bash (Scripts/)
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
else
  source .venv/Scripts/activate
fi

python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q
echo "==> Backend ready."
cd ..

# ── frontend ──────────────────────────────────────────────────────────────────
echo "==> Setting up frontend..."
cd frontend
npm install
echo "==> Frontend ready."
cd ..

# ── start servers ─────────────────────────────────────────────────────────────
echo ""
echo "==> Backend  → http://127.0.0.1:8001"
echo "==> Frontend → http://localhost:5173"
echo ""

(cd backend && uvicorn main:app --host 127.0.0.1 --port 8001 --reload) &
BACKEND_PID=$!

trap 'kill $BACKEND_PID 2>/dev/null; exit' INT TERM

cd frontend && npm run dev
