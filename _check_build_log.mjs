async function main() {
  const auth = { Authorization: 'Bearer rnd_WE0GNQbIbbOr3QCN3EmNX5ae0O19' };
  const base = 'https://api.render.com/v1';

  // Get latest deploy
  const list = await (await fetch(`${base}/services/srv-d9av07e7r5hc739guseg/deploys?limit=1`, { headers: auth })).json();
  const deployId = list[0].deploy.id;
  console.log('Deploy:', deployId);

  // Render CLI-style log fetch - try the logs endpoint
  const logRes = await fetch(`${base}/services/srv-d9av07e7r5hc739guseg/deploys/${deployId}/build`, {
    headers: auth,
  });
  console.log('Build log status:', logRes.status);
  const text = await logRes.text();
  console.log(text.substring(0, 3000));
}

main().catch(e => { console.error(e); process.exit(1); });
