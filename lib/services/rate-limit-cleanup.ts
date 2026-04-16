/**
 * Rate Limit Cleanup Service
 *
 * Periodically cleans up old rate limit records to prevent database bloat
 * and maintain optimal performance for rate limiting queries.
 */

import { cleanupOldRecords } from "@/lib/security/rate-limiting.ts";

export class RateLimitCleanupService {
  private static instance: RateLimitCleanupService | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): RateLimitCleanupService {
    if (!RateLimitCleanupService.instance) {
      RateLimitCleanupService.instance = new RateLimitCleanupService();
    }
    return RateLimitCleanupService.instance;
  }

  /**
   * Start the cleanup service
   * Runs cleanup every hour by default
   */
  start(intervalMs: number = 60 * 60 * 1000): void {
    if (this.isRunning) {
      console.log("Rate limit cleanup service is already running");
      return;
    }

    // Don't run cleanup in client-side environment
    if (typeof window !== "undefined") {
      return;
    }

    console.log("Starting rate limit cleanup service...");
    this.isRunning = true;

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);

    console.log(
      `Rate limit cleanup service started (interval: ${intervalMs}ms)`
    );
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("Rate limit cleanup service is not running");
      return;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isRunning = false;
    console.log("Rate limit cleanup service stopped");
  }

  /**
   * Perform the actual cleanup
   */
  private async performCleanup(): Promise<void> {
    try {
      await cleanupOldRecords();
    } catch (error) {
      console.error("Rate limit cleanup failed:", error);
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    hasInterval: boolean;
  } {
    return {
      isRunning: this.isRunning,
      hasInterval: this.cleanupInterval !== null,
    };
  }
}

// Auto-start the cleanup service in Node.js environments
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  const cleanupService = RateLimitCleanupService.getInstance();

  // Start cleanup service on import (production only)
  // In development, we keep records longer for debugging
  cleanupService.start(60 * 60 * 1000); // 1 hour interval

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("Shutting down rate limit cleanup service...");
    cleanupService.stop();
  });

  process.on("SIGINT", () => {
    console.log("Shutting down rate limit cleanup service...");
    cleanupService.stop();
  });
}
