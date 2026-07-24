import React, { useState } from "react";
import { Send, Loader2, Check, Copy } from "lucide-react";
import { apiKey } from "../lib/auth";

interface LiveExtractDemoProps {
  schema: "product" | "article" | "company";
}

export function LiveExtractDemo({ schema }: LiveExtractDemoProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/v1/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url: url.trim(), schema }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const placeholderUrls: Record<string, string> = {
    product: "https://www.example.com/product/123",
    article: "https://www.example.com/blog/post",
    company: "https://www.example.com/about",
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleExtract} className="flex gap-2 flex-wrap">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholderUrls[schema] || "https://example.com"}
          className="input flex-1 min-w-[280px]"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn btn-primary shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Extracting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Extract
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="text-sm rounded-md px-3 py-2" style={{ background: "var(--color-error-subtle)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="surface rounded-lg p-4" style={{ border: "1px solid var(--color-border-subtle)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Result</span>
            <button
              onClick={handleCopy}
              className="btn btn-ghost text-xs"
              style={{ padding: "0.25rem 0.5rem" }}
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <pre className="code-block text-xs leading-relaxed overflow-x-auto max-h-[300px]" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)", fontFamily: "var(--font-family-mono)" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
