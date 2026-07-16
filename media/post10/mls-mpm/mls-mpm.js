import { numParticlesMax, renderUniformsViews } from '../common.js?v=20260712reflective3';

export const mlsmpmParticleStructSize = 80

export class MLSMPMSimulator {
    constructor (particleBuffer, renderDiameter, device, boxWidth, boxHeight, boxDepth)
    {
        this.max_x_grids = Math.ceil(boxWidth * 1.1);
        this.max_y_grids = Math.ceil(boxHeight * 1.1);
        this.max_z_grids = Math.ceil(boxDepth * 1.1);
        this.cellStructSize = 16;
        this.numParticles = 0
        this.gridCount = 0
        this.renderDiameter = renderDiameter
        this.device = device
        this.particleBuffer = particleBuffer
        this.boundaryCouplingWidth = 3.0
        this.pistonPower = 1.0
        this.initialFluidDepth = Math.min(boxDepth, 100)
        this.realBoxSizeValues = new Float32Array(3)
        this.initBoxSizeValues = new Float32Array(3)
        this.pistonStateValues = new Float32Array(4)
    }

    async initialize() {
        const clearGrid = await fetch('mls-mpm/clearGrid.wgsl?v=20260310k').then(r => r.text());
        const p2g_1 = await fetch('mls-mpm/p2g_1.wgsl?v=20260310k').then(r => r.text());
        const p2g_2 = await fetch('mls-mpm/p2g_2.wgsl?v=20260310k').then(r => r.text());
        const updateGrid = await fetch('mls-mpm/updateGrid.wgsl?v=20260310k').then(r => r.text());
        const g2p = await fetch('mls-mpm/g2p.wgsl?v=20260712reflective3').then(r => r.text());

        const clearGridModule = this.device.createShaderModule({ code: clearGrid });
        const p2g1Module = this.device.createShaderModule({ code: p2g_1 });
        const p2g2Module = this.device.createShaderModule({ code: p2g_2 });
        const updateGridModule = this.device.createShaderModule({ code: updateGrid });
        const g2pModule = this.device.createShaderModule({ code: g2p });

        const constants = {
            stiffness: 3., 
            restDensity: 4., 
            dynamic_viscosity: 0.1, 
            dt: 0.20, 
            fixed_point_multiplier: 1e7, 
        }

        this.clearGridPipeline = this.device.createComputePipeline({
            label: "clear grid pipeline", 
            layout: 'auto', 
            compute: { module: clearGridModule }
        })
        this.p2g1Pipeline = this.device.createComputePipeline({
            label: "p2g 1 pipeline", 
            layout: 'auto', 
            compute: {
                module: p2g1Module, 
                constants: { 'fixed_point_multiplier': constants.fixed_point_multiplier }
            }
        })
        this.p2g2Pipeline = this.device.createComputePipeline({
            label: "p2g 2 pipeline", 
            layout: 'auto', 
            compute: {
                module: p2g2Module, 
                constants: {
                    'fixed_point_multiplier': constants.fixed_point_multiplier, 
                    'stiffness': constants.stiffness, 
                    'rest_density': constants.restDensity, 
                    'dynamic_viscosity': constants.dynamic_viscosity, 
                    'dt': constants.dt
                }
            }
        })
        this.updateGridPipeline = this.device.createComputePipeline({
            label: "update grid pipeline", 
            layout: 'auto', 
            compute: {
                module: updateGridModule, 
                constants: {
                    'fixed_point_multiplier': constants.fixed_point_multiplier, 
                    'dt': constants.dt
                }
            }
        });
        this.g2pPipeline = this.device.createComputePipeline({
            label: "g2p pipeline", 
            layout: 'auto', 
            compute: {
                module: g2pModule, 
                constants: {
                    'fixed_point_multiplier': constants.fixed_point_multiplier, 
                    'dt': constants.dt
                }
            }
        });

        const maxGridCount = this.max_x_grids * this.max_y_grids * this.max_z_grids;
        this.interactionValues = new Float32Array(8);
        this.interactionActive = false;

        const cellBuffer = this.device.createBuffer({ 
            label: 'cells buffer', 
            size: this.cellStructSize * maxGridCount,  
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        this.realBoxSizeBuffer = this.device.createBuffer({
            label: 'real box size buffer', 
            size: this.realBoxSizeValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.initBoxSizeBuffer = this.device.createBuffer({
            label: 'init box size buffer', 
            size: this.initBoxSizeValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.pistonStateBuffer = this.device.createBuffer({
            label: 'piston state buffer',
            size: this.pistonStateValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.interactionStateBuffer = this.device.createBuffer({
            label: 'interaction state buffer',
            size: this.interactionValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.initBoxSizeBuffer, 0, this.initBoxSizeValues);
        this.device.queue.writeBuffer(this.realBoxSizeBuffer, 0, this.realBoxSizeValues);
        this.device.queue.writeBuffer(this.pistonStateBuffer, 0, this.pistonStateValues);
        this.device.queue.writeBuffer(this.interactionStateBuffer, 0, this.interactionValues);

        this.clearGridBindGroup = this.device.createBindGroup({
            layout: this.clearGridPipeline.getBindGroupLayout(0), 
            entries: [{ binding: 0, resource: { buffer: cellBuffer }}]
        })
        this.p2g1BindGroup = this.device.createBindGroup({
            layout: this.p2g1Pipeline.getBindGroupLayout(0), 
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer }}, 
                { binding: 1, resource: { buffer: cellBuffer }}, 
                { binding: 2, resource: { buffer: this.initBoxSizeBuffer }}
            ]
        })
        this.p2g2BindGroup = this.device.createBindGroup({
            layout: this.p2g2Pipeline.getBindGroupLayout(0), 
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer }}, 
                { binding: 1, resource: { buffer: cellBuffer }}, 
                { binding: 2, resource: { buffer: this.initBoxSizeBuffer }}
            ]
        })
        this.updateGridBindGroup = this.device.createBindGroup({
            layout: this.updateGridPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: cellBuffer }},
                { binding: 1, resource: { buffer: this.realBoxSizeBuffer }},
                { binding: 2, resource: { buffer: this.initBoxSizeBuffer }},
                { binding: 3, resource: { buffer: this.pistonStateBuffer }}
            ]
        })
        this.g2pBindGroup = this.device.createBindGroup({
            layout: this.g2pPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer }},
                { binding: 1, resource: { buffer: cellBuffer }},
                { binding: 2, resource: { buffer: this.realBoxSizeBuffer }},
                { binding: 3, resource: { buffer: this.initBoxSizeBuffer }},
                { binding: 4, resource: { buffer: this.pistonStateBuffer }},
                { binding: 5, resource: { buffer: this.interactionStateBuffer }}
            ]
        })
    }

    initDambreak(initBoxSize, numParticles) {
        let particlesBuf = new ArrayBuffer(mlsmpmParticleStructSize * numParticlesMax);
        const spacing = 0.95;
        const margin = 3.0;
        const fluidStartZ = Math.max(margin, initBoxSize[2] - this.initialFluidDepth + margin);
        const fluidEndX = initBoxSize[0] - margin;
        const fluidEndY = initBoxSize[1] - margin;
        const fluidEndZ = initBoxSize[2] - margin;

        this.numParticles = 0;
        
        
        let jCount = 0;
        let iCount = 0;

        for (let j = margin; j < fluidEndY && this.numParticles < numParticles; j += spacing) {
            jCount++;
            iCount = 0;
            for (let i = margin; i < fluidEndX && this.numParticles < numParticles; i += spacing) {
                iCount++;
                let kCount = 0;
                for (let k = fluidStartZ; k < fluidEndZ && this.numParticles < numParticles; k += spacing) {
                    kCount++;
                    const offset = mlsmpmParticleStructSize * this.numParticles;
                    const particleViews = {
                        position: new Float32Array(particlesBuf, offset + 0, 3),
                        v: new Float32Array(particlesBuf, offset + 16, 3),
                        C: new Float32Array(particlesBuf, offset + 32, 12),
                    };
                    const jitter = (Math.random() - 0.5) * 0.04;
                    particleViews.position.set([i + jitter, j + jitter, k + jitter]);
                    this.numParticles++;
                    
                }
                if (this.numParticles >= numParticles) break;
            }
            if (this.numParticles >= numParticles) break;
        }
        
        
        this.device.queue.writeBuffer(this.particleBuffer, 0, particlesBuf, 0, this.numParticles * mlsmpmParticleStructSize);
    }

    reset(numParticles, gridBoxSize, seedBoxSize = gridBoxSize) {
        renderUniformsViews.sphere_size.set([this.renderDiameter, this.renderDiameter])
        this.initDambreak(seedBoxSize, numParticles);
        const maxGridCount = this.max_x_grids * this.max_y_grids * this.max_z_grids;
        this.gridCount = Math.ceil(gridBoxSize[0]) * Math.ceil(gridBoxSize[1]) * Math.ceil(gridBoxSize[2]);
        if (this.gridCount > maxGridCount) {
            throw new Error("gridCount should be equal to or less than maxGridCount")
        }
        this.initBoxSizeValues.set(gridBoxSize);
        this.realBoxSizeValues.set(seedBoxSize);
        this.device.queue.writeBuffer(this.initBoxSizeBuffer, 0, this.initBoxSizeValues);
        this.device.queue.writeBuffer(this.realBoxSizeBuffer, 0, this.realBoxSizeValues);
        this.writePistonState(0);
        this.clearInteraction();
    }

    execute(commandEncoder, substeps = 2) {
        const computePass = commandEncoder.beginComputePass();
        const steps = Math.max(1, Math.floor(substeps));
        for (let i = 0; i < steps; i++) {
            computePass.setBindGroup(0, this.clearGridBindGroup);
            computePass.setPipeline(this.clearGridPipeline);
            computePass.dispatchWorkgroups(Math.ceil(this.gridCount / 64))
            computePass.setBindGroup(0, this.p2g1BindGroup)
            computePass.setPipeline(this.p2g1Pipeline)
            computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 64))
            computePass.setBindGroup(0, this.p2g2BindGroup)
            computePass.setPipeline(this.p2g2Pipeline)
            computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 64)) 
            computePass.setBindGroup(0, this.updateGridBindGroup)
            computePass.setPipeline(this.updateGridPipeline)
            computePass.dispatchWorkgroups(Math.ceil(this.gridCount / 64)) 
            computePass.setBindGroup(0, this.g2pBindGroup)
            computePass.setPipeline(this.g2pPipeline)
            computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 64)) 
        }
        computePass.end()
    }

    writePistonState(pistonVelocity) {
        this.pistonStateValues[0] = pistonVelocity * this.pistonPower;
        this.pistonStateValues[1] = this.boundaryCouplingWidth;
        this.device.queue.writeBuffer(this.pistonStateBuffer, 0, this.pistonStateValues);
    }

    setInteraction(point, impulse, radius, strength) {
        this.interactionValues.set(point, 0);
        this.interactionValues[3] = radius;
        this.interactionValues.set(impulse, 4);
        this.interactionValues[7] = strength;
        this.device.queue.writeBuffer(this.interactionStateBuffer, 0, this.interactionValues);
        this.interactionActive = true;
    }

    clearInteraction() {
        if (!this.interactionActive) return;
        this.interactionValues.fill(0);
        this.device.queue.writeBuffer(this.interactionStateBuffer, 0, this.interactionValues);
        this.interactionActive = false;
    }

    setInitialFluidDepth(value) {
        this.initialFluidDepth = value;
    }

    setBoundaryCouplingWidth(value) {
        this.boundaryCouplingWidth = value;
    }

    setPistonPower(value) {
        this.pistonPower = value;
    }

    changeBoxSize(realBoxSize, pistonVelocity = 0) {
        this.realBoxSizeValues.set(realBoxSize)
        this.device.queue.writeBuffer(this.realBoxSizeBuffer, 0, this.realBoxSizeValues)
        this.writePistonState(pistonVelocity)
    }

    addSphere(centerX, centerY, centerZ, radius, numSphereParticles) {
        if (this.numParticles + numSphereParticles > numParticlesMax) {
            return;
        }

        let sphereParticlesBuf = new ArrayBuffer(mlsmpmParticleStructSize * numSphereParticles);
        const spacing = 0.35;
        let sphereParticleCount = 0;

        for (let x = -radius; x <= radius && sphereParticleCount < numSphereParticles; x += spacing) {
            for (let y = -radius; y <= radius && sphereParticleCount < numSphereParticles; y += spacing) {
                for (let z = -radius; z <= radius && sphereParticleCount < numSphereParticles; z += spacing) {
                    const distance = Math.sqrt(x*x + y*y + z*z);
                    if (distance <= radius) {
                        const offset = mlsmpmParticleStructSize * sphereParticleCount;
                        const particleViews = {
                            position: new Float32Array(sphereParticlesBuf, offset + 0, 3),
                            v: new Float32Array(sphereParticlesBuf, offset + 16, 3),
                            C: new Float32Array(sphereParticlesBuf, offset + 32, 12),
                        };
                        
                        particleViews.position.set([
                            centerX + x, 
                            centerY + y, 
                            centerZ + z
                        ]);
                        
                        particleViews.v.set([0, 0, 0]);
                        
                        sphereParticleCount++;
                    }
                }
            }
        }

        const offset = this.numParticles * mlsmpmParticleStructSize;
        const sphereData = new Uint8Array(sphereParticlesBuf, 0, sphereParticleCount * mlsmpmParticleStructSize);
        this.device.queue.writeBuffer(this.particleBuffer, offset, sphereData);
        
        this.numParticles += sphereParticleCount;
    }

}
