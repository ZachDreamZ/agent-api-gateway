import sys

# Read the file
with open('src/dashboard/src/pages/AuraLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

structured_data = '''      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'NexusCore',
            description: 'Structured web data extraction API for AI agents',
            url: 'https://agentapigw.dpdns.org',
            logo: 'https://agentapigw.dpdns.org/logo.png',
            sameAs: ['https://github.com/ZachDreamZ/agent-api-gateway'],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'support@agentapigw.dpdns.org',
              contactType: 'Customer Support'
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Agent API Gateway',
            url: 'https://agentapigw.dpdns.org',
            description: 'Structured web data extraction API for AI agents. Send a URL and schema, get validated JSON.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://agentapigw.dpdns.org/docs?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Agent API Gateway',
            applicationCategory: 'DeveloperApplication',
            description: 'Structured web data extraction API for AI agents. Extract product, article, and company data with schema validation.',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free tier with 100 queries/month'
            },
            featureList: [
              'Schema-validated JSON extraction',
              'SSRF protection',
              'MCP server for Claude Desktop',
              'Product, article, and company schemas',
              'Credit packs and flexible billing'
            ]
          })
        }}
      />
'''

# Look for "function Landing() {" followed by return and div
marker = 'function Landing() {\n  return (\n    <div'
pos = content.find(marker)

if pos != -1:
    # Find the first > after the opening <div
    search_start = pos + len(marker)
    end_of_tag = content.find('>', search_start)
    if end_of_tag != -1:
        # Insert after the > and its newline
        insert_pos = end_of_tag + 1
        content = content[:insert_pos] + '\n' + structured_data + content[insert_pos:]
        print("Successfully added structured data after Landing div")
    else:
        print("Could not find end of div tag")
        sys.exit(1)
else:
    print(f"Could not find Landing function pattern. Searched for: {marker}")
    sys.exit(1)

# Write back
with open('src/dashboard/src/pages/AuraLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Structured data added successfully")
