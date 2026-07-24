from pathlib import Path
import json, datetime
p = Path('.recursive-state.json')
state = json.loads(p.read_text(encoding='utf-8'))
state['loop']['currentPhase'] = 'verify'
state['loop']['iteration'] = int(state.get('loop',{}).get('iteration',35)) + 1
state['loop']['lastAudit'] = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'
state['improvements']['completed'].append({
  'id': 'seo-traffic-destinations',
  'description': 'Wired /pricing + /alternatives, fixed sitemap/robots, MCP install blog, discovery files, directory kit',
  'commit': '718e697',
  'timestamp': state['loop']['lastAudit'],
})
pending = state['improvements'].get('pending', [])
for item in [
  'More blog content (caching, webhooks, MCP guide)',
]:
    if item in pending:
        pending = [x for x in pending if x != item]
# keep other pending; add directory execution as next
if 'Submit first directory batch (DevHunt/SaaSHub/TAAFT)' not in pending:
    pending.append('Submit first directory batch (DevHunt/SaaSHub/TAAFT)')
if 'Product Hunt assets (screenshots + demo video)' not in pending:
    pending.append('Product Hunt assets (screenshots + demo video)')
state['improvements']['pending'] = pending
state['metrics']['pages'] = 18
state['metrics']['blogPosts'] = 6
state['metrics']['deployStatus'] = 'deploying'
p.write_text(json.dumps(state, indent=2) + '\n', encoding='utf-8')
print('state updated')
