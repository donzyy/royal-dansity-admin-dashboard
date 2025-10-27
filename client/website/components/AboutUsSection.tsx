import { Link } from "react-router-dom";

export default function AboutUsSection() {
  return (
    <section className="py-20 md:py-28 bg-royal-container">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop"
                alt="Royal Dansity Office"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-royal-black/30 to-transparent"></div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-6">
              About Royal Dansity
            </h2>

            <div className="space-y-4 mb-8 text-gray-700">
              <p className="text-lg leading-relaxed">
                Royal Dansity Investments International is a premier investment
                firm dedicated to building sustainable wealth for our clients.
                With decades of combined expertise, our team provides strategic
                guidance across real estate, portfolio management, and diverse
                investment opportunities.
              </p>

              <p className="text-lg leading-relaxed">
                Our mission is to empower individuals and corporations to make
                informed investment decisions that lead to long-term prosperity
                and financial security. We believe in transparency, integrity,
                and delivering exceptional results.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-royal-gold flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-lg font-semibold text-royal-black">
                    Expert Financial Guidance
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-royal-gold flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-lg font-semibold text-royal-black">
                    Transparent & Ethical Practices
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-royal-gold flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-lg font-semibold text-royal-black">
                    Proven Track Record of Success
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Read More About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
