with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Toast exports after KeyboardShortcuts
if 'ToastProvider' not in content:
    content = content.replace(
        'export { KeyboardShortcuts } from \'./KeyboardShortcuts\';',
        'export { KeyboardShortcuts } from \'./KeyboardShortcuts\';\nexport { ToastProvider, useToast } from \'./Toast\';'
    )

with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated component index with Toast')
