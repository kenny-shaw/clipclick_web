/**
 * 并发限制器 - 基于信号量模式控制并发数量
 */
export class ConcurrencyLimiter {
    private semaphore: number;
    private queue: Array<() => void>;
    private maxConcurrency: number;
    private activeCount: number;

    constructor(maxConcurrency: number = 3) {
        this.maxConcurrency = maxConcurrency;
        this.semaphore = maxConcurrency;
        this.activeCount = 0;
        this.queue = [];
    }

    /**
     * 获取并发许可
     * @returns Promise<void> 当获得许可时resolve
     */
    async acquire(): Promise<void> {
        if (this.semaphore > 0) {
            this.semaphore--;
            this.activeCount++;
            return;
        }

        return new Promise<void>(resolve => {
            this.queue.push(resolve);
        });
    }

    /**
     * 释放并发许可
     */
    release(): void {
        this.activeCount = Math.max(0, this.activeCount - 1);

        if (this.queue.length > 0) {
            const next = this.queue.shift()!;
            this.activeCount++;
            next();
        } else {
            this.semaphore++;
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            maxConcurrency: this.maxConcurrency,
            activeCount: this.activeCount,
            availableSlots: this.semaphore,
            queueLength: this.queue.length,
            isFull: this.activeCount >= this.maxConcurrency
        };
    }

    /**
     * 动态调整最大并发数
     * @param newMaxConcurrency 新的最大并发数
     */
    setMaxConcurrency(newMaxConcurrency: number): void {
        const oldMax = this.maxConcurrency;
        this.maxConcurrency = newMaxConcurrency;

        if (newMaxConcurrency > oldMax) {
            // 增加并发数，释放更多许可
            const additionalSlots = newMaxConcurrency - oldMax;
            this.semaphore += additionalSlots;

            // 处理队列中的等待任务
            while (this.queue.length > 0 && this.semaphore > 0) {
                const next = this.queue.shift()!;
                this.semaphore--;
                this.activeCount++;
                next();
            }
        } else if (newMaxConcurrency < oldMax) {
            // 减少并发数，但不会影响当前正在执行的任务
            const reduction = oldMax - newMaxConcurrency;
            this.semaphore = Math.max(0, this.semaphore - reduction);
        }
    }

    /**
     * 清空队列（取消所有等待中的任务）
     */
    clearQueue(): void {
        this.queue.forEach(resolve => resolve());
        this.queue = [];
    }

    /**
     * 重置限制器
     */
    reset(): void {
        this.semaphore = this.maxConcurrency;
        this.activeCount = 0;
        this.clearQueue();
    }
}

/**
 * 并发限制器管理器 - 管理多个并发限制器
 */
export class ConcurrencyManager {
    private limiters: Map<string, ConcurrencyLimiter> = new Map();

    /**
     * 获取或创建限制器
     * @param key 限制器标识
     * @param maxConcurrency 最大并发数
     */
    getLimiter(key: string, maxConcurrency: number = 3): ConcurrencyLimiter {
        if (!this.limiters.has(key)) {
            this.limiters.set(key, new ConcurrencyLimiter(maxConcurrency));
        }
        return this.limiters.get(key)!;
    }

    /**
     * 设置限制器的最大并发数
     * @param key 限制器标识
     * @param maxConcurrency 最大并发数
     */
    setMaxConcurrency(key: string, maxConcurrency: number): void {
        const limiter = this.limiters.get(key);
        if (limiter) {
            limiter.setMaxConcurrency(maxConcurrency);
        }
    }

    /**
     * 获取所有限制器状态
     */
    getAllStatus() {
        const status: Record<string, ReturnType<ConcurrencyLimiter['getStatus']>> = {};
        this.limiters.forEach((limiter, key) => {
            status[key] = limiter.getStatus();
        });
        return status;
    }

    /**
     * 清空指定限制器的队列
     * @param key 限制器标识
     */
    clearQueue(key: string): void {
        const limiter = this.limiters.get(key);
        if (limiter) {
            limiter.clearQueue();
        }
    }

    /**
     * 重置指定限制器
     * @param key 限制器标识
     */
    reset(key: string): void {
        const limiter = this.limiters.get(key);
        if (limiter) {
            limiter.reset();
        }
    }

    /**
     * 重置所有限制器
     */
    resetAll(): void {
        this.limiters.forEach(limiter => limiter.reset());
    }

    /**
     * 删除限制器
     * @param key 限制器标识
     */
    removeLimiter(key: string): void {
        this.limiters.delete(key);
    }
}

// 全局并发管理器实例
export const globalConcurrencyManager = new ConcurrencyManager();
