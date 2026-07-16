async function main() {
  const auth = { Authorization: 'Bearer rnd_WE0GNQbIbbOr3QCN3EmNX5ae0O19' };
  const res = await fetch('https://api.render.com/v1/services/srv-d9av07e7r5hc739guseg', { headers: auth });
  const d = await res.json();
  const s = d.serviceDetails || {};
  console.log('Runtime:', s.runtime);
  console.log('BuildCommand:', s.buildCommand);
  console.log('StartCommand:', s.startCommand);
  console.log('Dockerfile path:', s.dockerfilePath || 'N/A');
  console.log('Auto deploy:', s.autoDeploy);
  console.log('NumInstances:', s.numInstances);
  console.log('Plan:', s.plan);
  console.log('PullRequestPreviewsEnabled:', s.pullRequestPreviewsEnabled);
  console.log('Repo:', d.repo);
  console.log('Branch:', d.branch);
}

main().catch(e => { console.error(e); process.exit(1); });
