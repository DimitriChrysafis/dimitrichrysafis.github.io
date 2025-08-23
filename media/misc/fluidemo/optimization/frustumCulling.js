export class FrustumCuller {
    constructor(device) {
        this.device = device;
        this.frustumPlanes = new Float32Array(24); // 6 planes * 4 components (a,b,c,d)
        this.visibilityBuffer = null;
        this.visibilityPipeline = null;
        this.initialized = false;
    }

    async initialize(maxParticles) {
        const cullShaderCode = `
struct FrustumPlane {
    normal: vec3f,
    distance: f32,
}

struct RenderUniforms {
    texelSize: vec2f,
    sphereSize: f32,
    invProjectionMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    viewMatrix: mat4x4f,
    invViewMatrix: mat4x4f,
    boxSize: vec3f,
}

struct PosVel {
    position: vec3f,
    v: vec3f,
}

@group(0) @binding(0) var<storage, read> particles: array<PosVel>;
@group(0) @binding(1) var<storage, read_write> visibility: array<u32>;
@group(0) @binding(2) var<uniform> uniforms: RenderUniforms;
@group(0) @binding(3) var<uniform> frustumPlanes: array<FrustumPlane, 6>;

@compute @workgroup_size(256)
fn cullParticles(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= arrayLength(&particles)) {
        return;
    }
    
    let particlePos = particles[id.x].position;
    let sphereRadius = uniforms.sphereSize;
    
    var isVisible = true;
    for (var i = 0u; i < 6u; i++) {
        let plane = frustumPlanes[i];
        let distance = dot(plane.normal, particlePos) + plane.distance;
        if (distance < -sphereRadius) {
            isVisible = false;
            break;
        }
    }
    
    visibility[id.x] = select(0u, 1u, isVisible);
}`;

        const cullModule = this.device.createShaderModule({ code: cullShaderCode });
        
        this.visibilityPipeline = this.device.createComputePipeline({
            label: 'frustum culling pipeline',
            layout: 'auto',
            compute: { module: cullModule }
        });

        this.visibilityBuffer = this.device.createBuffer({
            label: 'visibility buffer',
            size: maxParticles * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.frustumPlanesBuffer = this.device.createBuffer({
            label: 'frustum planes buffer',
            size: 6 * 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.initialized = true;
    }

    extractFrustumPlanes(viewProjectionMatrix) {
        const m = viewProjectionMatrix;
        
        this.frustumPlanes[0] = m[3] + m[0];
        this.frustumPlanes[1] = m[7] + m[4];
        this.frustumPlanes[2] = m[11] + m[8];
        this.frustumPlanes[3] = m[15] + m[12];
        
        this.frustumPlanes[4] = m[3] - m[0];
        this.frustumPlanes[5] = m[7] - m[4];
        this.frustumPlanes[6] = m[11] - m[8];
        this.frustumPlanes[7] = m[15] - m[12];
        
        this.frustumPlanes[8] = m[3] + m[1];
        this.frustumPlanes[9] = m[7] + m[5];
        this.frustumPlanes[10] = m[11] + m[9];
        this.frustumPlanes[11] = m[15] + m[13];
        
        this.frustumPlanes[12] = m[3] - m[1];
        this.frustumPlanes[13] = m[7] - m[5];
        this.frustumPlanes[14] = m[11] - m[9];
        this.frustumPlanes[15] = m[15] - m[13];
        
        this.frustumPlanes[16] = m[3] + m[2];
        this.frustumPlanes[17] = m[7] + m[6];
        this.frustumPlanes[18] = m[11] + m[10];
        this.frustumPlanes[19] = m[15] + m[14];
        
        this.frustumPlanes[20] = m[3] - m[2];
        this.frustumPlanes[21] = m[7] - m[6];
        this.frustumPlanes[22] = m[11] - m[10];
        this.frustumPlanes[23] = m[15] - m[14];

        for (let i = 0; i < 6; i++) {
            const offset = i * 4;
            const length = Math.sqrt(
                this.frustumPlanes[offset] * this.frustumPlanes[offset] +
                this.frustumPlanes[offset + 1] * this.frustumPlanes[offset + 1] +
                this.frustumPlanes[offset + 2] * this.frustumPlanes[offset + 2]
            );
            if (length > 0) {
                this.frustumPlanes[offset] /= length;
                this.frustumPlanes[offset + 1] /= length;
                this.frustumPlanes[offset + 2] /= length;
                this.frustumPlanes[offset + 3] /= length;
            }
        }
    }

    createBindGroup(particleBuffer, renderUniformBuffer) {
        if (!this.initialized) {
            throw new Error('FrustumCuller not initialized');
        }

        return this.device.createBindGroup({
            label: 'frustum culling bind group',
            layout: this.visibilityPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: particleBuffer }},
                { binding: 1, resource: { buffer: this.visibilityBuffer }},
                { binding: 2, resource: { buffer: renderUniformBuffer }},
                { binding: 3, resource: { buffer: this.frustumPlanesBuffer }},
            ]
        });
    }

    execute(commandEncoder, bindGroup, numParticles, viewProjectionMatrix) {
        if (!this.initialized) {
            return numParticles;
        }

        this.extractFrustumPlanes(viewProjectionMatrix);
        this.device.queue.writeBuffer(this.frustumPlanesBuffer, 0, this.frustumPlanes);

        const computePass = commandEncoder.beginComputePass();
        computePass.setBindGroup(0, bindGroup);
        computePass.setPipeline(this.visibilityPipeline);
        computePass.dispatchWorkgroups(Math.ceil(numParticles / 256));
        computePass.end();

        return numParticles;
    }
}
