import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://agentapigw.dpdns.org';

const routes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/dashboard', priority: 0.9, changefreq: 'daily' },
  { path: '/docs', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/agents', priority: 0.8, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.9, changefreq: 'monthly' },
  { path: '/login', priority: 0.6, changefreq: 'yearly' },
  { path: '/signup', priority: 0.6, changefreq: 'yearly' },
  { path: '/legal/terms', priority: 0.5, changefreq: 'monthly' },
  { path: '/legal/privacy', priority: 0.5, changefreq: 'monthly' },
];

function generateSitemap() {
  const now = new Date().toISOString();
  
  const urls = routes.map(route => 
    '  <url>\n' +
    '    <loc>' + BASE_URL + route.path + '</loc>\n' +
    '    <lastmod>' + now + '</lastmod>\n' +
    '    <changefreq>' + route.changefreq + '</changefreq>\n' +
    '    <priority>' + route.priority + '</priority>\n' +
    '  </url>'
  ).join('\n');

  const sitemap = 
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls + '\n' +
    '</urlset>';

  const outputPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log('Sitemap generated at ' + outputPath);
}

generateSitemap();
