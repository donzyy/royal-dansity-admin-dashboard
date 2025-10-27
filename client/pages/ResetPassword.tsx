import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authAPI } from "@/lib/api";
import PasswordStrengthIndicator from "@/shared/components/PasswordStrengthIndicator";
import {
  validatePassword,
  passwordsMatch,
  type PasswordValidation,
} from "@/lib/passwordUtils";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordMismatch(!passwordsMatch(password, confirmPassword));
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation?.isValid) {
      toast.error("Password does not meet the requirements");
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(token!, password);
      toast.success("Password reset successful! You can now log in.");
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      const message = error.message || "Failed to reset password. The link may be invalid or expired.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-royal-copper rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-royal-black mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-royal-black mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-royal-black mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-colors ${
                    passwordMismatch
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-royal-gold"
                  }`}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-red-600 mt-2">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <PasswordStrengthIndicator
                validation={passwordValidation}
                showErrors={true}
              />
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !passwordValidation?.isValid ||
                passwordMismatch ||
                !confirmPassword
              }
              className="w-full bg-gradient-to-r from-royal-gold to-royal-copper text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Link expired or not working?{" "}
          <Link to="/forgot-password" className="text-royal-gold hover:underline">
            Request a new one
          </Link>
        </p>
      </div>
    </div>
  );
}

