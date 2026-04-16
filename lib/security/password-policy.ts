/**
 * Password Policy Enforcement
 * Implements strong password requirements and validation
 */

const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const DIGIT_RE = /\d/;
const SPECIAL_CHAR_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
const REPEATING_CHAR_RE = /(.)\1{2,}/;

export interface PasswordPolicyConfig {
  maxLength: number;
  minLength: number;
  prohibitCommonPasswords: boolean;
  prohibitPersonalInfo: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  requireUppercase: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  prohibitCommonPasswords: true,
  prohibitPersonalInfo: true,
};

export interface PasswordValidationResult {
  errors: string[];
  isValid: boolean;
  score: number; // 0-100
  strength: "weak" | "fair" | "good" | "strong";
}

// Common weak passwords (subset - in production, use a more comprehensive list)
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "password1",
  "123123",
  "12345678",
  "qwerty123",
  "1q2w3e4r",
  "admin123",
  "password12",
]);

export class PasswordPolicyValidator {
  private readonly config: PasswordPolicyConfig;

  constructor(config: PasswordPolicyConfig = DEFAULT_PASSWORD_POLICY) {
    this.config = config;
  }

  /**
   * Validate password against policy
   */
  validatePassword(
    password: string,
    userInfo?: { email?: string; name?: string }
  ): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length validation
    if (password.length < this.config.minLength) {
      errors.push(
        `Password must be at least ${this.config.minLength} characters long`
      );
    } else {
      score += Math.min(25, (password.length / this.config.minLength) * 25);
    }

    if (password.length > this.config.maxLength) {
      errors.push(
        `Password must not exceed ${this.config.maxLength} characters`
      );
    }

    // Character requirements
    if (this.config.requireUppercase && !UPPERCASE_RE.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    } else if (this.config.requireUppercase) {
      score += 15;
    }

    if (this.config.requireLowercase && !LOWERCASE_RE.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    } else if (this.config.requireLowercase) {
      score += 15;
    }

    if (this.config.requireNumbers && !DIGIT_RE.test(password)) {
      errors.push("Password must contain at least one number");
    } else if (this.config.requireNumbers) {
      score += 15;
    }

    if (this.config.requireSpecialChars && !SPECIAL_CHAR_RE.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    } else if (this.config.requireSpecialChars) {
      score += 15;
    }

    // Common password check
    if (
      this.config.prohibitCommonPasswords &&
      this.isCommonPassword(password)
    ) {
      errors.push(
        "Password is too common. Please choose a more unique password"
      );
      score -= 30;
    }

    // Personal information check
    if (
      this.config.prohibitPersonalInfo &&
      userInfo &&
      this.containsPersonalInfo(password, userInfo)
    ) {
      errors.push(
        "Password should not contain personal information like your name or email"
      );
      score -= 20;
    }

    // Complexity bonuses
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) {
      score += 10; // Bonus for character diversity
    }

    // Pattern detection penalties
    if (this.hasRepeatingPatterns(password)) {
      score -= 15;
    }

    if (this.hasSequentialChars(password)) {
      score -= 10;
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    // Determine strength
    let strength: "weak" | "fair" | "good" | "strong";
    if (score < 30) {
      strength = "weak";
    } else if (score < 60) {
      strength = "fair";
    } else if (score < 80) {
      strength = "good";
    } else {
      strength = "strong";
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score,
    };
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.has(password.toLowerCase());
  }

  /**
   * Check if password contains personal information
   */
  private containsPersonalInfo(
    password: string,
    userInfo: { email?: string; name?: string }
  ): boolean {
    const lowercasePassword = password.toLowerCase();

    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split("@")[0];
      if (emailParts.length >= 3 && lowercasePassword.includes(emailParts)) {
        return true;
      }
    }

    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(" ");
      for (const part of nameParts) {
        if (part.length >= 3 && lowercasePassword.includes(part)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for repeating patterns (e.g., "aaa", "123123")
   */
  private hasRepeatingPatterns(password: string): boolean {
    // Check for 3+ consecutive repeating characters
    if (REPEATING_CHAR_RE.test(password)) {
      return true;
    }

    // Check for repeating sequences
    for (let len = 2; len <= password.length / 2; len++) {
      for (let i = 0; i <= password.length - len * 2; i++) {
        const pattern = password.slice(i, i + len);
        const next = password.slice(i + len, i + 2 * len);
        if (pattern === next) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for sequential characters (e.g., "abc", "123")
   */
  private hasSequentialChars(password: string): boolean {
    const sequences = [
      "abcdefghijklmnopqrstuvwxyz",
      "qwertyuiopasdfghjklzxcvbnm", // QWERTY keyboard layout
      "0123456789",
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.slice(i, i + 3);
        if (password.toLowerCase().includes(subseq)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Generate password strength description for UI
   */
  getStrengthDescription(result: PasswordValidationResult): string {
    switch (result.strength) {
      case "weak":
        return "This password is weak and easily guessable";
      case "fair":
        return "This password is fair but could be stronger";
      case "good":
        return "This password is good and reasonably secure";
      case "strong":
        return "This password is strong and highly secure";
      default:
        return "Password strength unknown";
    }
  }

  /**
   * Get password requirements for UI display
   */
  getRequirements(): string[] {
    const requirements: string[] = [];

    requirements.push(`At least ${this.config.minLength} characters long`);

    if (this.config.requireUppercase) {
      requirements.push("At least one uppercase letter (A-Z)");
    }

    if (this.config.requireLowercase) {
      requirements.push("At least one lowercase letter (a-z)");
    }

    if (this.config.requireNumbers) {
      requirements.push("At least one number (0-9)");
    }

    if (this.config.requireSpecialChars) {
      requirements.push("At least one special character (!@#$%^&*)");
    }

    if (this.config.prohibitCommonPasswords) {
      requirements.push("Cannot be a common password");
    }

    if (this.config.prohibitPersonalInfo) {
      requirements.push("Should not contain personal information");
    }

    return requirements;
  }
}

// Export default instance
export const passwordValidator = new PasswordPolicyValidator();

// Utility function for easy validation
export function validatePassword(
  password: string,
  userInfo?: { email?: string; name?: string }
): PasswordValidationResult {
  return passwordValidator.validatePassword(password, userInfo);
}
