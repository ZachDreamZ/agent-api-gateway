import React, { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButton({ url, title, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getFullUrl = () => {
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${window.location.origin}${path}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTwitterUrl = () => {
    const fullUrl = getFullUrl();
    return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(fullUrl);
  };

  const getLinkedInUrl = () => {
    const fullUrl = getFullUrl();
    return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(fullUrl);
  };

  const getFacebookUrl = () => {
    const fullUrl = getFullUrl();
    return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(fullUrl);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-secondary flex items-center gap-2"
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 p-3 rounded-lg shadow-xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              minWidth: '200px',
            }}
          >
            <div className="flex flex-col gap-2">
              <a
                href={getTwitterUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                style={{ color: '#1DA1F2' }}
                onClick={() => setShowMenu(false)}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm font-medium">Twitter / X</span>
              </a>
              <a
                href={getLinkedInUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                style={{ color: '#0A66C2' }}
                onClick={() => setShowMenu(false)}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              <a
                href={getFacebookUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                style={{ color: '#1877F2' }}
                onClick={() => setShowMenu(false)}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {copied ? 'Link copied!' : 'Copy link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
