import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTAProps {
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  variant?: 'default' | 'gradient' | 'minimal';
}

export const CTA: React.FC<CTAProps> = ({
  title,
  description,
  primaryButtonText = 'Get Started',
  primaryButtonLink = '/signup',
  secondaryButtonText,
  secondaryButtonLink,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'surface p-12 text-center',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 p-12 text-center',
    minimal: 'py-16 text-center',
  };

  return (
    <section className={variantClasses[variant]}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Sparkles className="text-blue-600" size={32} />
          </div>
        </div>
        
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h2>
        
        {description && (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={primaryButtonLink}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
          >
            {primaryButtonText}
            <ArrowRight size={20} />
          </a>
          
          {secondaryButtonText && secondaryButtonLink && (
            <a
              href={secondaryButtonLink}
              className="btn-secondary px-8 py-3 text-lg"
            >
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

// Pre-built CTA variants
export const CTASimple: React.FC<{ onPrimaryClick?: () => void }> = ({ onPrimaryClick }) => (
  <CTA
    title="Ready to Build Something Amazing?"
    description="Join thousands of developers using our API to power their applications."
    primaryButtonText="Start Free Trial"
    primaryButtonLink="/signup"
    secondaryButtonText="View Pricing"
    secondaryButtonLink="/pricing"
  />
);

export const CTABottom: React.FC = () => (
  <CTA
    title="Transform Your Application Today"
    description="Get started in minutes with our comprehensive API and documentation."
    primaryButtonText="Get Started"
    primaryButtonLink="/signup"
    variant="gradient"
  />
);

export const CTAMinimal: React.FC = () => (
  <CTA
    title="Start Building Now"
    primaryButtonText="Sign Up Free"
    primaryButtonLink="/signup"
    variant="minimal"
  />
);
