import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'minimal' | 'icon-only' | 'text-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: { icon: 16, text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 20, text: 'text-xl', tagline: 'text-sm' },
    lg: { icon: 24, text: 'text-2xl', tagline: 'text-base' },
    xl: { icon: 32, text: 'text-4xl', tagline: 'text-lg' },
  };

  const currentSize = sizeClasses[size];

  if (variant === 'icon-only') {
    return (
      <div className="inline-flex">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="text-white" size={currentSize.icon} />
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className="inline-flex flex-col ">
        <span className="ont-serif font-bold ">
          Agent API Gateway
        </span>
        {showTagline && (
          <span className="	ext-gray-600 ">
            AI-Powered Extraction
          </span>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center gap-2 ">
        <Zap className="text-blue-600" size={currentSize.icon} />
        <span className="ont-serif font-bold ">
          Agent API
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 ">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
        <Zap className="text-white" size={currentSize.icon} />
      </div>
      <div className="flex flex-col">
        <span className="ont-serif font-bold leading-none ">
          Agent API Gateway
        </span>
        {showTagline && (
          <span className="	ext-gray-600  mt-1">
            AI-Powered Extraction
          </span>
        )}
      </div>
    </div>
  );
};

export const LogoLink: React.FC<LogoProps & { href?: string }> = ({
  href = '/',
  ...logoProps
}) => {
  return (
    <a href={href} className="inline-block hover:opacity-80 transition-opacity">
      <Logo {...logoProps} />
    </a>
  );
};
