import { get } from 'https';
const url = 'https://agentapigw.dpdns.org/assets/index-BImhcYNx.js';
get(url, (res) => {
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    const str = Buffer.concat(chunks).toString('utf8');
    // Find .map( calls
    let idx = 0;
    const matches = [];
    while ((idx = str.indexOf('.map(', idx)) !== -1) {
      const start = Math.max(0, idx - 80);
      const before = str.slice(start, idx);
      matches.push({ pos: idx, before: before.trim().slice(-60) });
      idx++;
    }
    console.log('Total .map( calls:', matches.length);
    // Find suspicious ones — map on variable not on literal
    matches
      .filter((m) => !m.before.startsWith('[') && !m.before.startsWith('"') && !m.before.startsWith("'"))
      .slice(0, 30)
      .forEach((m) => console.log(`pos ${m.pos}: ...${m.before.slice(-40)}`));
  });
});
