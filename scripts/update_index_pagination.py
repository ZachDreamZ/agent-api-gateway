with open('src/dashboard/src/components/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Pagination export after Toast
if 'Pagination' not in content:
    content = content.replace(
        'export { ToastProvider, useToast } from \'./Toast\';',
        'export { ToastProvider, useToast } from \'./Toast\';\nexport { Pagination } from \'./Pagination\';'
    )

with open('src/dashboard/src/components/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated component index with Pagination')
