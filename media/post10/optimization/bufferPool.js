export class BufferPool {
    constructor() {
        this.arrayBufferPool = new Map();
        this.float32ArrayPool = new Map();
        this.maxPoolSize = 10;
    }

    getArrayBuffer(size) {
        const pool = this.arrayBufferPool.get(size) || [];
        if (pool.length > 0) {
            return pool.pop();
        }
        return new ArrayBuffer(size);
    }

    returnArrayBuffer(buffer) {
        const size = buffer.byteLength;
        const pool = this.arrayBufferPool.get(size) || [];
        if (pool.length < this.maxPoolSize) {
            pool.push(buffer);
            this.arrayBufferPool.set(size, pool);
        }
    }

    getFloat32Array(buffer, offset, length) {
        const key = `${offset}-${length}`;
        const pool = this.float32ArrayPool.get(key) || [];
        if (pool.length > 0) {
            const array = pool.pop();
            array.buffer = buffer;
            return array;
        }
        return new Float32Array(buffer, offset, length);
    }

    returnFloat32Array(array, offset, length) {
        const key = `${offset}-${length}`;
        const pool = this.float32ArrayPool.get(key) || [];
        if (pool.length < this.maxPoolSize) {
            pool.push(array);
            this.float32ArrayPool.set(key, pool);
        }
    }

    clear() {
        this.arrayBufferPool.clear();
        this.float32ArrayPool.clear();
    }
}
