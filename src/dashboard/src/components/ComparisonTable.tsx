import React from 'react';
import { Check, X, Minus } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  us: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
  category?: string;
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  usLabel?: string;
  competitor1Label?: string;
  competitor2Label?: string;
  features: ComparisonFeature[];
  highlightUs?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  title = 'Why choose us?',
  subtitle = 'See how we compare to alternatives',
  usLabel = 'Our Platform',
  competitor1Label = 'Competitor A',
  competitor2Label = 'Competitor B',
  features,
  highlightUs = true,
}) => {
  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="text-green-600 mx-auto" size={20} />
      ) : (
        <X className="text-gray-300 mx-auto" size={20} />
      );
    }
    
    if (value === 'partial') {
      return <Minus className="text-yellow-600 mx-auto" size={20} />;
    }
    
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  // Group features by category if provided
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, ComparisonFeature[]>);

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>
        <p className="text-xl text-gray-600">{subtitle}</p>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-semibold">Feature</th>
              <th className="ext-center p-4 font-semibold">
                <div className="flex flex-col items-center gap-1">
                  <span>{usLabel}</span>
                  {highlightUs && (
                    <span className="text-xs font-normal text-blue-600">Recommended</span>
                  )}
                </div>
              </th>
              <th className="text-center p-4 font-semibold">{competitor1Label}</th>
              <th className="text-center p-4 font-semibold">{competitor2Label}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <React.Fragment key={category}>
                {category !== 'General' && (
                  <tr>
                    <td colSpan={4} className="p-4 bg-gray-50 font-semibold text-sm text-gray-700">
                      {category}
                    </td>
                  </tr>
                )}
                {categoryFeatures.map((feature, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm">{feature.feature}</td>
                    <td className="p-4 text-center">
                      {renderValue(feature.us)}
                    </td>
                    <td className="p-4 text-center">{renderValue(feature.competitor1)}</td>
                    <td className="p-4 text-center">{renderValue(feature.competitor2)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Check className="text-green-600" size={16} />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="text-yellow-600" size={16} />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="text-gray-300" size={16} />
          <span>Not available</span>
        </div>
      </div>
    </section>
  );
};

// Sample comparison data
export const sampleComparison: ComparisonFeature[] = [
  {
    feature: 'Schema Validation',
    us: true,
    competitor1: false,
    competitor2: 'partial',
    category: 'Core Features',
  },
  {
    feature: 'SSRF Protection',
    us: true,
    competitor1: false,
    competitor2: false,
    category: 'Security',
  },
  {
    feature: 'MCP Integration',
    us: true,
    competitor1: false,
    competitor2: false,
    category: 'Core Features',
  },
  {
    feature: 'Response Time',
    us: '50ms avg',
    competitor1: '200ms avg',
    competitor2: '150ms avg',
    category: 'Performance',
  },
  {
    feature: 'Free Tier',
    us: '100 requests/month',
    competitor1: '10 requests/month',
    competitor2: 'No free tier',
    category: 'Pricing',
  },
  {
    feature: 'Rate Limiting',
    us: true,
    competitor1: true,
    competitor2: true,
    category: 'Core Features',
  },
  {
    feature: 'Custom Schemas',
    us: true,
    competitor1: 'partial',
    competitor2: false,
    category: 'Core Features',
  },
  {
    feature: 'Documentation',
    us: true,
    competitor1: true,
    competitor2: 'partial',
    category: 'Developer Experience',
  },
];

// Simple two-column comparison
interface SimpleComparisonProps {
  title?: string;
  usFeatures: string[];
  themFeatures: string[];
  usLabel?: string;
  themLabel?: string;
}

export const SimpleComparison: React.FC<SimpleComparisonProps> = ({
  title = 'The difference',
  usFeatures,
  themFeatures,
  usLabel = 'With us',
  themLabel = 'Without us',
}) => {
  return (
    <section className="py-16">
      {title && (
        <h2 className="font-serif text-4xl font-bold text-center mb-12">{title}</h2>
      )}
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="surface p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="text-green-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold">{usLabel}</h3>
          </div>
          <ul className="space-y-3">
            {usFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="text-green-600 flex-shrink-0 mt-1" size={16} />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="text-red-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold">{themLabel}</h3>
          </div>
          <ul className="space-y-3">
            {themFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <X className="text-red-400 flex-shrink-0 mt-1" size={16} />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
