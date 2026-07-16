import json
with open('package.json') as f:
    pkg = json.load(f)
scripts = pkg.get('scripts', {})
for k, v in scripts.items():
    print(f'  {k}: {v}')

print('---')
print('Procfile:')
try:
    with open('Procfile') as f:
        print(f.read().strip())
except FileNotFoundError:
    print('no Procfile')

print('---')
print('Build dirs exist locally:')
import os
for d in ['dist', 'src/dashboard/dist', 'src/dashboard/node_modules']:
    print(f'  {d}: {os.path.isdir(d)}')
