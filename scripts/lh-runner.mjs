// Detached Lighthouse runner: spawns the npx-cached CLI in its own process
// group so long audits survive the calling shell. Configure via LH_URL/LH_OUT.
import { spawn } from "node:child_process";

const lhCli =
  "C:/Users/Vendex/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js";
const url = process.env.LH_URL ?? "https://agentapigw.dpdns.org/";
const out = process.env.LH_OUT ?? "D:/micro-saas-agent-api/lh-report.json";

const child = spawn(
  process.execPath,
  [
    lhCli,
    url,
    "--output=json",
    "--output-path=" + out,
    "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
    "--only-categories=performance,accessibility,best-practices,seo",
    "--quiet",
  ],
  { detached: true, stdio: "ignore" },
);
child.unref();
console.log("launched pid=" + child.pid + " out=" + out);
