import { useState, useCallback } from "react";
import { GoogleBookVolume, GoogleBooksResponse } from "../types";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

export function useGoogleBooks() {
  const [results, setResults] = useState<GoogleBookVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const encoded = encodeURIComponent(query.trim());
      const url = `${GOOGLE_BOOKS_API}?q=${encoded}&maxResults=20&langRestrict=fr`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();
      setResults(data.items ?? []);
    } catch (err) {
      setError("Impossible de charger les résultats. Vérifiez votre connexion.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
