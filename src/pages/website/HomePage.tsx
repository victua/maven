import { Building2, ShieldCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../../components/HeroSection';

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
  };
  return (
    <div className="min-h-screen">
      <HeroSection
        title="Connect with Verified Kenyan Talent"
        subtitle="Maven bridges the gap between recruitment agencies and pre-vetted Kenyan professionals. Submit your hiring needs and let our expert team deliver quality-matched candidates for your overseas roles."
        ctaText="Start Hiring Today"
        onCtaClick={() => handleNavigate('signup')}
      />

      <section className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">For Agencies</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Subscribe to our platform and submit specific hiring requests. We handle candidate sourcing,
              vetting, and matching to deliver quality talent that meets your requirements.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-secondary/10 w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Verified Professionals</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              All candidates in our database are pre-vetted, verified, and ready for international placements.
              We protect their privacy while ensuring quality matches.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/20 w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Connecting Kenyan talent with opportunities in the Middle East, Europe, and beyond.
              We facilitate legitimate international employment through trusted agencies.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-12 sm:py-16">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Fill Your Positions?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/80 px-4">
            Join agencies worldwide who trust Maven for quality talent fulfillment
          </p>
          <button
            onClick={() => handleNavigate('signup')}
            className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 hover:bg-white/90 transition-all font-semibold text-sm sm:text-base"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Developer Setup Section */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => handleNavigate('setup')}
          className="bg-gray-800 text-white px-3 sm:px-4 py-2 border border-gray-300 hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium shadow-lg"
        >
          <span className="hidden sm:inline">Setup Demo</span>
          <span className="sm:hidden">Setup</span>
        </button>
      </div>
    </div>
  );
}
