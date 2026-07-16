// Check Render build config
async function main() {
  const res = await fetch('https://api.render.com/v1/services/srv-d9av07e7r5hc739guseg', {
    headers: { Authorization: 'Bearer rnd_WE0GNQbIbbOr3QCN3EmNX5ae0O19' },
  });
  const d = await res.json();
  const details = d.serviceDetails || {};
  console.log('Build command:', details.buildCommand || 'N/A');
  console.log('Start command:', details.startCommand || 'N/A');
  console.log('Repo:', d.repo || 'N/A');
  console.log('Branch:', d.branch || 'N/A');
}
main().catch(e => { console.error(e); process.exit(1); });
