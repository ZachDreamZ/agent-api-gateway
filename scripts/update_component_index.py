with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add NetworkStatus export after EmptyState
if 'NetworkStatus' not in content:
    content = content.replace(
        'export { EmptyState } from \'./EmptyState\';',
        'export { EmptyState } from \'./EmptyState\';\nexport { NetworkStatus } from \'./NetworkStatus\';'
    )

with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated component index with NetworkStatus')
