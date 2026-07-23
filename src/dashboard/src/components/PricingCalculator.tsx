import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface PricingTier {
  name: string;
  pricePerRequest: number;
  minimumSpend?: number;
  maxRequests?: number;
}

const tiers: PricingTier[] = [
  { name: 'Free', pricePerRequest: 0, maxRequests: 100 },
  { name: 'Hobby', pricePerRequest: 0.01, maxRequests: 10000 },
  { name: 'Pro', pricePerRequest: 0.005, maxRequests: 100000 },
  { name: 'Scale', pricePerRequest: 0.002, maxRequests: Infinity },
];

export const PricingCalculator: React.FC = () => {
  const [requests, setRequests] = useState(1000);
  
  const calculateCost = (requestCount: number, tier: PricingTier): number => {
    if (tier.maxRequests && requestCount > tier.maxRequests) {
      return Infinity;
    }
    return requestCount * tier.pricePerRequest;
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return 'Free';
    if (cost === Infinity) return 'Exceeds limit';
    return $;
  };

  const getBestTier = (): PricingTier => {
    const validTiers = tiers.filter(tier => 
      !tier.maxRequests || requests <= tier.maxRequests
    );
    
    return validTiers.reduce((best, current) => {
      const bestCost = calculateCost(requests, best);
      const currentCost = calculateCost(requests, current);
      return currentCost < bestCost ? current : best;
    });
  };

  const bestTier = getBestTier();

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-6">
            <Calculator className="text-blue-600" size={28} />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">
            Calculate Your Costs
          </h2>
          <p className="text-xl text-gray-600">
            Estimate your monthly spending based on API usage
          </p>
        </div>

        <div className="surface p-8">
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4">
              How many requests per month?
            </label>
            
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={requests}
              onChange={(e) => setRequests(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>100</span>
              <span className="font-semibold text-lg text-gray-900">
                {requests.toLocaleString()} requests
              </span>
              <span>100,000</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Best Plan</div>
                <div className="text-xl font-bold">{bestTier.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Estimated Cost</div>
                <div className="text-xl font-bold">
                  {formatCost(calculateCost(requests, bestTier))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold mb-4">Cost breakdown by tier:</h3>
            {tiers.map((tier) => {
              const cost = calculateCost(requests, tier);
              const isAvailable = cost !== Infinity;
              const isBest = tier.name === bestTier.name;
              
              return (
                <div
                  key={tier.name}
                  className={lex items-center justify-between p-4 rounded-lg border-2 transition-all }
                >
                  <div className="flex items-center gap-3">
                    {isBest && isAvailable && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                        BEST VALUE
                      </span>
                    )}
                    <div>
                      <div className="font-semibold">{tier.name}</div>
                      <div className="text-sm text-gray-600">
                         per request
                        {tier.maxRequests && tier.maxRequests !== Infinity && 
                           • Up to  requests
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="ext-xl font-bold">
                      {formatCost(cost)}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong>Note:</strong> Prices are estimates. Actual costs depend on your usage patterns.
            All plans include rate limiting, SSRF protection, and schema validation.
          </div>
        </div>
      </div>

      <style>{
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
        }
      }</style>
    </section>
  );
};
