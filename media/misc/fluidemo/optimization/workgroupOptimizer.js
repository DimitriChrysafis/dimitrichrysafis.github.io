export class WorkgroupOptimizer {
    constructor(device) {
        this.device = device;
        this.optimalSizes = new Map();
        this.testResults = new Map();
        this.benchmarkDuration = 100;
    }

    async findOptimalWorkgroupSize(pipelineFactory, dispatchSize, testSizes = [32, 64, 128, 256]) {
        const cacheKey = `${dispatchSize}-${testSizes.join(',')}`;
        
        if (this.optimalSizes.has(cacheKey)) {
            return this.optimalSizes.get(cacheKey);
        }

        let bestSize = 64;
        let bestTime = Infinity;

        for (const size of testSizes) {
            try {
                const pipeline = await pipelineFactory(size);
                const time = await this.benchmarkWorkgroupSize(pipeline, dispatchSize, size);
                
                this.testResults.set(size, time);
                
                if (time < bestTime) {
                    bestTime = time;
                    bestSize = size;
                }
            } catch (error) {
                continue;
            }
        }

        this.optimalSizes.set(cacheKey, bestSize);
        return bestSize;
    }

    async benchmarkWorkgroupSize(pipeline, dispatchSize, workgroupSize) {
        const numWorkgroups = Math.ceil(dispatchSize / workgroupSize);
        const iterations = 10;
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const commandEncoder = this.device.createCommandEncoder();
            const computePass = commandEncoder.beginComputePass();
            computePass.setPipeline(pipeline);
            computePass.dispatchWorkgroups(numWorkgroups);
            computePass.end();
            
            const commands = commandEncoder.finish();
            this.device.queue.submit([commands]);
            
            await this.device.queue.onSubmittedWorkDone();
        }
        
        const endTime = performance.now();
        return (endTime - startTime) / iterations;
    }

    getRecommendedSize(dispatchSize) {
        if (dispatchSize <= 1000) return 32;
        if (dispatchSize <= 10000) return 64;
        if (dispatchSize <= 100000) return 128;
        return 256;
    }

    logResults() {
        for (const [size, time] of this.testResults) {
            console.log(`Workgroup size ${size}: ${time.toFixed(2)}ms average`);
        }
    }
}

export function createOptimizedPipeline(device, shaderModule, constants, optimalWorkgroupSize = 64) {
    return device.createComputePipeline({
        layout: 'auto',
        compute: {
            module: shaderModule,
            constants: {
                ...constants,
                workgroup_size: optimalWorkgroupSize
            }
        }
    });
}
