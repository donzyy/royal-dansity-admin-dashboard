import Header from "@/website/components/Header";
import Footer from "@/website/components/Footer";
import BackToTop from "@/website/components/BackToTop";

export default function About() {
  const values = [
    {
      icon: "🎯",
      title: "Integrity",
      description:
        "We operate with complete transparency and honesty in all our dealings with clients and partners.",
    },
    {
      icon: "💡",
      title: "Innovation",
      description:
        "We embrace new investment strategies and technologies to deliver cutting-edge solutions.",
    },
    {
      icon: "🤝",
      title: "Partnership",
      description:
        "We build long-term relationships based on trust, communication, and mutual success.",
    },
    {
      icon: "📈",
      title: "Excellence",
      description:
        "We strive for the highest standards in everything we do, from research to execution.",
    },
  ];

  const team = [
    {
      name: "James Richardson",
      role: "Chief Investment Officer",
      bio: "With 25+ years of investment experience, James leads our strategic investment decisions.",
    },
    {
      name: "Sarah Mitchell",
      role: "Head of Real Estate",
      bio: "Sarah brings 20 years of real estate development expertise across multiple markets.",
    },
    {
      name: "David Chen",
      role: "Portfolio Manager",
      bio: "David manages over $500M in portfolios with a track record of consistent outperformance.",
    },
    {
      name: "Emily Roberts",
      role: "Chief Compliance Officer",
      bio: "Emily ensures all operations meet the highest regulatory and ethical standards.",
    },
  ];

  return (
    <div className="w-full">
      <Header />

      {/* Hero Section */}
      <div className="bg-royal-purple text-white pt-40 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Royal Dansity</h1>
          <p className="text-xl max-w-3xl opacity-90">
            Royal Dansity Investments International is a premier investment firm
            dedicated to building sustainable wealth for our clients across diverse
            markets and asset classes.
          </p>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Founded in 2005, Royal Dansity emerged from a vision to provide
                institutional-quality investment management to discerning investors
                worldwide. What began as a boutique advisory firm has grown into a
                full-service investment platform managing billions in assets.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Over nearly two decades, we've built a reputation for rigorous
                analysis, creative strategies, and unwavering commitment to our
                clients' success. Our team of seasoned professionals combines deep
                market expertise with a collaborative approach that puts client
                outcomes first.
              </p>
              <div className="flex gap-4">
                <div>
                  <div className="text-4xl font-bold text-royal-gold">$2.5B</div>
                  <p className="text-gray-600 font-semibold">Assets Under Management</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-royal-gold">500+</div>
                  <p className="text-gray-600 font-semibold">Active Clients</p>
                </div>
              </div>
            </div>
            <div className="h-96 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                alt="Royal Dansity Office"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
              <h3 className="text-3xl font-bold text-royal-black mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To empower individuals and institutions to achieve their financial
                goals through innovative investment strategies, expert guidance, and
                unwavering commitment to transparency and excellence.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
              <h3 className="text-3xl font-bold text-royal-black mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be recognized globally as the premier investment partner for
                building and protecting wealth, known for integrity, innovation,
                and consistent delivery of exceptional risk-adjusted returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black text-center mb-16">
            Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-royal-container rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-royal-black mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 md:py-28 bg-royal-black text-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Our Leadership Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 hover:border-royal-gold transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-royal-gold to-royal-copper mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">{member.name}</h3>
                <p className="text-royal-gold font-semibold text-center mb-4">
                  {member.role}
                </p>
                <p className="text-gray-300 text-center text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-6">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of clients who trust Royal Dansity to manage and grow
            their wealth. Let's discuss how we can help you achieve your financial
            goals.
          </p>
          <a
            href="/contact"
            className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Get in Touch Today
          </a>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
