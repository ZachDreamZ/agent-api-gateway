import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
}

interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  variant?: 'grid' | 'list' | 'cards';
  columns?: 2 | 3 | 4;
}

export const Features: React.FC<FeaturesProps> = ({ 
  title,
  subtitle,
  features, 
  variant = 'grid',
  columns = 3
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  if (variant === 'list') {
    return (
      <section className="py-16">
        {title && (
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  {feature.link && (
                    <a href={feature.link} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (variant === 'cards') {
    return (
      <section className="py-16">
        {title && (
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1  gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="surface-hover p-8 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                {feature.link && (
                  <a href={feature.link} className="text-blue-600 hover:underline text-sm font-medium">
                    Learn more →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      {title && (
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1  gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="text-center">
              <div className="inline-flex w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                <Icon className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.link && (
                <a href={feature.link} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Learn more →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Feature grid with alternating layout
interface FeatureBlockProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string;
  reverse?: boolean;
}

export const FeatureBlock: React.FC<FeatureBlockProps> = ({
  icon: Icon,
  title,
  description,
  image,
  reverse = false,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="inline-flex w-14 h-14 bg-blue-100 rounded-xl items-center justify-center mb-6">
          <Icon className="text-blue-600" size={28} />
        </div>
        <h3 className="font-serif text-3xl font-bold mb-4">{title}</h3>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      
      <div className={reverse ? 'lg:order-1' : ''}>
        {image ? (
          <img src={image} alt={title} className="rounded-lg shadow-xl" />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-xl flex items-center justify-center">
            <Icon className="text-blue-300" size={64} />
          </div>
        )}
      </div>
    </div>
  );
};
