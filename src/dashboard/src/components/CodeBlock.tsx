import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ code, language = 'text', showLineNumbers = false, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative group">
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: 'oklch(0.15 0.01 240)' }}
      >
        {language && (
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{
              borderColor: 'oklch(0.25 0.01 240)',
              backgroundColor: 'oklch(0.12 0.01 240)',
            }}
          >
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'oklch(0.65 0.05 240)' }}
            >
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-white/10"
              style={{ color: 'oklch(0.75 0.05 240)' }}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm" style={{ color: 'oklch(0.85 0.02 240)' }}>
            {showLineNumbers ? (
              <code>
                {lines.map((line, index) => (
                  <div key={index} className="flex">
                    <span
                      className="select-none mr-4 text-right"
                      style={{ color: 'oklch(0.45 0.02 240)', minWidth: '2rem' }}
                    >
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            ) : (
              <code>{code}</code>
            )}
          </pre>
        </div>
      </div>
      {!language && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded transition-all hover:bg-white/10"
          style={{ color: 'oklch(0.75 0.05 240)' }}
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

interface InlineCodeProps {
  children: string;
  className?: string;
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  return (
    <code
      className="px-1.5 py-0.5 rounded text-sm font-mono"
      style={{
        backgroundColor: 'oklch(0.15 0.01 240)',
        color: 'oklch(0.85 0.02 240)',
      }}
    >
      {children}
    </code>
  );
}
