import bcryptjs from "bcryptjs";

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
  score: number;
}

/**
 * Validate password against rules and return detailed feedback
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"],
      strength: "weak",
      score: 0,
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  } else {
    score += 25;
  }

  // Check uppercase
  if (!PASSWORD_RULES.hasUppercase.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter");
  } else {
    score += 25;
  }

  // Check lowercase
  if (!PASSWORD_RULES.hasLowercase.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter");
  } else {
    score += 25;
  }

  // Check number
  if (!PASSWORD_RULES.hasNumber.test(password)) {
    errors.push("Password must contain at least 1 number");
  } else {
    score += 25;
  }

  // Check special character
  if (!PASSWORD_RULES.hasSpecialChar.test(password)) {
    errors.push("Password must contain at least 1 special character (!@#$%^&* etc.)");
  } else {
    score += 25;
  }

  // Determine strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 75) strength = "strong";
  else if (score >= 50) strength = "medium";

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, score),
  };
}

/**
 * Check if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Generate a random secure password
 */
export function generateSecurePassword(): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + symbols;

  // Ensure at least one from each category
  let password =
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcryptjs.compare(password, hash);
}
