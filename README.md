# 3D Word Cloud – Mohana Satyanarayana

Paste a news article URL → get an interactive animated 3D word cloud of its key topics.

**Stack:** React + TypeScript + React Three Fiber · FastAPI + TF-IDF

---

## Run

```bash
./setup.sh
```

Opens frontend at **http://localhost:5173** · backend at **http://127.0.0.1:8001**

Requires Python 3.10+ and Node.js 18+. Works on macOS and Windows (Git Bash).

---

## Features

- Sphere, helix, and flat 3D layouts
- Hover highlights across sidebar and cloud
- Top-N word selector (20 / 40 / 60 / 80)
- Article stats bar (title, domain, word count, timing)
- 1-hour in-memory cache per URL + N

---

## API

`POST /analyze` → `{ url, top_n }` → `{ words: [{ word, weight }], meta: { title, domain, word_count, processing_time_ms } }`
