import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Users, Building2, TrendingUp, CheckCircle, Award, Globe, Stethoscope, Code, UserCheck, FileCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Add custom animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-up {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.2s ease-out;
  }

  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const navigate = useNavigate();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowServicesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigate(`/${page}`);
    }
  };

  const featuredVentures = [
    {
      name: 'Healthcare Professionals',
      category: 'Healthcare',
      metrics: '1000+ professionals',
      impact: 'International placements',
      description: 'Connecting qualified Kenyan healthcare professionals with international opportunities in the Middle East, Europe, and North America through verified credentials and comprehensive support.',
      icon: Stethoscope
    },
    {
      name: 'Construction Workers',
      category: 'Construction',
      metrics: '500+ skilled workers',
      impact: '15+ countries',
      description: 'Placing skilled construction professionals in international projects with verified certifications, safety training, and comprehensive documentation support.',
      icon: Building2
    },
    {
      name: 'IT Professionals',
      category: 'Technology',
      metrics: '200+ tech experts',
      impact: 'Global opportunities',
      description: 'Matching Kenyan IT professionals with remote and on-site opportunities worldwide, including software development, cybersecurity, and digital infrastructure roles.',
      icon: Code
    },
    {
      name: 'Hospitality Staff',
      category: 'Hospitality',
      metrics: '300+ professionals',
      impact: 'Premium placements',
      description: 'Connecting hospitality professionals with luxury hotels, resorts, and cruise lines worldwide, focusing on premium service roles and career advancement opportunities.',
      icon: Award
    }
  ];

  const agencyProjects = [
    {
      name: 'Healthcare Recruitment',
      project: 'Middle East Partners',
      services: 'Verification, documentation, placement',
      impact: 'Successfully placed 500+ healthcare professionals in the Middle East with 95% retention rate and comprehensive support throughout the placement process.',
      logos: ['/maven-logo.png']
    },
    {
      name: 'Construction Workforce',
      project: 'European Contractors',
      services: 'Skills assessment, certification, placement',
      impact: 'Delivered skilled construction workers to major European projects with verified credentials and safety certifications, maintaining 98% client satisfaction.',
      logos: ['/maven-logo.png']
    },
    {
      name: 'Tech Talent Pipeline',
      project: 'Global Tech Companies',
      services: 'Skills verification, remote placement, support',
      impact: 'Created a continuous pipeline of qualified Kenyan tech talent for global companies, resulting in 200+ successful remote placements.',
      logos: ['/maven-logo.png']
    },
    {
      name: 'Hospitality Excellence',
      project: 'Luxury Hotel Chains',
      services: 'Training, placement, career development',
      impact: 'Established partnerships with premium hospitality brands, placing 300+ professionals in luxury establishments worldwide.',
      logos: ['/maven-logo.png']
    },
    {
      name: 'Comprehensive Support',
      project: 'All Sectors',
      services: 'Documentation, visa support, integration',
      impact: 'Provided end-to-end support including visa processing, documentation, and cultural integration for over 1000+ successful international placements.',
      logos: ['/maven-logo.png']
    }
  ];

  const agencyServices = [
    {
      title: 'Professional Verification',
      description: 'Comprehensive verification of credentials, experience, and qualifications to ensure only the highest quality professionals are presented to international employers.',
      icon: CheckCircle,
      features: ['Credential Verification', 'Experience Validation', 'Skills Assessment', 'Background Checks'],
      link: '/verification',
      image: '/maven-verification.jpg',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'International Placement',
      description: 'Connecting verified professionals with legitimate international opportunities across healthcare, construction, IT, and hospitality sectors worldwide.',
      icon: Globe,
      features: ['Global Network', 'Verified Employers', 'Multiple Sectors', 'Ongoing Support'],
      link: '/placement',
      image: '/maven-placement.jpg',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      title: 'Documentation Support',
      description: 'Complete assistance with visa processing, work permits, and all required documentation for international employment opportunities.',
      icon: FileCheck,
      features: ['Visa Processing', 'Work Permits', 'Legal Documentation', 'Compliance Support'],
      link: '/documentation',
      image: '/maven-docs.jpg',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Career Development',
      description: 'Ongoing career support including skills training, professional development, and long-term career advancement opportunities.',
      icon: TrendingUp,
      features: ['Skills Training', 'Career Coaching', 'Professional Development', 'Long-term Support'],
      link: '/career',
      image: '/maven-career.jpg',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];


  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section - Text */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-[95%] mx-auto mobile:px-4 tablet:px-6 desktop:px-8 mobile:pt-20 tablet:pt-28 desktop:pt-32 mobile:pb-12 tablet:pb-16 desktop:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center relative">
            <div className="lg:col-span-7">
              {/* Promo Banner */}
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-4 py-2 mb-6 hover:bg-secondary/20 transition-all duration-300 group opacity-0 translate-y-8"
                style={{animation: 'fadeInUp 0.8s ease-out 0.1s forwards'}}
              >
                <Globe className="w-4 h-4 text-secondary animate-pulse" />
                <span className="text-sm font-semibold text-secondary">International Opportunities Available Now</span>
                <ArrowRight className="w-3 h-3 text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <h1 className="mobile:text-4xl tablet:text-5xl desktop:text-6xl font-bold text-primary leading-none mobile:mb-6 tablet:mb-8 desktop:mb-10 opacity-0 translate-y-8 transition-all duration-700 ease-out hover:scale-[1.02] cursor-default" style={{animation: 'fadeInUp 0.8s ease-out 0.2s forwards'}}>
                Your Gateway to
                <span className="text-secondary block">Global Career Opportunities</span>
              </h1>

              <p className="mobile:text-lg tablet:text-xl desktop:text-2xl text-primary/70 font-light mobile:mb-8 tablet:mb-10 desktop:mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out hover:text-primary/90 cursor-default max-w-2xl" style={{animation: 'fadeInUp 0.8s ease-out 0.4s forwards'}}>
                Maven connects qualified Kenyan professionals with international employers. Build your professional profile, get verified, and access life-changing job opportunities abroad.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 opacity-0 translate-y-8 transition-all duration-700 ease-out relative z-50" style={{animation: 'fadeInUp 0.8s ease-out 0.6s forwards'}}>
                <button
                  onClick={() => handleNavigate('signup')}
                  className="bg-primary text-white px-8 py-5 hover:bg-secondary transition-all duration-300 font-semibold text-lg inline-flex items-center justify-center gap-3 group hover:shadow-xl"
                >
                  <span>Create Your Profile</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="relative z-[100]" ref={dropdownRef}>
                  <button
                    onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-5 transition-all duration-300 font-semibold text-lg inline-flex items-center justify-center gap-3 group w-full"
                  >
                    <span>For Agencies</span>
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>

                  {showServicesDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border-2 border-primary/20 shadow-2xl z-[9999] max-h-96 overflow-y-auto animate-slide-up" style={{ position: 'absolute', zIndex: 9999 }}>
                      <div className="p-2 bg-white">
                        <button
                          onClick={() => {
                            handleNavigate('contact');
                            setShowServicesDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/5 transition-colors group flex items-center justify-between border-b border-primary/10 mb-2"
                        >
                          <span className="text-secondary font-medium">General Inquiry</span>
                          <ArrowUpRight className="w-4 h-4 text-secondary/40 group-hover:text-secondary transition-colors" />
                        </button>
                        {[
                          'Professional Verification',
                          'International Placement',
                          'Documentation Support',
                          'Career Development'
                        ].map((service, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleNavigate('contact');
                              setShowServicesDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors group flex items-center justify-between"
                          >
                            <span className="text-primary font-medium">{service}</span>
                            <ArrowUpRight className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                          </button>
                        ))}
                      </div>
                      <div className="p-4 border-t border-primary/10 bg-white">
                        <p className="text-sm text-primary/70 font-medium">Select a service to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50 p-8 lg:p-12 opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{animation: 'fadeInUp 0.8s ease-out 0.8s forwards'}}>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-4xl lg:text-5xl font-bold text-primary">1000+</h3>
                    <p className="text-sm text-primary/60">Verified Professionals</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl lg:text-5xl font-bold text-secondary">50+</h3>
                    <p className="text-sm text-primary/60">Partner Agencies</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl lg:text-5xl font-bold text-primary">15+</h3>
                    <p className="text-sm text-primary/60">Countries</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl lg:text-5xl font-bold text-secondary">95%</h3>
                    <p className="text-sm text-primary/60">Success Rate</p>
                  </div>
                </div>
              </div>

              {/* Trusted By Logos */}
              <div className="w-full overflow-hidden lg:overflow-visible mt-8 opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{animation: 'fadeInUp 0.8s ease-out 1.0s forwards'}}>
                <p className="text-sm text-primary/50 uppercase tracking-wider font-medium mb-4">Trusted By International Partners</p>
                <div className="flex flex-wrap gap-4 lg:gap-6 items-center">
                  <div className="h-5 lg:h-6 w-20 bg-primary/20 opacity-60 hover:opacity-100 transition-opacity"></div>
                  <div className="h-5 lg:h-6 w-16 bg-secondary/20 opacity-60 hover:opacity-100 transition-opacity"></div>
                  <div className="h-5 lg:h-6 w-24 bg-primary/20 opacity-60 hover:opacity-100 transition-opacity"></div>
                  <div className="h-5 lg:h-6 w-18 bg-secondary/20 opacity-60 hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Image */}
      <section className="relative bg-white">
        <div className="mobile:mx-0 mobile:px-0 tablet:max-w-[95%] tablet:mx-auto tablet:px-6 desktop:max-w-[95%] desktop:mx-auto desktop:px-8 mobile:pb-12 tablet:pb-16 desktop:pb-20">
          <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative overflow-hidden mobile:shadow-lg tablet:shadow-2xl desktop:shadow-2xl opacity-0 translate-y-8 transition-all duration-700 ease-out hover:scale-[1.02] mobile:hover:shadow-xl tablet:hover:shadow-3xl desktop:hover:shadow-3xl" style={{animation: 'fadeInUp 0.8s ease-out 0.6s forwards'}}>
            <img
              src="/marketing.jpeg"
              alt="Maven Professional Network"
              className="w-full h-full object-cover transition-all duration-700 hover:scale-105 hover:brightness-110"
            />
            <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all duration-500"></div>
          </div>
        </div>
      </section>

      {/* Services - 3 Column Layout */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-[95%] mx-auto mobile:px-4 tablet:px-6 desktop:px-8">

          {/* Desktop 3-Column Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Header Card - Top Left */}
            <div className="bg-primary text-white p-8 flex flex-col justify-center">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm mb-6 self-start">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Our Services</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Professional <span className="text-secondary">Global Placement</span>
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                Comprehensive support for international career opportunities, from verification to placement and beyond.
              </p>
            </div>

            {/* Service Cards - Middle */}
            {agencyServices.slice(0, 2).map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-primary/10 p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
                  onClick={() => handleNavigate(service.link.substring(1))}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-primary/10">0{index + 1}</span>
                    <Icon className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4">
                    {service.title}
                  </h3>
                  <p className="text-primary/70 text-sm mb-6 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex flex-wrap gap-2">
                      {service.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs text-primary/60 bg-primary/5 px-3 py-1">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Second Row */}
            {agencyServices.slice(2, 4).map((service, index) => {
              const Icon = service.icon;
              const realIndex = index + 2;
              return (
                <div
                  key={realIndex}
                  className="bg-white border-2 border-primary/10 p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
                  onClick={() => handleNavigate(service.link.substring(1))}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-primary/10">0{realIndex + 1}</span>
                    <Icon className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4">
                    {service.title}
                  </h3>
                  <p className="text-primary/70 text-sm mb-6 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex flex-wrap gap-2">
                      {service.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs text-primary/60 bg-primary/5 px-3 py-1">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA Card - Bottom Right */}
            <div
              className="bg-white border-2 border-secondary/20 hover:border-secondary hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
              onClick={() => handleNavigate('services')}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/marketing.jpeg"
                  alt="Maven Services"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/70 group-hover:bg-black/80 transition-all duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <div className="mb-4">
                  <ArrowUpRight className="w-12 h-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Explore All Services
                </h3>

                <p className="text-white/90 text-sm mb-6">
                  Discover our complete range of professional services and find the perfect path to your international career.
                </p>

                <div className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all self-start">
                  <span>View Services</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Card View */}
          <div className="grid md:hidden gap-6">
            {/* Mobile Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 bg-primary/10 mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Services</span>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">Professional <span className="text-secondary">Global Placement</span></h2>
              <p className="text-primary/70">
                Comprehensive support for international career opportunities, from verification to placement and beyond.
              </p>
            </div>

            {/* Mobile Service Cards */}
            {agencyServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-primary/10 p-6 hover:shadow-lg transition-all group block cursor-pointer"
                  onClick={() => handleNavigate(service.link.substring(1))}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-primary/30 text-sm font-mono">0{index + 1}</span>
                    <Icon className="w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">
                    {service.title}
                  </h3>
                  <p className="text-primary/60 text-sm mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className="text-xs text-primary/50 bg-primary/5 px-2 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Mobile CTA */}
            <div
              className="bg-gradient-to-br from-secondary to-primary text-white p-6 text-center group cursor-pointer"
              onClick={() => handleNavigate('services')}
            >
              <ArrowUpRight className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Explore All Services</h3>
              <p className="text-white/90 text-sm mb-4">
                Discover our complete range of professional services.
              </p>
              <div className="inline-flex items-center gap-2 font-semibold">
                <span>View Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Success Stories - 3 Column Layout */}
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        <div className="max-w-[95%] mx-auto mobile:px-4 tablet:px-6 desktop:px-8 relative z-10">

          {/* Desktop 3-Column Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Header Card - Top Left */}
            <div className="bg-primary text-white p-8 flex flex-col justify-center">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm mb-6 self-start">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Success Stories</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Our <span className="text-secondary">Impact</span>
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                Transforming careers through successful international placements across multiple sectors
              </p>
            </div>

            {/* Project Cards - Middle */}
            {agencyProjects.slice(0, 2).map((project, index) => (
              <div
                key={index}
                className="bg-white border-2 border-primary/10 p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="flex items-start justify-between mb-6">
                  <span className="text-5xl font-bold text-primary/10">0{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-16 bg-primary/20"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-4 line-clamp-2">
                  {project.name}
                </h3>
                <p className="text-primary/70 text-sm mb-6 line-clamp-3">
                  {project.impact}
                </p>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-primary/50 text-xs uppercase tracking-wider">
                    {project.services}
                  </p>
                </div>
              </div>
            ))}

            {/* Second Row */}
            {agencyProjects.slice(2, 4).map((project, index) => {
              const realIndex = index + 2;
              return (
                <div
                  key={realIndex}
                  className="bg-white border-2 border-primary/10 p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-primary/10">0{realIndex + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 bg-secondary/20"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4 line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-primary/70 text-sm mb-6 line-clamp-3">
                    {project.impact}
                  </p>
                  <div className="pt-4 border-t border-primary/10">
                    <p className="text-primary/50 text-xs uppercase tracking-wider">
                      {project.services}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* CTA Card - Bottom Right */}
            <div
              className="bg-white border-2 border-secondary/20 hover:border-secondary hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
              onClick={() => handleNavigate('success-stories')}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/marketing.jpeg"
                  alt="Maven Success Stories"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/70 group-hover:bg-black/80 transition-all duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <div className="mb-4">
                  <ArrowUpRight className="w-12 h-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  More Success Stories
                </h3>

                <p className="text-white/90 text-sm mb-6">
                  Discover how we've transformed careers through successful international placements and comprehensive support.
                </p>

                <div className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all self-start">
                  <span>View Stories</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Card View */}
          <div className="grid md:hidden gap-6">
            {/* Mobile Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 bg-primary/10 mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Success Stories</span>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">Our <span className="text-secondary">Impact</span></h2>
              <p className="text-primary/70">
                Transforming careers through successful international placements across multiple sectors
              </p>
            </div>

            {/* Mobile Project Cards */}
            {agencyProjects.slice(0, 4).map((project, index) => (
              <div
                key={index}
                className="bg-white border border-primary/10 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-primary/30 text-sm font-mono">0{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-12 bg-primary/20"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {project.name}
                </h3>
                <p className="text-primary/60 text-sm mb-3">
                  {project.project}
                </p>
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-primary/50 text-xs mb-2">{project.services}</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-primary/70 text-xs font-medium">{project.impact}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile CTA */}
            <div
              className="bg-secondary text-white p-6 text-center group cursor-pointer"
              onClick={() => handleNavigate('success-stories')}
            >
              <ArrowUpRight className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">More Success Stories</h3>
              <p className="text-white/90 text-sm mb-4">
                Discover how we've transformed careers through successful international placements.
              </p>
              <div className="inline-flex items-center gap-2 font-semibold">
                <span>View Stories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Professional Categories - 3 Column Layout */}
      <section className="py-20 md:py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5"></div>
        </div>
        <div className="max-w-[95%] mx-auto mobile:px-4 tablet:px-6 desktop:px-8 relative z-10">

          {/* Desktop 3-Column Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Header Card - Top Left */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white p-8 flex flex-col justify-center">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm mb-6 self-start">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Categories</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Professional <span className="text-yellow-300">Opportunities</span>
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                International career opportunities across multiple sectors for qualified Kenyan professionals
              </p>
            </div>

            {/* Venture Cards - Middle */}
            {featuredVentures.slice(0, 2).map((venture, index) => {
              const Icon = venture.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-8 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-white/20">0{index + 1}</span>
                    <Icon className="w-10 h-10 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-white/20 text-xs font-medium uppercase tracking-wider mb-2">
                      {venture.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {venture.name}
                    </h3>
                  </div>
                  <p className="text-white/80 text-sm mb-6 line-clamp-3">
                    {venture.description}
                  </p>
                  <div className="pt-4 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Metrics</p>
                        <p className="text-white font-semibold text-sm">{venture.metrics}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Impact</p>
                        <p className="text-white font-semibold text-sm">{venture.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Second Row */}
            {featuredVentures.slice(2, 4).map((venture, index) => {
              const Icon = venture.icon;
              const realIndex = index + 2;
              return (
                <div
                  key={realIndex}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-8 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-white/20">0{realIndex + 1}</span>
                    <Icon className="w-10 h-10 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-white/20 text-xs font-medium uppercase tracking-wider mb-2">
                      {venture.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {venture.name}
                    </h3>
                  </div>
                  <p className="text-white/80 text-sm mb-6 line-clamp-3">
                    {venture.description}
                  </p>
                  <div className="pt-4 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Metrics</p>
                        <p className="text-white font-semibold text-sm">{venture.metrics}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Impact</p>
                        <p className="text-white font-semibold text-sm">{venture.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA Card - Bottom Right */}
            <div
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 group relative overflow-hidden cursor-pointer"
              onClick={() => handleNavigate('opportunities')}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/marketing.jpeg"
                  alt="Maven Opportunities"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/80 group-hover:bg-primary/90 transition-all duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <div className="mb-4">
                  <ArrowUpRight className="w-12 h-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Explore All Opportunities
                </h3>

                <p className="text-white/90 text-sm mb-6">
                  Discover our complete range of international career opportunities across all professional sectors.
                </p>

                <div className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all self-start">
                  <span>View Opportunities</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Card View */}
          <div className="grid md:hidden gap-6">
            {/* Mobile Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm mb-6">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Categories</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Professional <span className="text-yellow-300">Opportunities</span></h2>
              <p className="text-white/90">
                International career opportunities across multiple sectors for qualified Kenyan professionals
              </p>
            </div>

            {/* Mobile Venture Cards */}
            {featuredVentures.map((venture, index) => {
              const Icon = venture.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 hover:bg-white/15 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-white/30 text-sm font-mono">0{index + 1}</span>
                    <Icon className="w-8 h-8 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {venture.category}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {venture.description}
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/80 font-semibold mb-2">{venture.name}</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                      <p className="text-white/70 text-xs">{venture.metrics} • {venture.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile CTA */}
            <div
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white p-6 text-center group cursor-pointer"
              onClick={() => handleNavigate('opportunities')}
            >
              <ArrowUpRight className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Explore All Opportunities</h3>
              <p className="text-white/90 text-sm mb-4">
                Discover our complete range of international career opportunities.
              </p>
              <div className="inline-flex items-center gap-2 font-semibold">
                <span>View Opportunities</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="mobile:py-20 tablet:py-24 desktop:py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5"></div>
        </div>
        <div className="max-w-[95%] mx-auto mobile:px-4 tablet:px-6 desktop:px-8 text-center relative z-10">
          <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm mb-8">
            <span className="text-sm font-semibold text-white uppercase tracking-wider">Get Started</span>
          </div>
          <h2 className="text-3xl tablet:text-5xl lg:text-7xl font-bold mb-8 animate-fade-in-up">
            Ready to Launch Your <span className="text-white/90">Global Career?</span>
          </h2>
          <p className="text-lg tablet:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-100">
            Whether you're a professional seeking international opportunities or an agency looking for qualified talent, Maven is your trusted partner for global career success.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-200">
            <button
              onClick={() => handleNavigate('signup')}
              className="bg-white text-primary px-10 py-6 hover:bg-white/90 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 group"
            >
              <UserCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span>Create Your Profile</span>
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-6 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 backdrop-blur-sm group hover:scale-105 transform"
            >
              <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Partner with Us</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
