import { PasswordValidation } from "@/lib/passwordUtils";

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation | null;
  showErrors?: boolean;
}

export default function PasswordStrengthIndicator({
  validation,
  showErrors = true,
}: PasswordStrengthIndicatorProps) {
  if (!validation) return null;

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthText = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  const strengthTextColor = {
    weak: "text-red-600",
    medium: "text-yellow-600",
    strong: "text-green-600",
  };

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">
            Password Strength
          </span>
          <span
            className={`text-xs font-bold ${
              strengthTextColor[validation.strength]
            }`}
          >
            {strengthText[validation.strength]}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              strengthColors[validation.strength]
            }`}
            style={{ width: `${validation.score}%` }}
          ></div>
        </div>
      </div>

      {/* Error Messages */}
      {showErrors && validation.errors.length > 0 && (
        <div className="space-y-1 bg-red-50 rounded-lg p-3 border border-red-200">
          {validation.errors.map((error, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-red-600 font-bold text-xs mt-0.5">✗</span>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-xs">✓</span>
            <p className="text-xs text-green-700 font-semibold">
              Password is strong and meets all requirements
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
