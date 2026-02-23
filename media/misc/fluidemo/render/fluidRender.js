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
        this.wireframeEnabled = false
        this.boundingBoxEnabled = true
        this.qualityMode = 'medium'
        this.clearColor = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
        this.cachedColorView = null
        this.lastTexture = null
    }

    async initialize() {
        const sphere = await fetch('render/sphere.wgsl').then(r => r.text());
        const wireframe = await fetch('render/wireframe.wgsl').then(r => r.text());
        const boundingBox = await fetch('render/boundingBox.wgsl').then(r => r.text());
        const sphereModule = this.device.createShaderModule({ code: sphere })
        const wireframeModule = this.device.createShaderModule({ code: wireframe })
        const boundingBoxModule = this.device.createShaderModule({ code: boundingBox })

        const sphereBindGroupLayout = this.device.createBindGroupLayout({
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
        const spherePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [sphereBindGroupLayout],
        })

        const boundingBoxBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' },
                },
            ],
        })
        const boundingBoxPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [boundingBoxBindGroupLayout],
        })

        this.spherePipeline = this.device.createRenderPipeline({
            label: 'sphere pipeline', 
            layout: spherePipelineLayout, 
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

        this.wireframePipeline = this.device.createRenderPipeline({
            label: 'wireframe pipeline', 
            layout: spherePipelineLayout, 
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

        this.boundingBoxPipeline = this.device.createRenderPipeline({
            label: 'bounding box pipeline', 
            layout: boundingBoxPipelineLayout, 
            vertex: { module: boundingBoxModule }, 
            fragment: {
                module: boundingBoxModule, 
                targets: [{
                    format: this.presentationFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                    },
                }]
            }, 
            primitive: { 
                topology: 'triangle-list',
                stripIndexFormat: undefined
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less-equal',
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
            layout: sphereBindGroupLayout,  
            entries: [
                { binding: 0, resource: { buffer: this.posvelBuffer }},
                { binding: 1, resource: { buffer: this.renderUniformBuffer }},
            ]
        })

        this.wireframeBindGroup = this.device.createBindGroup({
            label: 'wireframe bind group', 
            layout: sphereBindGroupLayout,  
            entries: [
                { binding: 0, resource: { buffer: this.posvelBuffer }},
                { binding: 1, resource: { buffer: this.renderUniformBuffer }},
            ]
        })

        this.boundingBoxBindGroup = this.device.createBindGroup({
            label: 'bounding box bind group', 
            layout: boundingBoxBindGroupLayout,  
            entries: [
                { binding: 0, resource: { buffer: this.renderUniformBuffer }},
            ]
        })
    }

    setWireframeMode(enabled) {
        this.wireframeEnabled = enabled;
    }

    setQualityMode(mode) {
        this.qualityMode = mode;
        if (mode === 'low') {
            this.wireframeEnabled = true;
            this.clearColor = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
        } else {
            this.wireframeEnabled = false;
            this.clearColor = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
        }
    }

    setBoundingBoxMode(enabled) {
        this.boundingBoxEnabled = enabled;
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

        if (this.boundingBoxEnabled) {
            renderPassEncoder.setBindGroup(0, this.boundingBoxBindGroup);
            renderPassEncoder.setPipeline(this.boundingBoxPipeline);
            renderPassEncoder.draw(54);
        }

        if (this.wireframeEnabled) {
            renderPassEncoder.setBindGroup(0, this.wireframeBindGroup);
            renderPassEncoder.setPipeline(this.wireframePipeline);
            renderPassEncoder.draw(96, numParticles);
        } else {
            renderPassEncoder.setBindGroup(0, this.sphereBindGroup);
            renderPassEncoder.setPipeline(this.spherePipeline);
            renderPassEncoder.draw(6, numParticles);
        }

        renderPassEncoder.end();
    }
}
