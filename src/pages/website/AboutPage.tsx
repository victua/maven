import { CheckCircle2 } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        title="How Maven Works"
        subtitle="A streamlined, managed process that protects candidates while delivering quality talent to agencies worldwide"
        showCta={false}
      />

      <section className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="space-y-12 mb-20">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="bg-secondary text-white w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Subscribe to Maven</h3>
              <p className="text-gray-600 leading-relaxed">
                Agencies choose a subscription tier that fits their hiring needs. Our flexible plans include
                different request limits and support levels to match your recruitment volume.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="bg-primary text-white w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Submit Hiring Requests</h3>
              <p className="text-gray-600 leading-relaxed">
                Detail your specific needs - "50 drivers for Dubai" or "25 teachers for Qatar" - including
                requirements, salary ranges, and timelines. Our platform captures all essential information.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="bg-secondary text-white w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Maven Team Matches Candidates</h3>
              <p className="text-gray-600 leading-relaxed">
                Our expert team reviews your request and searches our verified database for the best matches.
                We handle all candidate vetting, approval, and initial engagement - protecting candidate privacy throughout.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="bg-primary text-white w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Receive Qualified Candidates</h3>
              <p className="text-gray-600 leading-relaxed">
                Once matched, you receive candidate profiles ready for final interviews and placement.
                Pay success-based fees only for successful placements, ensuring alignment of interests.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Agencies Choose Maven
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Pre-Vetted Talent Pool</h4>
                <p className="text-gray-600">Access thousands of verified Kenyan professionals</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Managed Matching Process</h4>
                <p className="text-gray-600">Our team handles sourcing and initial screening</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quality Assurance</h4>
                <p className="text-gray-600">Every candidate verified and ready for international placement</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Success-Based Pricing</h4>
                <p className="text-gray-600">Pay placement fees only for successful hires</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
