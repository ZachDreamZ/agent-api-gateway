import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: string;
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(baseData)}
      </script>
    </Helmet>
  );
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      data={{
        '@id': 'https://agentapigw.dpdns.org/#organization',
        name: 'Agent API Gateway',
        alternateName: 'NexusCore Agent API',
        url: 'https://agentapigw.dpdns.org',
        logo: 'https://agentapigw.dpdns.org/logo.png',
        description: 'Structured web data extraction API for AI agents. Extract product, article, and company data from any public URL via REST or MCP.',
        sameAs: [
          'https://github.com/ZachDreamZ/agent-api-gateway',
          'https://github.com/ZachDreamZ/agent-api-gateway-mcp',
          'https://www.npmjs.com/package/agent-api-gateway-mcp',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@agentapigw.dpdns.org',
          contactType: 'Customer Support',
        },
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        '@id': 'https://agentapigw.dpdns.org/#website',
        url: 'https://agentapigw.dpdns.org',
        name: 'Agent API Gateway',
        description: 'Structured web data extraction API for AI agents. URL + schema to validated JSON.',
        publisher: {
          '@id': 'https://agentapigw.dpdns.org/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://agentapigw.dpdns.org/docs?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function SoftwareApplicationStructuredData() {
  return (
    <StructuredData
      type="SoftwareApplication"
      data={{
        name: 'Agent API Gateway',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with 100 requests per month',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
        },
      }}
    />
  );
}

export function PricingPageStructuredData() {
  return (
    <StructuredData
      type="WebPage"
      data={{
        '@id': 'https://agentapigw.dpdns.org/pricing/#webpage',
        url: 'https://agentapigw.dpdns.org/pricing',
        name: 'Pricing - Agent API Gateway',
        description: 'Agent API Gateway pricing: free tier with 500 queries/month, credit packs from $1, and Hobby/Pro plans for higher RPM.',
        isPartOf: { '@id': 'https://agentapigw.dpdns.org/#website' },
        about: { '@id': 'https://agentapigw.dpdns.org/#organization' },
        breadcrumb: { '@id': 'https://agentapigw.dpdns.org/pricing#breadcrumb' },
        mainEntity: {
          '@type': 'ItemList',
          name: 'Credit Packs and Plans',
          itemListElement: [
            { '@type': 'Offer', name: '1,000 credits', price: '1.00', priceCurrency: 'USD', description: 'One-time credit pack' },
            { '@type': 'Offer', name: '5,000 credits', price: '4.00', priceCurrency: 'USD', description: 'Burst capacity credit pack' },
            { '@type': 'Offer', name: '25,000 credits', price: '15.00', priceCurrency: 'USD', description: 'Heavy agent workloads credit pack' },
            { '@type': 'Offer', name: 'Hobby Plan', price: '29.00', priceCurrency: 'USD', description: '5,000 queries/month, 60 RPM' },
            { '@type': 'Offer', name: 'Pro Plan', price: '99.00', priceCurrency: 'USD', description: '25,000 queries/month, 300 RPM' },
          ],
        },
      }}
    />
  );
}

export function McpPageStructuredData() {
  return (
    <StructuredData
      type="SoftwareApplication"
      data={{
        name: 'Agent API Gateway MCP',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'MCP Server',
        operatingSystem: 'Any',
        url: 'https://agentapigw.dpdns.org/mcp',
        description: 'Install Agent API Gateway as an MCP tool for Cursor, Claude Desktop, and VS Code.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with 500 queries/month',
          availability: 'https://schema.org/InStock',
        },
        installUrl: 'https://www.npmjs.com/package/agent-api-gateway-mcp',
        softwareVersion: '1.3.0',
      }}
    />
  );
}

export function PageStructuredData({
  url,
  name,
  description,
  breadcrumbs,
}: {
  url: string;
  name: string;
  description: string;
  breadcrumbs: Array<{ name: string; url: string }>;
}) {
  return (
    <>
      <StructuredData
        type="WebPage"
        data={{
          '@id': url + '#webpage',
          url,
          name,
          description,
          isPartOf: { '@id': 'https://agentapigw.dpdns.org/#website' },
          about: { '@id': 'https://agentapigw.dpdns.org/#organization' },
          breadcrumb: { '@id': url + '#breadcrumb' },
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@id': url + '#breadcrumb',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }}
      />
    </>
  );
}

export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <StructuredData
      type="FAQPage"
      data={{
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

