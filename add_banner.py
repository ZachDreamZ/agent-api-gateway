with open('src/dashboard/src/pages/Billing.tsx', 'r') as f:
    content = f.read()

idx = content.find('// ─── Usage Bar ───')

with open('/tmp/banner_code.txt', 'r') as f:
    banner = f.read()

new_content = content[:idx] + banner + content[idx:]
with open('src/dashboard/src/pages/Billing.tsx', 'w') as f:
    f.write(new_content)

print('Added banner component')
