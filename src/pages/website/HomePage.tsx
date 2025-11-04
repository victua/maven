import { Building2, ShieldCheck, Globe, UserCheck, Briefcase, FileCheck, ArrowRight, CheckCircle2, Users, TrendingUp } from 'lucide-react';
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
      {/* Hero Section */}
      <HeroSection
        title="Your Gateway to Global Career Opportunities"
        subtitle="Maven connects qualified Kenyan professionals with international employers. Build your professional profile, get verified, and access life-changing job opportunities abroad."
        ctaText="Create Your Profile"
        onCtaClick={() => handleNavigate('signup')}
      />

      {/* Trust Indicators */}
      <section className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm sm:text-base text-gray-600">Verified Professionals</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm sm:text-base text-gray-600">Partner Agencies</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm sm:text-base text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How Maven Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, transparent process that connects talent with opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-8 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all h-full">
                <div className="bg-primary text-white w-16 h-16 flex items-center justify-center mb-6 mx-auto text-2xl font-bold">
                  1
                </div>
                <div className="flex justify-center mb-4">
                  <UserCheck className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Create Your Profile</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  Job seekers create a comprehensive professional profile showcasing their skills, experience, and qualifications.
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-primary" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-8 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all h-full">
                <div className="bg-primary text-white w-16 h-16 flex items-center justify-center mb-6 mx-auto text-2xl font-bold">
                  2
                </div>
                <div className="flex justify-center mb-4">
                  <FileCheck className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Get Verified</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  Our team verifies your credentials, documents, and experience to ensure quality and build trust with employers.
                </p>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-primary" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-8 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all h-full">
                <div className="bg-primary text-white w-16 h-16 flex items-center justify-center mb-6 mx-auto text-2xl font-bold">
                  3
                </div>
                <div className="flex justify-center mb-4">
                  <Briefcase className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Get Matched</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  Recruitment agencies request profiles for specific roles, and we match qualified candidates to the right opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Job Seekers Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16 sm:py-20">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-primary text-white px-4 py-2 text-sm font-semibold mb-4">
                FOR JOB SEEKERS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Launch Your International Career
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Maven is your trusted partner in securing legitimate international employment. We help Kenyan professionals like you access opportunities in the Middle East, Europe, Asia, and beyond.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Free professional profile creation and verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Access to vetted international recruitment agencies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Privacy protection - your profile is only shared with approved agencies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Expert support throughout your job search journey</span>
                </li>
              </ul>
              <button
                onClick={() => handleNavigate('signup')}
                className="bg-primary text-white px-8 py-4 border border-primary hover:bg-primary/90 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 border border-gray-300 shadow-md">
                <Users className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Diverse Opportunities</h4>
                <p className="text-sm text-gray-600">Healthcare, hospitality, construction, IT, and more</p>
              </div>
              <div className="bg-white p-6 border border-gray-300 shadow-md">
                <ShieldCheck className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Verified & Safe</h4>
                <p className="text-sm text-gray-600">All agencies are thoroughly vetted for legitimacy</p>
              </div>
              <div className="bg-white p-6 border border-gray-300 shadow-md">
                <Globe className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Global Network</h4>
                <p className="text-sm text-gray-600">Connections across 15+ countries worldwide</p>
              </div>
              <div className="bg-white p-6 border border-gray-300 shadow-md">
                <TrendingUp className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Career Growth</h4>
                <p className="text-sm text-gray-600">Competitive salaries and professional development</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies Section */}
      <section className="py-16 sm:py-20">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 w-14 h-14 border border-gray-300 flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Candidates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access a database of pre-vetted, verified Kenyan professionals ready for international placements.
                  </p>
                </div>

                <div className="bg-white p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-secondary/10 w-14 h-14 border border-gray-300 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Verified & Screened</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every professional is thoroughly vetted with verified credentials and background checks.
                  </p>
                </div>

                <div className="bg-white p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-primary/20 w-14 h-14 border border-gray-300 flex items-center justify-center mb-4">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Requests</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Submit your hiring requirements and receive matched candidate profiles within days.
                  </p>
                </div>

                <div className="bg-white p-8 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-secondary/20 w-14 h-14 border border-gray-300 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our team handles sourcing, matching, and coordination to streamline your recruitment.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-secondary text-white px-4 py-2 text-sm font-semibold mb-4">
                FOR RECRUITMENT AGENCIES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Find the Right Talent, Faster
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Maven simplifies your recruitment process by providing instant access to a curated database of qualified Kenyan professionals. Save time, reduce costs, and improve placement success rates.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-secondary/10 p-2 mr-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Subscription-Based Access</h4>
                    <p className="text-gray-600">Flexible plans that scale with your hiring needs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary/10 p-2 mr-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart Matching</h4>
                    <p className="text-gray-600">AI-powered candidate matching based on your requirements</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary/10 p-2 mr-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Compliance & Documentation</h4>
                    <p className="text-gray-600">Complete documentation support for international placements</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleNavigate('pricing')}
                className="bg-secondary text-white px-8 py-4 border border-secondary hover:bg-secondary/90 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                View Pricing Plans
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-white py-16 sm:py-20">
        <div className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl sm:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Whether you're a job seeker looking for international opportunities or an agency seeking quality talent, Maven is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleNavigate('signup')}
              className="bg-white text-primary px-10 py-4 border border-gray-300 hover:bg-white/90 transition-all font-semibold text-lg shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Create Your Profile
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className="bg-transparent text-white border-2 border-white px-10 py-4 hover:bg-white hover:text-primary transition-all font-semibold text-lg w-full sm:w-auto"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Developer Setup Section */}
      <div className="fixed bottom-4 right-4 z-50">
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
