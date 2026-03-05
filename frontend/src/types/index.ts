export interface WordWeight {
  word: string;
  weight: number;
}

export interface ArticleMeta {
  title: string;
  domain: string;
  word_count: number;
  processing_time_ms: number;
}

export interface AnalyzeResponse {
  words: WordWeight[];
  meta: ArticleMeta;
}

export type AppState = "idle" | "loading" | "success" | "error";

export type CloudLayout = "sphere" | "helix" | "flat";
