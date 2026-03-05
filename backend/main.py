import re
import string
import time
from urllib.parse import urlparse

import nltk
import requests
import trafilatura
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords

app = FastAPI(title="3D Word Cloud API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STOP_WORDS = set(stopwords.words("english"))

# Simple in-memory cache  url -> (result, timestamp)
_cache: dict = {}
CACHE_TTL = 3600  # seconds


class AnalyzeRequest(BaseModel):
    url: str
    top_n: int = 60


class WordWeight(BaseModel):
    word: str
    weight: float


class ArticleMeta(BaseModel):
    title: str
    domain: str
    word_count: int
    processing_time_ms: int


class AnalyzeResponse(BaseModel):
    words: list[WordWeight]
    meta: ArticleMeta


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def fetch_article(url: str) -> tuple[str, str]:
    """Returns (text, title). Uses trafilatura with BeautifulSoup fallback."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=422, detail=f"Failed to fetch URL: {exc}")

    html = response.text

    # trafilatura: best-in-class main-content extraction
    text = trafilatura.extract(html, include_comments=False, include_tables=False)

    # BeautifulSoup fallback for sites trafilatura can't handle
    if not text or len(text.split()) < 50:
        soup = BeautifulSoup(html, "lxml")
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "form"]):
            tag.decompose()
        blocks = soup.find_all(["article", "main", "section"])
        text = " ".join(b.get_text(" ") for b in blocks) if blocks else soup.get_text(" ")

    # Extract page title
    soup = BeautifulSoup(html, "lxml")
    title_tag = soup.find("title")
    title = title_tag.get_text().strip() if title_tag else urlparse(url).netloc

    return text or "", title


def clean_text(raw: str) -> str:
    text = raw.lower()
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\d+", " ", text)
    text = text.translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))
    return re.sub(r"\s+", " ", text).strip()


def extract_keywords(text: str, top_n: int = 60) -> list[WordWeight]:
    words = text.split()
    if len(words) < 10:
        raise HTTPException(status_code=422, detail="Article text too short to analyze.")

    chunk_size = max(50, len(words) // 20)
    chunks = [" ".join(words[i: i + chunk_size]) for i in range(0, len(words), chunk_size)]

    custom_stop_words = list(STOP_WORDS) + [
        # common verbs / filler
        "said", "says", "also", "would", "could", "may", "one", "two", "three",
        "new", "like", "get", "got", "make", "made", "use", "used", "using",
        "year", "years", "time", "times", "way", "ways", "people", "person",
        "first", "last", "many", "much", "well", "good", "back", "even",
        "still", "just", "now", "will", "can", "need", "want", "go", "come",
        # UI / navigation fragments
        "read", "min", "article", "share", "cookie", "cookies", "policy",
        "subscribe", "newsletter", "advertisement", "skip", "menu", "search",
        "click", "tap", "swipe", "image", "caption", "photo", "video",
        # Wikipedia citation noise
        "doi", "isbn", "issn", "arxiv", "bibcode", "cid", "pmid", "jstor",
        "retrieved", "archived", "cite", "ref", "eds", "vol", "pp", "ibid",
        # timestamp / date fragments
        "ago", "hrs", "days", "mins", "updated", "published", "posted",
    ]

    vectorizer = TfidfVectorizer(
        stop_words=custom_stop_words,
        ngram_range=(1, 2),
        max_features=200,
        min_df=1,
        token_pattern=r"(?u)\b[a-z]{3,}\b",
    )

    tfidf_matrix = vectorizer.fit_transform(chunks)
    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.sum(axis=0).A1

    top = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)[:top_n]
    if not top:
        raise HTTPException(status_code=422, detail="No keywords could be extracted.")

    max_score = top[0][1]
    return [WordWeight(word=w, weight=round(s / max_score, 4)) for w, s in top if s > 0]


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest):
    url = body.url.strip()
    top_n = max(5, min(body.top_n, 150))  # clamp to safe range

    # Return cached result if still fresh (cache key includes top_n)
    cache_key = (url, top_n)
    if cache_key in _cache:
        result, cached_at = _cache[cache_key]
        if time.time() - cached_at < CACHE_TTL:
            return result

    start = time.time()
    raw_text, title = fetch_article(url)
    keywords = extract_keywords(clean_text(raw_text), top_n=top_n)
    elapsed_ms = int((time.time() - start) * 1000)

    domain = urlparse(url).netloc.replace("www.", "")

    result = AnalyzeResponse(
        words=keywords,
        meta=ArticleMeta(
            title=title[:120],
            domain=domain,
            word_count=len(raw_text.split()),
            processing_time_ms=elapsed_ms,
        ),
    )

    _cache[cache_key] = (result, time.time())
    return result
