import { Camera } from './camera.js?v=20260310m'
import { MLSMPMSimulator, mlsmpmParticleStructSize } from './mls-mpm/mls-mpm.js?v=20260310m'
import { FluidRenderer } from './render/fluidRender.js?v=20260310k'
import { renderUniformsValues, renderUniformsViews, numParticlesMax } from './common.js?v=20260310m'

const BOX_WIDTH = 100;
const BOX_HEIGHT = 100;
const BASE_BOX_DEPTH = 100;
const MAX_BOX_DEPTH = 220;
const SCENE_PULLBACK_RATIO = 0.5;
const BOX_LENGTH = 220;
const PISTON_MIN_LENGTH = 120;
const PISTON_PERIOD_SECONDS = (2 * Math.PI) / 1.2;
const FLUID_LENGTH = 100;
const PISTON_POWER = 0.8;
const PUSH_WIDTH = 3.0;
const PARTICLE_COUNT = 400000;
const QUALITY_MODE = 'low';
const PISTON_ENABLED = true;

async function init() {
  const canvas = document.querySelector('canvas');
  const userAgent = navigator.userAgent.toLowerCase();
  const isZen = userAgent.includes('zen');
  const isFirefoxFamily = userAgent.includes('firefox') || isZen;

  if (!navigator.gpu) {
    if (isZen) {
      throw new Error('Zen Browser does not expose WebGPU for this demo. Use Brave/Chrome, or a Firefox build with WebGPU support enabled.');
    }
    if (isFirefoxFamily) {
      throw new Error('This Firefox-based browser is not exposing WebGPU here. Try Brave/Chrome, or a compatible Firefox build with WebGPU enabled.');
    }
    throw new Error('WebGPU is not supported on your browser.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU adapter is not available in this browser session.');
  }

  const device = await adapter.requestDevice({
    requiredLimits: {
      maxBufferSize: adapter.limits.maxBufferSize,
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    }
  });
  const context = canvas.getContext('webgpu');

  if (!context) {
    throw new Error();
  }

  const devicePixelRatio = 3.0;
  canvas.width = devicePixelRatio * canvas.clientWidth;
  canvas.height = devicePixelRatio * canvas.clientHeight;

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format: presentationFormat });

  return { canvas, device, presentationFormat, context };
}

function getRenderZOffset() {
  return BASE_BOX_DEPTH - BOX_LENGTH * (1 + SCENE_PULLBACK_RATIO);
}

function getCameraTargetZ() {
  return 68 + getRenderZOffset() * 0.5;
}

async function main() {
  while (!window.Stats) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  try {
    const { canvas, device, presentationFormat, context } = await init();
    const stats = new window.Stats();
    stats.showPanel(0);
    stats.dom.style.position = 'fixed';
    stats.dom.style.left = '0px';
    stats.dom.style.top = '0px';
    stats.dom.style.zIndex = '100';
    document.body.appendChild(stats.dom);

    const canvasElement = document.getElementById('fluidCanvas');
    const fov = 45 * Math.PI / 180;
    const radius = 0.75;
    const diameter = 2 * radius;
    const zoomRate = 10.0;

    renderUniformsViews.texel_size.set([1.0 / canvas.width, 1.0 / canvas.height]);
    renderUniformsViews.sphere_size.set([radius, radius]);

    const particleBuffer = device.createBuffer({
      label: 'particles buffer',
      size: mlsmpmParticleStructSize * numParticlesMax,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });

    const posvelBuffer = device.createBuffer({
      label: 'position buffer',
      size: 32 * numParticlesMax,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const renderUniformBuffer = device.createBuffer({
      label: 'render uniform buffer',
      size: renderUniformsValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const simulator = new MLSMPMSimulator(particleBuffer, posvelBuffer, diameter, device, BOX_WIDTH, BOX_HEIGHT, MAX_BOX_DEPTH);
    await simulator.initialize();
    simulator.setInitialFluidDepth(FLUID_LENGTH);
    simulator.setBoundaryCouplingWidth(PUSH_WIDTH);
    simulator.setPistonPower(PISTON_POWER);

    const renderer = new FluidRenderer(device, canvas, presentationFormat, radius, fov, posvelBuffer, renderUniformBuffer);
    await renderer.initialize();
    renderer.setQualityMode(QUALITY_MODE);

    const camera = new Camera(canvasElement);

    const gridBoxSize = [BOX_WIDTH, BOX_HEIGHT, MAX_BOX_DEPTH];
    let realBoxSize = [BOX_WIDTH, BOX_HEIGHT, BOX_LENGTH];
    let previousDepth = realBoxSize[2];
    let pistonTime = Math.PI * 0.5;

    function updateRenderUniforms() {
      renderUniformsViews.box_size.set(realBoxSize);
      renderUniformsViews.render_z_offset[0] = getRenderZOffset();
      renderUniformsViews.box_anchor_z[0] = BOX_LENGTH;
      device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);
    }

    function resetSimulation(resetCamera = true) {
      simulator.reset(PARTICLE_COUNT, gridBoxSize, [BOX_WIDTH, BOX_HEIGHT, BOX_LENGTH]);
      realBoxSize = [BOX_WIDTH, BOX_HEIGHT, BOX_LENGTH];
      previousDepth = realBoxSize[2];
      pistonTime = Math.PI * 0.5;
      if (resetCamera) {
        camera.reset(canvasElement, 172, [BOX_WIDTH / 2, 18, getCameraTargetZ()], fov, zoomRate);
        camera.setCameraMode('orbit');
      }
      updateRenderUniforms();
    }

    const errorLog = document.getElementById('error-reason');
    errorLog.textContent = '';
    device.lost.then(info => {
      const reason = info.reason ? `reason: ${info.reason}` : 'unknown reason';
      errorLog.textContent = reason;
    });

    resetSimulation(true);

    let lastTime = performance.now();
    async function frame(currentTime) {
      stats.begin();

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      camera.update(deltaTime);
      const cameraDirty = camera.consumeDirty();
      let pistonVelocity = 0;

      if (PISTON_ENABLED) {
        const pistonAngularSpeed = (2 * Math.PI) / PISTON_PERIOD_SECONDS;
        pistonTime += deltaTime * pistonAngularSpeed;
        const pistonBlend = 0.5 + 0.5 * Math.sin(pistonTime);
        realBoxSize[2] = PISTON_MIN_LENGTH + (BOX_LENGTH - PISTON_MIN_LENGTH) * pistonBlend;
      } else {
        realBoxSize[2] = BOX_LENGTH;
      }

      if (Math.abs(realBoxSize[2] - previousDepth) > 1e-3) {
        pistonVelocity = (realBoxSize[2] - previousDepth) / Math.max(deltaTime, 1e-6);
      }

      renderUniformsViews.box_size.set(realBoxSize);
      renderUniformsViews.render_z_offset[0] = getRenderZOffset();
      renderUniformsViews.box_anchor_z[0] = BOX_LENGTH;

      if (cameraDirty || pistonVelocity !== 0) {
        device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);
      }

      const commandEncoder = device.createCommandEncoder();
      simulator.changeBoxSize(realBoxSize, pistonVelocity);
      simulator.execute(commandEncoder);
      renderer.execute(context, commandEncoder, simulator.numParticles);

      device.queue.submit([commandEncoder.finish()]);
      previousDepth = realBoxSize[2];

      stats.end();
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  } catch (error) {
    const errorLog = document.getElementById('error-reason');
    const message = error instanceof Error ? error.message : String(error);
    if (errorLog) {
      errorLog.textContent = message;
      errorLog.style.color = 'red';
      errorLog.style.background = 'rgba(255,255,255,0.85)';
      errorLog.style.padding = '8px 12px';
      errorLog.style.borderRadius = '6px';
      errorLog.style.maxWidth = '80vw';
      errorLog.style.zIndex = '9999';
    }
    console.error(error);
  }
}

main();
