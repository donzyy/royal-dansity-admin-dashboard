import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem("companyLogo") || "https://cdn.builder.io/api/v1/image/assets%2Fc1a72e692ea5461694fcea1d0b1d2a6c%2Fb052e28f3f744d14a6203df3e30e5970";
  });

  const navItems = [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "News & Articles", href: "/news" },
    { label: "Contact Us", href: "/contact" },
  ];

  useEffect(() => {
    // Smooth scroll to the top of the page when the component mounts
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0); // Set true if the user has scrolled.
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center pt-6">
        <nav className="bg-white rounded-2xl shadow-lg px-8 py-4 md:px-12 md:py-5 max-w-4xl">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={companyLogo}
                alt="Royal Dansity Logo"
                className="h-10 w-auto object-contain max-w-[150px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://cdn.builder.io/api/v1/image/assets%2Fc1a72e692ea5461694fcea1d0b1d2a6c%2Fb052e28f3f744d14a6203df3e30e5970";
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-royal-black hover:text-royal-gold transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6 text-royal-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-royal-black hover:text-royal-gold transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
