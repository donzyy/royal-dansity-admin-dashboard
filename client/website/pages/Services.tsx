import Header from "@/website/components/Header";
import Footer from "@/website/components/Footer";
import BackToTop from "@/website/components/BackToTop";

export default function Services() {
  const services = [
    {
      icon: "📊",
      title: "Investment Advisory",
      description:
        "Personalized investment strategies tailored to your specific goals, risk tolerance, and time horizon.",
      features: [
        "Comprehensive financial planning",
        "Asset allocation strategies",
        "Market analysis and insights",
        "Risk assessment and management",
      ],
    },
    {
      icon: "🏢",
      title: "Real Estate Development",
      description:
        "Access to premium real estate investment opportunities in prime markets with strong growth potential.",
      features: [
        "Residential development projects",
        "Commercial property investments",
        "Mixed-use developments",
        "Emerging market opportunities",
      ],
    },
    {
      icon: "💼",
      title: "Portfolio Management",
      description:
        "Active management of your investment portfolio with continuous monitoring and strategic adjustments.",
      features: [
        "Diversified portfolio construction",
        "Performance tracking and reporting",
        "Rebalancing and optimization",
        "Tax-efficient strategies",
      ],
    },
    {
      icon: "🛡️",
      title: "Wealth Preservation",
      description:
        "Comprehensive strategies to protect and preserve your wealth for future generations.",
      features: [
        "Legacy planning",
        "Tax optimization",
        "Estate planning",
        "Risk mitigation",
      ],
    },
    {
      icon: "🌍",
      title: "Global Investment Solutions",
      description:
        "Exposure to international markets with local expertise and global perspective.",
      features: [
        "Emerging markets access",
        "Currency hedging",
        "Cross-border investments",
        "International diversification",
      ],
    },
    {
      icon: "📈",
      title: "Alternative Investments",
      description:
        "Unique investment opportunities beyond traditional stocks and bonds.",
      features: [
        "Private equity",
        "Hedge funds",
        "Commodities trading",
        "Structured products",
      ],
    },
  ];

  const industries = [
    "Technology & Innovation",
    "Healthcare & Pharma",
    "Real Estate & Construction",
    "Energy & Infrastructure",
    "Financial Services",
    "Consumer & Retail",
  ];

  return (
    <div className="w-full">
      <Header />

      {/* Hero Section */}
      <div className="bg-royal-purple text-white pt-40 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl opacity-90">
            Comprehensive investment solutions designed to meet your unique needs
            and help you achieve financial success.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-royal-container rounded-2xl p-8 md:p-10 border border-royal-gold/20 hover:border-royal-gold hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-royal-black mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <span className="text-royal-gold font-bold mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black text-center mb-16">
            Our Process
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Discovery",
                description:
                  "We learn about your goals, risk profile, and financial situation.",
              },
              {
                number: "02",
                title: "Analysis",
                description:
                  "Our team conducts in-depth analysis of opportunities and risks.",
              },
              {
                number: "03",
                title: "Strategy",
                description:
                  "We develop a customized investment strategy tailored to you.",
              },
              {
                number: "04",
                title: "Implementation",
                description:
                  "We execute the strategy with precision and ongoing oversight.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 text-center border-l-4 border-royal-gold hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl font-bold text-royal-gold mb-3">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-royal-black mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black text-center mb-12">
            Industries We Serve
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <div
                key={idx}
                className="bg-royal-container rounded-xl p-6 text-center hover:bg-royal-gold hover:text-white transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-lg font-bold">{industry}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black text-center mb-16">
            Why Choose Royal Dansity
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Proven Track Record",
                description:
                  "Nearly 20 years of delivering consistent, risk-adjusted returns for our clients.",
              },
              {
                title: "Expert Team",
                description:
                  "Industry veterans with decades of combined experience across all asset classes.",
              },
              {
                title: "Personalized Service",
                description:
                  "Customized strategies designed specifically for your unique needs and goals.",
              },
              {
                title: "Transparency & Ethics",
                description:
                  "Complete transparency in all dealings with unwavering commitment to ethics.",
              },
              {
                title: "Technology-Driven",
                description:
                  "Cutting-edge tools and platforms for monitoring and managing your investments.",
              },
              {
                title: "24/7 Support",
                description:
                  "Dedicated support team available to answer questions and provide guidance.",
              },
            ].map((reason, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-royal-gold flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-royal-black mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a consultation with one of our investment advisors to discuss
            how we can help you achieve your financial goals.
          </p>
          <a
            href="/contact"
            className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Schedule Your Consultation
          </a>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
