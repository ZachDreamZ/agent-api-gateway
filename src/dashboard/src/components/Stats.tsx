import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  suffix?: string;
  prefix?: string;
}

interface StatsProps {
  stats: Stat[];
  variant?: 'default' | 'compact' | 'featured';
  columns?: 2 | 3 | 4;
}

export const Stats: React.FC<StatsProps> = ({ 
  stats, 
  variant = 'default',
  columns = 4
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap justify-center gap-8 py-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">
              {stat.prefix}{stat.value}{stat.suffix}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="surface p-12">
        <div className={grid grid-cols-1  gap-8}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                {Icon && (
                  <div className="inline-flex w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                )}
                <div className="text-4xl font-bold mb-2">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={grid grid-cols-1  gap-6}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="surface p-6 text-center">
            {Icon && (
              <div className="inline-flex w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mb-3">
                <Icon className="text-blue-600" size={20} />
              </div>
            )}
            <div className="text-3xl font-bold mb-1">
              {stat.prefix}{stat.value}{stat.suffix}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Animated counter for stats (optional enhancement)
export const AnimatedStat: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 2000 
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// Social proof stats
export const SocialProof: React.FC = () => {
  const stats: Stat[] = [
    { value: '10,000+', label: 'Active Developers', suffix: '' },
    { value: '1M+', label: 'API Calls Daily', suffix: '' },
    { value: '99.9', label: 'Uptime', suffix: '%' },
    { value: '50ms', label: 'Avg Response Time', suffix: '' },
  ];

  return <Stats stats={stats} variant="compact" />;
};
