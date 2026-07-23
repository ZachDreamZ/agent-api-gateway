import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'Article';
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

// Predefined structured data for common use cases
export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: 'Agent API Gateway',
        url: 'https://agentapigw.dpdns.org',
        logo: 'https://agentapigw.dpdns.org/logo.png',
        description: 'Premium web data extraction API powered by LLMs. Extract structured data from any URL with simple JSON schemas.',
        sameAs: [
          'https://github.com/ZachDreamZ/agent-api-gateway',
        ],
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
        description: 'Premium web data extraction API powered by LLMs',
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
