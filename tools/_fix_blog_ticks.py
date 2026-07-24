from pathlib import Path
p = Path('src/dashboard/src/pages/Blog.tsx')
t = p.read_text(encoding='utf-8')
# Escape nested backticks/template interpolations inside the new post content
# The post uses a template literal; nested `...` must be \`...\`
fixes = [
    ('via `POST /v1/extract`', 'via \\`POST /v1/extract\\`'),
    ('Install with `npx -y agent-api-gateway-mcp`', 'Install with \\`npx -y agent-api-gateway-mcp\\`'),
]
# Only fix within the new post if needed
if 'via `POST /v1/extract`' in t:
    t = t.replace('via `POST /v1/extract`', 'via \\`POST /v1/extract\\`')
# also check other nested backticks in that post
# Find the new post block and escape all single-backtick spans carefully
start = t.find("slug: 'install-agent-api-gateway-mcp-in-cursor'")
end = t.find("slug: 'rate-limiting-strategies-for-ai-agents'")
if start == -1 or end == -1:
    raise SystemExit('post markers missing')
block = t[start:end]
# escape bare `code` occurrences that are not already escaped
import re
def esc(m):
    inner = m.group(1)
    return f'\\`{inner}\\`'
# only unescaped single backticks pairs
new_block = re.sub(r'(?<!\\)`([^`\n]+)`', esc, block)
# avoid double-escaping
new_block = new_block.replace('\\\\`', '\\`')
t = t[:start] + new_block + t[end:]
p.write_text(t, encoding='utf-8')
print('escaped nested backticks in blog post')
# sanity print a few lines
lines = t.splitlines()
for i,l in enumerate(lines):
    if 'install-agent-api-gateway-mcp-in-cursor' in l or 'POST /v1/extract' in l or 'npx -y agent-api-gateway-mcp' in l:
        print(f'{i+1}:{l}')
