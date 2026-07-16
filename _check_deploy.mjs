// Get Render build logs
async function main() {
  const auth = { Authorization: 'Bearer rnd_WE0GNQbIbbOr3QCN3EmNX5ae0O19' };

  // Get deploy id
  const list = await (await fetch('https://api.render.com/v1/services/srv-d9av07e7r5hc739guseg/deploys?limit=1', { headers: auth })).json();
  const deployId = list[0].deploy.id;
  console.log('Latest deploy:', deployId);

  // Get build logs
  const logs = await (await fetch(`https://api.render.com/v1/services/srv-d9av07e7r5hc739guseg/deploys/${deployId}`, { headers: auth })).json();
  console.log('Status:', logs.status);
  console.log('Build failures:', logs.build || 'none');
}

main().catch(e => { console.error(e); process.exit(1); });
