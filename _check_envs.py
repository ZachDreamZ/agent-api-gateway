import json
with open('C:/Users/Vendex/agent-api-gateway/_render_envs.json') as f:
    d = json.load(f)
for e in d:
    k = e['envVar']['key']
    v = e['envVar']['value'][:40] if e['envVar'].get('value') else '(empty)'
    print(f'{k}={v}')
