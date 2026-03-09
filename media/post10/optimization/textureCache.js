export class TextureViewCache {
    constructor() {
        this.cache = new WeakMap();
        this.hits = 0;
        this.misses = 0;
    }

    getTextureView(texture, descriptor = {}) {
        let textureCache = this.cache.get(texture);
        if (!textureCache) {
            textureCache = new Map();
            this.cache.set(texture, textureCache);
        }

        const key = JSON.stringify(descriptor);
        let view = textureCache.get(key);
        
        if (!view) {
            view = texture.createView(descriptor);
            textureCache.set(key, view);
            this.misses++;
        } else {
            this.hits++;
        }

        return view;
    }

    getCacheStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(1) : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }

    clear() {
        this.cache = new WeakMap();
        this.hits = 0;
        this.misses = 0;
    }
}
