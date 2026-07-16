import { get } from 'https';
import { writeFileSync } from 'fs';

const url = 'https://agentapigw.dpdns.org/assets/index-BImhcYNx.js';
get(url, (res) => {
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    const str = buf.toString('utf8');
    
    // Get lines around 218
    const lines = str.split('\n');
    console.log('Total lines:', lines.length);
    if (lines[217]) {
      const line218 = lines[217];
      console.log('Line 218 length:', line218.length);
      console.log('Around column 46283:');
      const start = Math.max(0, 46283 - 200);
      const end = Math.min(line218.length, 46283 + 200);
      console.log('---');
      console.log(line218.slice(start, end));
    }
  });
});
