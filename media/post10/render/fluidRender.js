export class FluidRenderer {
    constructor(
        device, canvas, presentationFormat,
        radius, fov, particleBuffer,
        renderUniformBuffer
    ) {
        this.device = device
        this.canvas = canvas
        this.presentationFormat = presentationFormat
        this.particleBuffer = particleBuffer
        this.renderUniformBuffer = renderUniformBuffer
        this.boundaryVisible = true
        this.clearColor = { r: 0.012, g: 0.028, b: 0.055, a: 1.0 }
        this.cachedColorView = null
        this.lastTexture = null
    }

    async initialize() {
        const background = await fetch('render/background.wgsl?v=20260712reflective3').then(r => r.text());
        const sphere = await fetch('render/sphere.wgsl?v=20260712reflective3').then(r => r.text());
        const wall = await fetch('render/wall.wgsl?v=20260310k').then(r => r.text());
        const backgroundModule = this.device.createShaderModule({ code: background })
        const sphereModule = this.device.createShaderModule({ code: sphere })
        const wallModule = this.device.createShaderModule({ code: wall })

        this.backgroundPipeline = this.device.createRenderPipeline({
            label: 'reflective background pipeline',
            layout: 'auto',
            vertex: { module: backgroundModule },
            fragment: {
                module: backgroundModule,
                targets: [{ format: this.presentationFormat }]
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'always',
                format: 'depth32float'
            }
        })

        const particleBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'read-only-storage' },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' },
                },
            ],
        })
        const particlePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [particleBindGroupLayout],
        })

        this.particlePipeline = this.device.createRenderPipeline({
            label: 'sphere particle pipeline',
            layout: particlePipelineLayout, 
            vertex: { module: sphereModule },
            fragment: {
                module: sphereModule,
                targets: [{ format: this.presentationFormat }]
            }, 
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                depthWriteEnabled: true, 
                depthCompare: 'less',
                format: 'depth32float'
            }
        })

        this.wallPipeline = this.device.createRenderPipeline({
            label: 'wall pipeline',
            layout: 'auto',
            vertex: { module: wallModule },
            fragment: {
                module: wallModule,
                targets: [{ format: this.presentationFormat }]
            },
            primitive: { topology: 'triangle-list', cullMode: 'none' },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth32float'
            }
        })

        const depthTestTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height, 1],
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
        this.depthTestTextureView = depthTestTexture.createView()

        this.particleBindGroup = this.device.createBindGroup({
            label: 'sphere particle bind group',
            layout: particleBindGroupLayout,  
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer }},
                { binding: 1, resource: { buffer: this.renderUniformBuffer }},
            ]
        })

        this.wallBindGroup = this.device.createBindGroup({
            label: 'wall bind group',
            layout: this.wallPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.renderUniformBuffer }},
            ]
        })

        this.backgroundBindGroup = this.device.createBindGroup({
            label: 'reflective background bind group',
            layout: this.backgroundPipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: this.renderUniformBuffer }}]
        })

    }

    setBoundaryVisible(visible) {
        this.boundaryVisible = visible;
    }

    execute(context, commandEncoder, numParticles, renderStride = 1) {
        const currentTexture = context.getCurrentTexture();
        
        if (this.lastTexture !== currentTexture) {
            this.cachedColorView = currentTexture.createView();
            this.lastTexture = currentTexture;
        }

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: this.cachedColorView,
                    clearValue: this.clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: this.depthTestTextureView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        }

        const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        renderPassEncoder.setBindGroup(0, this.backgroundBindGroup);
        renderPassEncoder.setPipeline(this.backgroundPipeline);
        renderPassEncoder.draw(6);

        if (this.boundaryVisible) {
            renderPassEncoder.setBindGroup(0, this.wallBindGroup);
            renderPassEncoder.setPipeline(this.wallPipeline);
            renderPassEncoder.draw(31 * 36);
        }

        renderPassEncoder.setBindGroup(0, this.particleBindGroup);
        renderPassEncoder.setPipeline(this.particlePipeline);
        const safeRenderStride = Math.max(1, Math.floor(renderStride));
        renderPassEncoder.draw(6, Math.ceil(numParticles / safeRenderStride));

        renderPassEncoder.end();
    }
}
