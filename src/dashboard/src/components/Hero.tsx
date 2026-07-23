import React from 'react';
import { ArrowRight, Play, Check } from 'lucide-react';

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  features?: string[];
  variant?: 'default' | 'centered' | 'split' | 'minimal';
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  features,
  variant = 'default',
}) => {
  if (variant === 'centered') {
    return (
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              {eyebrow}
            </div>
          )}
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {primaryCTA && (
              <a
                href={primaryCTA.href}
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-semibold text-lg"
              >
                {primaryCTA.text}
                <ArrowRight size={20} />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-semibold text-lg"
              >
                <Play size={20} />
                {secondaryCTA.text}
              </a>
            )}
          </div>
          {features && features.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="text-green-600" size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className="py-16">
        <div className="max-w-3xl mx-auto">
          {eyebrow && (
            <div className="text-sm font-medium text-blue-600 mb-4">
              {eyebrow}
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 mb-8">
              {subtitle}
            </p>
          )}
          {primaryCTA && (
            <a
              href={primaryCTA.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-semibold"
            >
              {primaryCTA.text}
              <ArrowRight size={18} />
            </a>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className="py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                {eyebrow}
              </div>
            )}
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl text-gray-600 mb-8">
                {subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {primaryCTA && (
                <a
                  href={primaryCTA.href}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-semibold"
                >
                  {primaryCTA.text}
                  <ArrowRight size={20} />
                </a>
              )}
              {secondaryCTA && (
                <a
                  href={secondaryCTA.href}
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-semibold"
                >
                  {secondaryCTA.text}
                </a>
              )}
            </div>
            {features && features.length > 0 && (
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="surface-glow p-8 rounded-2xl">
            <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-6xl font-bold">
              🚀
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="py-20">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          {eyebrow}
        </div>
      )}
      <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 max-w-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          {subtitle}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {primaryCTA && (
          <a
            href={primaryCTA.href}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-semibold text-lg"
          >
            {primaryCTA.text}
            <ArrowRight size={20} />
          </a>
        )}
        {secondaryCTA && (
          <a
            href={secondaryCTA.href}
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-semibold text-lg"
          >
            {secondaryCTA.text}
          </a>
        )}
      </div>
      {features && features.length > 0 && (
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// Animated hero with gradient text
export const HeroAnimated: React.FC<HeroProps> = ({
  eyebrow,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <section className="py-20 text-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {primaryCTA && (
            <a
              href={primaryCTA.href}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
            >
              {primaryCTA.text}
              <ArrowRight size={20} />
            </a>
          )}
          {secondaryCTA && (
            <a
              href={secondaryCTA.href}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              {secondaryCTA.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
