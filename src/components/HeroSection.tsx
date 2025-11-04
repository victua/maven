interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
  showCta?: boolean;
}

export function HeroSection({ title, subtitle, ctaText, onCtaClick, showCta = true }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/spark.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 mix-blend-overlay"></div>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-300"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-[96%]">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-slideInDown">
          {title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-fadeIn delay-200">
          {subtitle}
        </p>
        {showCta && ctaText && onCtaClick && (
          <button
            onClick={onCtaClick}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-10 py-5 rounded-lg text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl backdrop-blur-sm animate-slideInUp delay-400 inline-block"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}