import Header from "@/website/components/Header";
import Footer from "@/website/components/Footer";
import BackToTop from "@/website/components/BackToTop";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/messages`, formData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Error submitting message:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
        setError('Please fix the errors below');
      } else {
        setError('Failed to send message. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Address",
      details: "123 Investment Boulevard, Financial District, New York, NY 10001",
    },
    {
      icon: "📞",
      title: "Phone",
      details: "+1 (212) 555-0123",
    },
    {
      icon: "📧",
      title: "Email",
      details: "info@royaldansity.com",
    },
    {
      icon: "🕐",
      title: "Business Hours",
      details: "Monday - Friday: 9:00 AM - 6:00 PM EST",
    },
  ];

  const offices = [
    {
      name: "Sefwi-Wiawso Headquarters",
      address: "123 Investment Boulevard, New York, NY 10001",
      phone: "+1 (212) 555-0123",
    },
    {
      name: "Accra Office",
      address: "45 Financial Street, London, UK EC2A 1AA",
      phone: "+44 (20) 7946 0958",
    },
  ];

  return (
    <div className="w-full">
      <Header />

      {/* Hero Section */}
      <div className="bg-royal-purple text-white pt-40 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl max-w-3xl opacity-90">
            Have a question about our services or want to schedule a consultation?
            We'd love to hear from you. Reach out to us today.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300">
                <div className="text-5xl mb-4">{info.icon}</div>
                <h3 className="text-xl font-bold text-royal-black mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-600">{info.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-royal-black mb-8">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-royal-black font-semibold mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-royal-gold'
                    }`}
                    placeholder="Your name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-royal-black font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-royal-gold'
                    }`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-royal-black font-semibold mb-2">
                    Phone <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-royal-gold'
                    }`}
                    placeholder="Your phone number"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-royal-black font-semibold mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                      errors.subject
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-royal-gold'
                    }`}
                    placeholder="What is this about?"
                    disabled={loading}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-royal-black font-semibold mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-6 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 resize-none ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-royal-gold'
                    }`}
                    placeholder="Tell us how we can help..."
                    disabled={loading}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-royal-gold hover:bg-yellow-600 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </motion.button>

                {/* Success Message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start gap-3"
                    >
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-green-800">Message Sent Successfully!</p>
                        <p className="text-sm text-green-700 mt-1">
                          Thank you for contacting us. We've received your message and will get back to you within 24-48 hours.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3"
                    >
                      <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-red-800">Error Sending Message</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Office Locations */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-royal-black mb-8">
                Our Offices
              </h2>
              <div className="space-y-8">
                {offices.map((office, idx) => (
                  <div
                    key={idx}
                    className="bg-royal-container rounded-2xl p-8 border-l-4 border-royal-gold hover:shadow-lg transition-all duration-300"
                  >
                    <h3 className="text-2xl font-bold text-royal-black mb-3">
                      {office.name}
                    </h3>
                    <p className="text-gray-600 mb-2 flex items-start gap-3">
                      <span className="text-lg mt-1">📍</span>
                      <span>{office.address}</span>
                    </p>
                    <p className="text-gray-600 flex items-center gap-3">
                      <span className="text-lg">📞</span>
                      <a
                        href={`tel:${office.phone}`}
                        className="hover:text-royal-gold transition-colors"
                      >
                        {office.phone}
                      </a>
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Connect */}
              <div className="mt-8 bg-royal-gold/10 rounded-2xl p-8 border-2 border-royal-gold/30">
                <h3 className="text-xl font-bold text-royal-black mb-4">
                  Quick Connect
                </h3>
                <p className="text-gray-600 mb-6">
                  Prefer to schedule a call? Our team is ready to discuss your
                  investment goals.
                </p>
                <button className="w-full bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                  Send us a Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-royal-container">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "How long does it take to set up an account?",
                answer:
                  "Most accounts can be set up within 1-2 business days. We handle all paperwork and onboarding efficiently.",
              },
              {
                question: "What is your minimum investment?",
                answer:
                  "Our minimum investment starts at $100,000 for most services. We also offer customized solutions for larger investments.",
              },
              {
                question: "How often will I receive portfolio updates?",
                answer:
                  "You'll receive quarterly performance reports, with ongoing access to your portfolio through our online platform.",
              },
              {
                question: "What are your fee structures?",
                answer:
                  "Our fees are transparent and typically range from 0.75% to 1.5% annually, depending on your service level.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-royal-gold transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-royal-black mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
