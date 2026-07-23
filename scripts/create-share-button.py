import sys

code = """import React, { useState } from 'react';
import { Share2, Check, Twitter, Linkedin, Mail } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButton({ url, title, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fullUrl = `https://agentapigw.dpdns.org${url}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedDesc = description ? encodeURIComponent(description) : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-colors"
        aria-label="Share this post"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
        <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
      </button>

      {showMenu && (
        <div className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-lg shadow-lg p-2 min-w-[200px] z-10">
          <button
            onClick={handleCopyLink}
            className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Copy link</span>
          </button>
          
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            <span className="text-sm">Share on Twitter</span>
          </a>

          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            <span className="text-sm">Share on LinkedIn</span>
          </a>

          <a
            href={shareLinks.email}
            className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">Share via email</span>
          </a>
        </div>
      )}
    </div>
  );
}
"""

with open('src/dashboard/src/components/ShareButton.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("ShareButton component created successfully")
