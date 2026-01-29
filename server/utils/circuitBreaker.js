class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 120000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
    this.successCount = 0;
    this.totalRequests = 0;
  }

  async execute(fn, method = 'unknown') {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const waitTime = Math.round((this.nextAttempt - Date.now()) / 1000);
        throw new Error(`Circuit breaker is OPEN for ${method}. Retry in ${waitTime}s`);
      }

      console.log(`[CircuitBreaker] Entering HALF_OPEN state for ${method}`);
      this.state = 'HALF_OPEN';
    }

    this.totalRequests++;

    try {
      const result = await fn();
      this.onSuccess(method);
      return result;
    } catch (error) {
      this.onFailure(method);
      throw error;
    }
  }

  onSuccess(method) {
    this.failures = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      console.log(`[CircuitBreaker] Closing circuit for ${method} after successful recovery`);
      this.state = 'CLOSED';
    }
  }

  onFailure(method) {
    this.failures++;

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      const resetInSeconds = Math.round(this.resetTimeout / 1000);
      console.error(`[CircuitBreaker] Circuit OPEN for ${method} after ${this.failures} failures. Will retry in ${resetInSeconds}s`);
    } else {
      console.warn(`[CircuitBreaker] Failure ${this.failures}/${this.failureThreshold} for ${method}`);
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
    console.log('[CircuitBreaker] Circuit manually reset');
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.failureThreshold,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      successRate: this.totalRequests > 0 ? (this.successCount / this.totalRequests) : 0,
      nextAttemptIn: this.state === 'OPEN' ? Math.max(0, this.nextAttempt - Date.now()) : 0
    };
  }
}

const puppeteerCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 120000
});

const fetchCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

export { puppeteerCircuit, fetchCircuit };
