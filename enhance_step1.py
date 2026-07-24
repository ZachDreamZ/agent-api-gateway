with open('src/dashboard/src/pages/UseCases.tsx', 'r') as f:
    content = f.read()

old_imports = '''import { Link, useParams } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { ArrowRight, Bot, Package, Building2, Newspaper } from 'lucide-react';'''

new_imports = '''import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AmbientBg, BrandLockup, SectionLabel } from '../components/Brand';
import { useSEO } from '../hooks/useSEO';
import { ArrowRight, Bot, Package, Building2, Newspaper, Copy, ExternalLink, Play, Code, Terminal, Check, KeyRound, Zap } from 'lucide-react';'''

content = content.replace(old_imports, new_imports)

copy_button = '''// ─── Copy Button ───

function CopyButton({ text, label = \
Copy\ }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; ignore quietly.
    }
  }

  return (
    <button
      type=\button\
      onClick={handleCopy}
      className={copied ? \btn
btn-primary
text-xs\ : \btn
btn-ghost
text-xs\}
      style={{ padding: \0.35rem
0.65rem\, gap: \0.3rem\ }}
      aria-label={copied ? \Copied\ : label}
    >
      {copied ? <Check className=\w-3.5
h-3.5\ /> : <Copy className=\w-3.5
h-3.5\ />}
      {copied ? \Copied\ : label}
    </button>
  );
}

'''

content = content.replace('const ICONS = {', copy_button + 'const ICONS = {')

with open('src/dashboard/src/pages/UseCases.tsx', 'w') as f:
    f.write(content)

print('Step 1 done - imports and CopyButton added')
