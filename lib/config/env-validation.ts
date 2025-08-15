/**
 * Environment Variable Validation for Security
 * 
 * This module validates critical environment variables at application startup
 * to prevent security misconfigurations in production.
 */

interface EnvironmentConfig {
  NODE_ENV: string
  DATABASE_URL?: string
  RESEND_API_KEY?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  FACEBOOK_CLIENT_ID?: string
  FACEBOOK_CLIENT_SECRET?: string
}

export class EnvironmentValidator {
  /**
   * Validate environment configuration at startup
   */
  static validateEnvironment(): EnvironmentConfig {
    const env = process.env
    const NODE_ENV = env.NODE_ENV || 'development'

    // Production security requirements
    if (NODE_ENV === 'production') {
      this.validateProductionEnvironment(env)
    }

    // Development warnings
    if (NODE_ENV === 'development') {
      this.validateDevelopmentEnvironment(env)
    }

    return {
      NODE_ENV,
      DATABASE_URL: env.DATABASE_URL,
      RESEND_API_KEY: env.RESEND_API_KEY,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
      FACEBOOK_CLIENT_ID: env.FACEBOOK_CLIENT_ID,
      FACEBOOK_CLIENT_SECRET: env.FACEBOOK_CLIENT_SECRET,
    }
  }

  /**
   * Strict validation for production environments
   */
  private static validateProductionEnvironment(env: NodeJS.ProcessEnv): void {
    const requiredVars = ['DATABASE_URL']

    // Check required environment variables
    for (const varName of requiredVars) {
      if (!env[varName]) {
        throw new Error(
          `🚨 PRODUCTION ERROR: Missing required environment variable: ${varName}\n` +
          `This is required for security in production environments.`
        )
      }
    }

    // Validate OAuth configuration if enabled
    if (env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('🚨 PRODUCTION ERROR: GOOGLE_CLIENT_SECRET is required when GOOGLE_CLIENT_ID is set')
    }

    if (env.FACEBOOK_CLIENT_ID && !env.FACEBOOK_CLIENT_SECRET) {
      throw new Error('🚨 PRODUCTION ERROR: FACEBOOK_CLIENT_SECRET is required when FACEBOOK_CLIENT_ID is set')
    }

    console.log('✅ Production environment validation passed')
  }

  /**
   * Warnings and guidance for development environments
   */
  private static validateDevelopmentEnvironment(env: NodeJS.ProcessEnv): void {
    console.log('🔧 Development environment detected')

    // Check for database configuration
    if (!env.DATABASE_URL) {
      console.warn('⚠️  WARNING: DATABASE_URL not configured')
      console.warn('⚠️  Authentication features will be unavailable')
      console.warn('⚠️  Configure your database to enable full functionality')
    }

    // Check for email configuration
    if (!env.RESEND_API_KEY) {
      console.warn('⚠️  INFO: RESEND_API_KEY not configured - email features disabled')
    }

    // OAuth configuration warnings
    if (env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_SECRET) {
      console.warn('⚠️  WARNING: Google OAuth partially configured - missing CLIENT_SECRET')
    }

    if (env.FACEBOOK_CLIENT_ID && !env.FACEBOOK_CLIENT_SECRET) {
      console.warn('⚠️  WARNING: Facebook OAuth partially configured - missing CLIENT_SECRET')
    }


    console.log('✅ Development environment validation completed')
  }

  /**
   * Get secure configuration for runtime use
   */
  static getSecureConfig(): {
    isProduction: boolean
    isDevelopment: boolean
    authEnabled: boolean
    databaseEnabled: boolean
    emailEnabled: boolean
  } {
    const env = this.validateEnvironment()
    
    return {
      isProduction: env.NODE_ENV === 'production',
      isDevelopment: env.NODE_ENV === 'development',
      authEnabled: !!env.DATABASE_URL,
      databaseEnabled: !!env.DATABASE_URL,
      emailEnabled: !!env.RESEND_API_KEY,
    }
  }

  /**
   * Log security status at startup
   */
  static logSecurityStatus(): void {
    const config = this.getSecureConfig()
    
    console.log('\n🔒 Security Configuration Status:')
    console.log(`   Environment: ${process.env.NODE_ENV}`)
    console.log(`   Authentication: ${config.authEnabled ? '✅ Enabled' : '❌ Disabled'}`)
    console.log(`   Database: ${config.databaseEnabled ? '✅ Connected' : '❌ Not configured'}`)
    console.log(`   Email: ${config.emailEnabled ? '✅ Enabled' : '❌ Disabled'}`)
    
    if (!config.authEnabled && config.isProduction) {
      console.error('🚨 CRITICAL: Authentication is disabled in production!')
      throw new Error('DATABASE_URL must be configured in production')
    }
    
    if (config.isDevelopment && !config.authEnabled) {
      console.warn('⚠️  Authentication unavailable - configure DATABASE_URL to enable')
    }
    
    console.log('')
  }
}

// Auto-validate on import in Node.js environments
if (typeof window === 'undefined') {
  try {
    EnvironmentValidator.logSecurityStatus()
  } catch (error) {
    console.error('Failed to validate environment:', error)
    process.exit(1)
  }
}