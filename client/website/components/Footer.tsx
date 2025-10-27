import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Footer() {
  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem("companyLogo") || "https://cdn.builder.io/api/v1/image/assets%2Fc1a72e692ea5461694fcea1d0b1d2a6c%2Fb052e28f3f744d14a6203df3e30e5970";
  });

  useEffect(() => {
    // Smooth scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  return (
    <footer className="bg-royal-black text-white py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={companyLogo}
                alt="Royal Dansity Logo"
                className="h-12 w-auto object-contain max-w-[180px]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://cdn.builder.io/api/v1/image/assets%2Fc1a72e692ea5461694fcea1d0b1d2a6c%2Fb052e28f3f744d14a6203df3e30e5970";
                }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Building sustainable wealth through strategic investments since our
              founding.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/" className="hover:text-royal-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-royal-gold transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-royal-gold transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-royal-gold transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-royal-gold transition-colors">
                  Investment Advisory
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-royal-gold transition-colors">
                  Real Estate
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-royal-gold transition-colors">
                  Portfolio Management
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-royal-gold transition-colors">
                  Wealth Preservation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <span className="block font-semibold text-white mb-1">Email</span>
                <a
                  href="mailto:info@royaldansity.com"
                  className="hover:text-royal-gold transition-colors"
                >
                  info@royaldansity.com
                </a>
              </li>
              <li>
                <span className="block font-semibold text-white mb-1">Phone</span>
                <a
                  href="tel:+12125550123"
                  className="hover:text-royal-gold transition-colors"
                >
                  +1 (212) 555-0123
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Royal Dansity Investments International. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs">
                Created with love by{' '}
                <a 
                  href="https://taureanitlogistics.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-royal-gold hover:text-royal-gold/80 transition-colors"
                >
                  Taurean IT Logistics
                </a>
                {' '}❤️
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-royal-gold transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20v-7.21H5.5V9.25h2.79V7.16c0-2.77 1.69-4.28 4.16-4.28 1.18 0 2.2.09 2.49.13v2.89h-1.71c-1.34 0-1.6.64-1.6 1.57v2.05h3.2l-.42 3.54h-2.78V20" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-royal-gold transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 2.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.032 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-royal-gold transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
