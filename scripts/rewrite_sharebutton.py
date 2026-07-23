content = '''import React, { useState } from 'react';
import { Share2, Check, Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButton({ url, title, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fullUrl = ${window.location.origin};

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: https://twitter.com/intent/tweet?text=&url=,
      color: '#1DA1F2',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: https://www.linkedin.com/sharing/share-offsite/?url=,
      color: '#0A66C2',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: https://www.facebook.com/sharer/sharer.php?u=,
      color: '#1877F2',
    },
  ];

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
              {shareLinks.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <platform.icon
                    className="w-4 h-4"
                    style={{ color: platform.color }}
                  />
                  <span className="text-sm font-medium">{platform.name}</span>
                </a>
              ))}
              
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[var(--color-success)]" />
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
'''

with open(r'D:\micro-saas-agent-api\src\dashboard\src\components\ShareButton.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('ShareButton.tsx rewritten')
