/**
 * Performance Test Helper - Single Responsibility: Performance Measurement
 * Utilities for measuring and validating performance
 */

export class PerformanceTestHelper {
  /**
   * Measure execution time of an async operation
   */
  static async measure<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; durationMs: number }> {
    const startTime = Date.now();
    const result = await operation();
    const durationMs = Date.now() - startTime;
    return { result, durationMs };
  }

  /**
   * Assert performance threshold
   */
  static assertWithinThreshold(
    actualMs: number,
    thresholdMs: number,
    operationName: string,
  ): void {
    if (actualMs > thresholdMs) {
      throw new Error(
        `${operationName} took ${actualMs}ms, exceeding threshold of ${thresholdMs}ms`,
      );
    }
  }

  /**
   * Measure and assert in one call
   */
  static async measureAndAssert<T>(
    operation: () => Promise<T>,
    thresholdMs: number,
    operationName: string,
  ): Promise<T> {
    const { result, durationMs } = await this.measure(operation);
    this.assertWithinThreshold(durationMs, thresholdMs, operationName);
    return result;
  }

  /**
   * Log performance metrics
   */
  static logMetric(name: string, valueMs: number): void {
    console.log(`[PERF] ${name}: ${valueMs}ms`);
  }
}
