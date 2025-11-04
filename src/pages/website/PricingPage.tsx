import { Check } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

export function PricingPage({ onNavigate }: PricingPageProps) {
  const tiers = [
    {
      name: 'Basic',
      price: '$299',
      description: 'Perfect for agencies getting started',
      features: [
        'Up to 5 hiring requests per month',
        'Standard matching turnaround',
        'Email support',
        'Basic analytics dashboard',
        'Success-based placement fees: 15%'
      ]
    },
    {
      name: 'Professional',
      price: '$599',
      description: 'For growing recruitment agencies',
      features: [
        'Up to 15 hiring requests per month',
        'Priority matching turnaround',
        'Priority email & chat support',
        'Advanced analytics & reporting',
        'Success-based placement fees: 12%',
        'Dedicated account manager'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For high-volume agencies',
      features: [
        'Unlimited hiring requests',
        'Fastest matching turnaround',
        '24/7 phone & chat support',
        'Custom analytics & API access',
        'Success-based placement fees: 10%',
        'Dedicated account team',
        'Custom SLA agreements'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that fits your agency's hiring needs. All plans include access to our verified talent pool and success-based placement fees."
        ctaText="Get Started Today"
        onCtaClick={() => onNavigate('signup')}
      />

      <section className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white shadow-lg hover:shadow-xl transition-shadow ${
                tier.popular ? 'ring-2 ring-primary relative' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-secondary text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`w-full py-3 font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-secondary text-white hover:bg-secondary/90'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  Get Started
                </button>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/10 p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
            Success-Based Placement Fees
          </h2>
          <p className="text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
            Pay only when you successfully place a candidate. Our placement fees are calculated as a percentage
            of the first year's salary and vary by subscription tier. This ensures we're aligned in finding
            the right candidates for your clients.
          </p>
        </div>
      </section>
    </div>
  );
}
