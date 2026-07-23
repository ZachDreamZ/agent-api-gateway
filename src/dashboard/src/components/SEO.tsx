import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  ogImage = 'https://agentapigw.dpdns.org/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  structuredData,
}) => {
  const location = useLocation();
  const fullTitle = title.includes('Agent API Gateway') ? title : ${title} | Agent API Gateway;
  const currentUrl = canonicalUrl || https://agentapigw.dpdns.org;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(meta[=""]);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', ogType, true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Structured data (JSON-LD)
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, description, keywords, ogImage, ogType, currentUrl, noindex, structuredData]);

  return null;
};

// Predefined structured data helpers
export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Agent API Gateway',
  url: 'https://agentapigw.dpdns.org',
  logo: 'https://agentapigw.dpdns.org/logo.png',
  description: 'Schema-driven web extraction API powered by LLMs. Extract structured JSON from any public URL.',
  sameAs: [
    'https://github.com/ZachDreamZ/agent-api-gateway',
  ],
});

export const createWebApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Agent API Gateway',
  url: 'https://agentapigw.dpdns.org',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'Schema-driven web extraction API that converts any public URL into structured JSON using LLMs.',
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});
