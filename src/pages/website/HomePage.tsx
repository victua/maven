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
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 border-y border-gray-200">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-slideInUp delay-100">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm sm:text-base text-gray-600">Verified Professionals</div>
            </div>
            <div className="animate-slideInUp delay-200">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm sm:text-base text-gray-600">Partner Agencies</div>
            </div>
            <div className="animate-slideInUp delay-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm sm:text-base text-gray-600">Countries</div>
            </div>
            <div className="animate-slideInUp delay-400">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12 sm:mb-16 animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How Maven Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, transparent process that connects talent with opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative animate-slideInUp delay-100">
              <div className="bg-white p-8 rounded-xl border-2 border-primary/20 shadow-lg card-hover h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold shadow-lg">
                    1
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <UserCheck className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Create Your Profile</h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    Job seekers create a comprehensive professional profile showcasing their skills, experience, and qualifications.
                  </p>
                </div>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-primary animate-pulse-slow" />
            </div>

            {/* Step 2 */}
            <div className="relative animate-slideInUp delay-200">
              <div className="bg-white p-8 rounded-xl border-2 border-primary/20 shadow-lg card-hover h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-secondary to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold shadow-lg">
                    2
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="bg-secondary/10 p-4 rounded-full">
                      <FileCheck className="h-12 w-12 text-secondary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Get Verified</h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    Our team verifies your credentials, documents, and experience to ensure quality and build trust with employers.
                  </p>
                </div>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-primary animate-pulse-slow" />
            </div>

            {/* Step 3 */}
            <div className="relative animate-slideInUp delay-300">
              <div className="bg-white p-8 rounded-xl border-2 border-primary/20 shadow-lg card-hover h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold shadow-lg">
                    3
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Briefcase className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Get Matched</h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    Recruitment agencies request profiles for specific roles, and we match qualified candidates to the right opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Job Seekers Section */}
      <section className="bg-gradient-to-br from-primary/5 via-blue-50 to-primary/10 py-16 sm:py-20 overflow-hidden">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInLeft">
              <div className="inline-block bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
                FOR JOB SEEKERS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Launch Your International Career
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Maven is your trusted partner in securing legitimate international employment. We help Kenyan professionals like you access opportunities in the Middle East, Europe, Asia, and beyond.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start animate-fadeIn delay-100">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-gray-700">Free professional profile creation and verification</span>
                </li>
                <li className="flex items-start animate-fadeIn delay-200">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-gray-700">Access to vetted international recruitment agencies</span>
                </li>
                <li className="flex items-start animate-fadeIn delay-300">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-gray-700">Privacy protection - your profile is only shared with approved agencies</span>
                </li>
                <li className="flex items-start animate-fadeIn delay-400">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-gray-700">Expert support throughout your job search journey</span>
                </li>
              </ul>
              <button
                onClick={() => handleNavigate('signup')}
                className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300 font-semibold text-lg shadow-lg flex items-center gap-2 group transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slideInRight">
              <div className="bg-white p-6 rounded-xl shadow-lg card-hover overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-3 rounded-full inline-block mb-3">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Diverse Opportunities</h4>
                  <p className="text-sm text-gray-600">Healthcare, hospitality, construction, IT, and more</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg card-hover overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-3 rounded-full inline-block mb-3">
                    <ShieldCheck className="h-10 w-10 text-secondary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Verified & Safe</h4>
                  <p className="text-sm text-gray-600">All agencies are thoroughly vetted for legitimacy</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg card-hover overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-3 rounded-full inline-block mb-3">
                    <Globe className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Global Network</h4>
                  <p className="text-sm text-gray-600">Connections across 15+ countries worldwide</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg card-hover overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-3 rounded-full inline-block mb-3">
                    <TrendingUp className="h-10 w-10 text-secondary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Career Growth</h4>
                  <p className="text-sm text-gray-600">Competitive salaries and professional development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies Section */}
      <section className="py-16 sm:py-20 bg-white overflow-hidden">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-slideInLeft">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg card-hover overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Candidates</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Access a database of pre-vetted, verified Kenyan professionals ready for international placements.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg card-hover overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-br-full"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Verified & Screened</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Every professional is thoroughly vetted with verified credentials and background checks.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg card-hover overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/30 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                      <FileCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Requests</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Submit your hiring requirements and receive matched candidate profiles within days.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg card-hover overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-br-full"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/30 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our team handles sourcing, matching, and coordination to streamline your recruitment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 animate-slideInRight">
              <div className="inline-block bg-gradient-to-r from-secondary to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
                FOR RECRUITMENT AGENCIES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Find the Right Talent, Faster
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Maven simplifies your recruitment process by providing instant access to a curated database of qualified Kenyan professionals. Save time, reduce costs, and improve placement success rates.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start animate-fadeIn delay-100">
                  <div className="bg-secondary/10 p-2 rounded-full mr-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Subscription-Based Access</h4>
                    <p className="text-gray-600">Flexible plans that scale with your hiring needs</p>
                  </div>
                </div>
                <div className="flex items-start animate-fadeIn delay-200">
                  <div className="bg-secondary/10 p-2 rounded-full mr-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart Matching</h4>
                    <p className="text-gray-600">AI-powered candidate matching based on your requirements</p>
                  </div>
                </div>
                <div className="flex items-start animate-fadeIn delay-300">
                  <div className="bg-secondary/10 p-2 rounded-full mr-4">
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
                className="bg-gradient-to-r from-secondary to-green-600 text-white px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300 font-semibold text-lg shadow-lg flex items-center gap-2 group transform hover:scale-105"
              >
                View Pricing Plans
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-primary text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 animate-fadeIn">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl sm:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-100">
            Whether you're a job seeker looking for international opportunities or an agency seeking quality talent, Maven is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideInUp delay-200">
            <button
              onClick={() => handleNavigate('signup')}
              className="bg-white text-primary px-10 py-4 rounded-lg hover:bg-white/90 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-3xl w-full sm:w-auto transform hover:scale-105"
            >
              Create Your Profile
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-lg hover:bg-white hover:text-primary transition-all duration-300 font-semibold text-lg w-full sm:w-auto transform hover:scale-105"
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
