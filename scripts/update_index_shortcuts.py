with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add KeyboardShortcuts export after NetworkStatus
if 'KeyboardShortcuts' not in content:
    content = content.replace(
        'export { NetworkStatus } from \'./NetworkStatus\';',
        'export { NetworkStatus } from \'./NetworkStatus\';\nexport { KeyboardShortcuts } from \'./KeyboardShortcuts\';'
    )

with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated component index with KeyboardShortcuts')
