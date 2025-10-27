import { Link } from "react-router-dom";

interface Service {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    id: 1,
    icon: (
      <svg
        className="w-12 h-12"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    title: "Investment Advisory",
    description:
      "Get personalized investment strategies tailored to your financial goals. Our experts provide comprehensive guidance to maximize returns and minimize risk.",
  },
  {
    id: 2,
    icon: (
      <svg
        className="w-12 h-12"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Real Estate Development",
    description:
      "Access premium investment opportunities in prime real estate markets. We identify and develop properties with strong growth potential and reliable returns.",
  },
  {
    id: 3,
    icon: (
      <svg
        className="w-12 h-12"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM16 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Portfolio Management",
    description:
      "Benefit from active portfolio management to help grow and protect your wealth. Our team continuously monitors and adjusts your investments for optimal performance.",
  },
  {
    id: 4,
    icon: (
      <svg
        className="w-12 h-12"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267V5.25a3 3 0 00-3 3v6.57a3 3 0 003 3h6.075V9.07a2.5 2.5 0 00-.567-.267m-2.433 5.582a2.5 2.5 0 005 0v-5.5a.5.5 0 00-.5-.5h-4a.5.5 0 00-.5.5v5.5z" />
      </svg>
    ),
    title: "Wealth Preservation",
    description:
      "Protect and preserve your wealth for future generations. We provide comprehensive strategies for tax optimization and legacy planning.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive investment solutions designed to help you achieve
            financial success
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-royal-container rounded-2xl p-8 md:p-10 border border-royal-gold/20 hover:border-royal-gold hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="text-royal-gold group-hover:text-royal-gold mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-royal-black mb-4">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Learn More Button */}
              <button className="text-royal-gold font-semibold hover:text-royal-copper transition-colors duration-200 inline-flex items-center gap-2">
                Learn More
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 md:mt-24">
          <p className="text-gray-600 mb-6">
            Ready to start your investment journey?
          </p>
          <Link
            to="/services"
            className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Explore All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
