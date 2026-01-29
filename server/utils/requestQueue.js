class RequestQueue {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.activeRequests = 0;
    this.lastRequestTime = 0;
    this.minInterval = 3000;
    this.maxInterval = 8000;
    this.consecutiveFailures = 0;
    this.successRate = 1.0;
    this.recentResults = [];
    this.maxRecentResults = 20;
  }

  async enqueue(fn, priority = 5) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.queue.sort((a, b) => a.priority - b.priority);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    await this.waitForRateLimit();

    const item = this.queue.shift();
    if (!item) return;

    this.activeRequests++;
    this.lastRequestTime = Date.now();

    try {
      const result = await item.fn();
      this.recordSuccess();
      item.resolve(result);
    } catch (error) {
      this.recordFailure();
      item.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const interval = this.calculateInterval();

    if (timeSinceLastRequest < interval) {
      const waitTime = interval - timeSinceLastRequest;
      console.log(`[RequestQueue] Waiting ${waitTime}ms (success rate: ${(this.successRate * 100).toFixed(1)}%)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  calculateInterval() {
    const baseInterval = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);

    if (this.consecutiveFailures > 0) {
      const penalty = Math.min(this.consecutiveFailures * 2000, 20000);
      console.log(`[RequestQueue] Applying penalty: +${penalty}ms due to ${this.consecutiveFailures} failures`);
      return baseInterval + penalty;
    }

    if (this.successRate > 0.9) {
      const reduction = baseInterval * 0.2;
      return Math.max(this.minInterval, baseInterval - reduction);
    }

    if (this.successRate < 0.7) {
      const increase = baseInterval * 0.5;
      return Math.min(30000, baseInterval + increase);
    }

    return baseInterval;
  }

  recordSuccess() {
    this.consecutiveFailures = 0;
    this.recentResults.push(true);

    if (this.recentResults.length > this.maxRecentResults) {
      this.recentResults.shift();
    }

    this.updateSuccessRate();
  }

  recordFailure() {
    this.consecutiveFailures++;
    this.recentResults.push(false);

    if (this.recentResults.length > this.maxRecentResults) {
      this.recentResults.shift();
    }

    this.updateSuccessRate();
  }

  updateSuccessRate() {
    if (this.recentResults.length === 0) {
      this.successRate = 1.0;
      return;
    }

    const successes = this.recentResults.filter(r => r === true).length;
    this.successRate = successes / this.recentResults.length;
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      consecutiveFailures: this.consecutiveFailures,
      successRate: this.successRate,
      currentInterval: Math.round(this.calculateInterval()),
      minInterval: this.minInterval,
      maxInterval: this.maxInterval
    };
  }
}

const requestQueue = new RequestQueue(2);

export default requestQueue;
