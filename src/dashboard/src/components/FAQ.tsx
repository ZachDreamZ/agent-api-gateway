import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  defaultOpen?: number;
}

export const FAQ: React.FC<FAQProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our platform',
  items,
  defaultOpen,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Group by category if provided
  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<FAQItem & { originalIndex: number }>>);

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-6">
            <HelpCircle className="text-blue-600" size={28} />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              {category !== 'General' && (
                <h3 className="font-semibold text-lg mb-4 text-gray-700">{category}</h3>
              )}
              <div className="space-y-3">
                {categoryItems.map((item) => {
                  const isOpen = openIndex === item.originalIndex;
                  return (
                    <div
                      key={item.originalIndex}
                      className="surface overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleItem(item.originalIndex)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={lex-shrink-0 text-gray-500 transition-transform }
                          size={20}
                        />
                      </button>
                      <div
                        className={overflow-hidden transition-all }
                      >
                        <div className="p-5 pt-0 text-gray-700 leading-relaxed">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-blue-50 rounded-lg">
          <p className="text-gray-700 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

// Sample FAQ data for the agent API
export const agentAPIFAQ: FAQItem[] = [
  {
    question: 'What is the Agent API Gateway?',
    answer: 'The Agent API Gateway is a powerful extraction API that converts unstructured HTML into clean, structured JSON using AI. Perfect for web scraping, data extraction, and building AI agents.',
    category: 'Getting Started',
  },
  {
    question: 'How does schema validation work?',
    answer: 'You provide a JSON schema defining your desired output structure, and our API automatically validates that the extracted data matches your schema. If validation fails, we return detailed error messages.',
    category: 'Features',
  },
  {
    question: 'What is SSRF protection?',
    answer: 'SSRF (Server-Side Request Forgery) protection prevents malicious URLs from accessing internal networks, localhost, or cloud metadata endpoints. All user-provided URLs are validated before processing.',
    category: 'Security',
  },
  {
    question: 'Which LLM models do you support?',
    answer: 'We support multiple LLM providers including Gemini, Claude (Anthropic), and OpenRouter. The API automatically selects the best available model based on your configuration.',
    category: 'Features',
  },
  {
    question: 'What are the rate limits?',
    answer: 'Rate limits vary by tier: Free (10 req/min), Hobby (30 req/min), Pro (100 req/min), Scale (300 req/min). All plans include burst capacity for occasional spikes.',
    category: 'Pricing & Limits',
  },
  {
    question: 'Can I use this for commercial projects?',
    answer: 'Yes! All paid tiers (Hobby, Pro, Scale) include commercial usage rights. The Free tier is for evaluation and non-commercial use only.',
    category: 'Pricing & Limits',
  },
  {
    question: 'Do you store scraped data?',
    answer: 'We cache successful extractions for 24 hours to improve performance for repeated requests. Cached data is encrypted and automatically purged. You can opt out of caching with the no-cache header.',
    category: 'Privacy & Data',
  },
  {
    question: 'What happens if extraction fails?',
    answer: 'If the LLM cannot extract data matching your schema, we return a detailed error with suggestions. Common causes include invalid URLs, schema mismatches, or content that doesn't match your schema.',
    category: 'Troubleshooting',
  },
  {
    question: 'Can I integrate this with my AI agent?',
    answer: 'Absolutely! We provide an MCP (Model Context Protocol) server for seamless integration with Claude, Cursor, and other AI agents. Install it from /mcp — one-click Cursor, npm, and registry links.',
    category: 'Integration',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We use Polar for billing and accept all major credit cards. Enterprise customers can request invoicing. All payments are secure and PCI-compliant.',
    category: 'Billing',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All new accounts start with 100 free requests per month. No credit card required. Upgrade anytime to increase your limits.',
    category: 'Getting Started',
  },
  {
    question: 'What is your uptime SLA?',
    answer: 'Pro and Scale tiers include a 99.9% uptime SLA. We monitor all endpoints 24/7 and provide a public status page. Enterprise customers can request custom SLAs.',
    category: 'Reliability',
  },
];
