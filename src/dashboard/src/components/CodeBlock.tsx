import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={
elative rounded-lg overflow-hidden }>
      {(filename || language) && (
        <div
          className="flex items-center justify-between px-4 py-2 text-xs font-medium"
          style={{
            background: 'var(--color-bg-app)',
            borderBottom: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>{filename || language}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: copied ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)' }}
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
      
      <div
        className="overflow-x-auto"
        style={{
          background: 'oklch(0.18 0.01 235)',
        }}
      >
        <pre className="p-4 text-sm leading-relaxed">
          <code style={{ color: 'oklch(0.92 0.01 235)' }}>
            {showLineNumbers ? (
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i}>
                      <td
                        className="pr-4 text-right select-none"
                        style={{
                          color: 'var(--color-text-disabled)',
                          minWidth: '2.5rem',
                        }}
                      >
                        {i + 1}
                      </td>
                      <td style={{ width: '100%' }}>{line || '\n'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  return (
    <code
      className={px-1.5 py-0.5 rounded text-sm font-mono }
      style={{
        background: 'var(--color-accent-subtle)',
        color: 'var(--color-accent-base)',
      }}
    >
      {children}
    </code>
  );
}
