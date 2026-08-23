import { readFileSync, writeFileSync } from "node:fs";

const f = "src/dashboard/public/blog/rss.xml";
let t = readFileSync(f, "utf8");
const item = [
  "<item>",
  "<title>What it costs to extract 10,000 pages with AI agents (2026 benchmarks)</title>",
  "<link>https://agentapigw.dpdns.org/blog/cost-to-scrape-10000-pages-ai-agents</link>",
  '<guid isPermaLink="true">https://agentapigw.dpdns.org/blog/cost-to-scrape-10000-pages-ai-agents</guid>',
  "<pubDate>Sat, 23 Aug 2026 08:00:00 +0000</pubDate>",
  "<description>Real numbers: DIY browser-farm scraping vs an extraction API at 10K, 50K, and 250K pages/month - including the hidden costs nobody budgets for.</description>",
  "<category>guides</category><category>engineering</category>",
  "</item>",
  "",
].join("\r\n");
t = t.replace("<item>", item + "<item>");
writeFileSync(f, t);
console.log("rss items:", (t.match(/<item>/g) || []).length);
