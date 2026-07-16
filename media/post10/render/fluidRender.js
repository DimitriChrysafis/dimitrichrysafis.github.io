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
        const wireframe = await fetch('render/wireframe.wgsl?v=20260310k').then(r => r.text());
        const wall = await fetch('render/wall.wgsl?v=20260310k').then(r => r.text());
        const wireframeModule = this.device.createShaderModule({ code: wireframe })
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

        this.wireframePipeline = this.device.createRenderPipeline({
            label: 'wireframe pipeline', 
            layout: particlePipelineLayout, 
            vertex: { module: wireframeModule }, 
            fragment: {
                module: wireframeModule, 
                targets: [{ format: this.presentationFormat }]
            }, 
            primitive: { 
                topology: 'line-list',
                stripIndexFormat: undefined
            },
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

        this.wireframeBindGroup = this.device.createBindGroup({
            label: 'wireframe bind group', 
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

        renderPassEncoder.setBindGroup(0, this.wireframeBindGroup);
        renderPassEncoder.setPipeline(this.wireframePipeline);
        renderPassEncoder.draw(96, numParticles);

        renderPassEncoder.end();
    }
}
