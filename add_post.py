import sys

with open("src/dashboard/src/pages/Blog.tsx", "r", encoding="utf-8") as f:
    c = f.read()

bt = chr(96)
esc_bt = chr(92) + bt

post_content = (
    "## Why build an extraction agent?\n"
    "\n"
    "AI agents need real-time data from the web. A structured extraction API lets your agent get clean, typed data from any public URL with a single API call.\n"
    "\n"
    "In this guide, you will build an AI agent that takes a URL, extracts structured data, handles multiple schema types, and integrates with both REST API and MCP server.\n"
    "\n"
    "## Prerequisites\n"
    "\n"
    "- An Agent API Gateway account (free tier: 500 queries/month)\n"
    "- An API key from the dashboard\n"
    "- Python 3.10+ or Node.js 18+\n"
    "\n"
    "## Step 1: Get your API key\n"
    "\n"
    "1. Go to /login and create an account\n"
    "2. Navigate to Dashboard > API Keys\n"
    "3. Create a new key with the sk- prefix\n"
    "\n"
    "## Step 2: REST API client (Python)\n"
    "\n"
) + esc_bt + esc_bt + esc_bt + "python\n" + (
    "import os\n"
    "import requests\n"
    "\n"
    'API_KEY = os.environ.get("AGENT_API_KEY")\n'
    'BASE_URL = "https://agentapigw.dpdns.org/v1"\n'
    "\n"
    'def extract_url(url: str, schema: str = "product") -> dict:\n'
    "    response = requests.post(\n"
    '        f"{BASE_URL}/extract",\n'
    "        headers={\n"
    '            "Authorization": f"Bearer {API_KEY}",\n'
    '            "Content-Type": "application/json",\n'
    "        },\n"
    '        json={"url": url, "schema": schema},\n'
    "        timeout=15,\n"
    "    )\n"
    "    response.raise_for_status()\n"
    "    return response.json()\n"
    "\n"
    'result = extract_url("https://example.com/product", "product")\n'
    'print(f"Product: {result[\\"data\\"][\\"name\\"]}")\n'
    + esc_bt + esc_bt + esc_bt + "\n"
    "\n"
    "## Step 3: Batch processing\n"
    "\n"
    "The API supports three built-in schemas:\n"
    "\n"
    "- product: e-commerce and pricing pages\n"
    "- article: blog posts and news articles\n"
    "- company: about pages and company profiles\n"
    "\n"
    "## Step 4: Error handling\n"
    "\n"
    "| HTTP Status | Meaning | Action |\n"
    "|-------------|---------|--------|\n"
    "| 200 | Success | Parse the response |\n"
    "| 401 | Unauthorized | Check your API key |\n"
    "| 429 | Rate limited | Wait and retry |\n"
    "| 500 | Server error | Retry with backoff |\n"
    "\n"
    "## Next steps\n"
    "\n"
    "- Try the live playground on the homepage\n"
    "- Read about SSRF protection patterns\n"
    "- Compare with alternatives\n"
    "- Join the GitHub community"
)

new_post = (
    "\n  {\n"
    "    slug: 'how-to-build-an-ai-agent-that-extracts-web-data',\n"
    "    title: 'How to build an AI agent that extracts web data (REST + MCP)',\n"
    "    excerpt: 'A practical step-by-step guide to building AI agents that extract structured data from websites using REST APIs and MCP servers. Includes working Python code examples.',\n"
    "    date: '2026-07-25',\n"
    "    readTime: '6 min',\n"
    "    tags: ['agents', 'guides', 'tutorial'],\n"
    f"    content: `{post_content}`,\n"
    "  },\n"
)

posts_start = c.find("const POSTS = [")
insert_point = c.find("[", posts_start) + 1
c = c[:insert_point] + new_post + c[insert_point:]

with open("src/dashboard/src/pages/Blog.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Blog post added successfully!")
