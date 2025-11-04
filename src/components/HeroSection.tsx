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
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
          {title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          {subtitle}
        </p>
        {showCta && ctaText && onCtaClick && (
          <button
            onClick={onCtaClick}
            className="bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-2xl border-2 border-primary/20 backdrop-blur-sm"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}