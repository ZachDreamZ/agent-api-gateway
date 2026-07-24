from pathlib import Path
p = Path('src/dashboard/src/pages/Blog.tsx')
t = p.read_text(encoding='utf-8')
start = t.find("slug: 'install-agent-api-gateway-mcp-in-cursor'")
end = t.find("slug: 'rate-limiting-strategies-for-ai-agents'")
if start < 0 or end < 0:
    raise SystemExit('markers missing')
# Inspect how other posts fence code
sample = t[t.find("slug: 'rate-limiting-strategies-for-ai-agents'"): t.find("slug: 'rate-limiting-strategies-for-ai-agents'")+800]
print('sample snippet:')
print(sample[:500])
print('---')
# Replace fenced ``` inside the new post with indented code blocks / no triple backticks
block = t[start:end]
# content is inside template literal content: `...`
# triple backticks terminate nothing but ` starts nested? Actually ``` contains backticks which end the template literal.
# Replace markdown fences with indented code style without backticks
import re
def replace_fences(s):
    def repl(m):
        lang = m.group(1) or ''
        body = m.group(2).strip('\n')
        header = f'Code ({lang}):\n' if lang else 'Code:\n'
        indented = '\n'.join('    ' + line if line else '' for line in body.splitlines())
        return header + indented
    return re.sub(r'```([a-zA-Z0-9_-]*)\n([\s\S]*?)```', repl, s)
new_block = replace_fences(block)
# also ensure no raw unescaped single backticks remain
new_block = re.sub(r'(?<!\\)`([^`\n]+)`', lambda m: f'\\`{m.group(1)}\\`', new_block)
new_block = new_block.replace('\\\\`', '\\`')
t = t[:start] + new_block + t[end:]
p.write_text(t, encoding='utf-8')
print('rewrote fences in new post')
# show around former fence
lines = t.splitlines()
for i,l in enumerate(lines):
    if 'Option B' in l or 'npx -y agent-api-gateway-mcp' in l or 'Claude Desktop' in l:
        print(f'{i+1}:{l}')
