export class FluidRenderer {
    constructor(
        device, canvas, presentationFormat,
        radius, fov, posvelBuffer, 
        renderUniformBuffer
    ) {
        this.device = device
        this.canvas = canvas
        this.presentationFormat = presentationFormat
        this.posvelBuffer = posvelBuffer
        this.renderUniformBuffer = renderUniformBuffer
        this.boundaryVisible = true
        this.clearColor = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
        this.cachedColorView = null
        this.lastTexture = null
    }

    async initialize() {
        const sphere = await fetch('render/sphere.wgsl?v=20260716a').then(r => r.text());
        const wall = await fetch('render/wall.wgsl?v=20260310k').then(r => r.text());
        const sphereModule = this.device.createShaderModule({ code: sphere })
        const wallModule = this.device.createShaderModule({ code: wall })

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

        this.spherePipeline = this.device.createRenderPipeline({
            label: 'sphere pipeline', 
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

        this.sphereBindGroup = this.device.createBindGroup({
            label: 'sphere bind group', 
            layout: particleBindGroupLayout,  
            entries: [
                { binding: 0, resource: { buffer: this.posvelBuffer }},
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

    }

    setBoundaryVisible(visible) {
        this.boundaryVisible = visible;
    }

    execute(context, commandEncoder, numParticles) {
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

        if (this.boundaryVisible) {
            renderPassEncoder.setBindGroup(0, this.wallBindGroup);
            renderPassEncoder.setPipeline(this.wallPipeline);
            renderPassEncoder.draw(31 * 36);
        }

        renderPassEncoder.setBindGroup(0, this.sphereBindGroup);
        renderPassEncoder.setPipeline(this.spherePipeline);
        renderPassEncoder.draw(6, numParticles);

        renderPassEncoder.end();
    }
}
