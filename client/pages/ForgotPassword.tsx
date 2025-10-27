import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authAPI } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email.toLowerCase().trim());
      setIsSubmitted(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      // Even on error, show success message for security (prevent email enumeration)
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-royal-gold via-yellow-500 to-royal-copper bg-clip-text text-transparent">
              ROYAL DANSITY
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-royal-copper rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-royal-black mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-royal-black mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-royal-gold to-royal-copper text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/admin/login"
                  className="text-royal-gold hover:text-yellow-600 font-semibold transition-colors inline-flex items-center gap-2"
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* Success Message */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-royal-black mb-3">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists with <strong>{email}</strong>, you'll
                receive a password reset link shortly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Check your spam folder if you don't
                  see the email within a few minutes.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/admin/login"
                  className="block w-full bg-gradient-to-r from-royal-gold to-royal-copper text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-royal-black font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? Contact our{" "}
          <Link to="/contact" className="text-royal-gold hover:underline">
            support team
          </Link>
        </p>
      </div>
    </div>
  );
}

