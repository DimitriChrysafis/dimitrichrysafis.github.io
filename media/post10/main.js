import { Camera } from './camera.js?v=20260310p'
import { MLSMPMSimulator, mlsmpmParticleStructSize } from './mls-mpm/mls-mpm.js?v=20260310p'
import { FluidRenderer } from './render/fluidRender.js?v=20260310k'
import { renderUniformsValues, renderUniformsViews, numParticlesMax } from './common.js?v=20260310p'

const BOX_WIDTH = 100;
const BOX_HEIGHT = 190;
const BASE_BOX_DEPTH = 100;
const MAX_BOX_DEPTH = 220;
const SCENE_PULLBACK_RATIO = 0.5;

const DEFAULT_BOX_LENGTH = 220;
const DEFAULT_MIN_LENGTH = 120;
const DEFAULT_PERIOD_SECONDS = 8.0;
const DEFAULT_FLUID_LENGTH = 100;
const DEFAULT_PISTON_POWER = 0.7;
const DEFAULT_PUSH_WIDTH = 3.0;
const DEFAULT_PARTICLE_COUNT = 400000;
const DEFAULT_CAMERA_DISTANCE = 275;

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

async function main() {
  while (!window.dat || !window.Stats) {
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

    const renderer = new FluidRenderer(device, canvas, presentationFormat, radius, fov, posvelBuffer, renderUniformBuffer);
    await renderer.initialize();

    const camera = new Camera(canvasElement);

    const simulationSettings = {
      isPaused: false,
      addParticles: () => addMoreParticles(),
      resetSimulation: () => resetSimulation({ resetTime: true, resetCamera: false }),
    };
    const worldSettings = {
      boxLength: DEFAULT_BOX_LENGTH,
      fluidLength: DEFAULT_FLUID_LENGTH,
    };
    const pistonSettings = {
      pistonEnabled: true,
      minLength: DEFAULT_MIN_LENGTH,
      period: DEFAULT_PERIOD_SECONDS,
      power: DEFAULT_PISTON_POWER,
      pushWidth: DEFAULT_PUSH_WIDTH,
    };
    const cameraSettings = {
      cameraMode: 'orbit',
      resetView: () => resetCameraView(),
    };
    const qualitySettings = {
      quality: 'low',
    };

    let pistonTime = Math.PI * 0.5;
    const gridBoxSize = [BOX_WIDTH, BOX_HEIGHT, MAX_BOX_DEPTH];
    let currentParticleCount = DEFAULT_PARTICLE_COUNT;
    let realBoxSize = [BOX_WIDTH, BOX_HEIGHT, worldSettings.boxLength];
    let previousDepth = realBoxSize[2];
    let uniformsNeedUpdate = true;

    const controllerRefs = {};
    const gui = new dat.GUI();

    function clampSettings() {
      worldSettings.boxLength = Math.max(BASE_BOX_DEPTH, Math.min(MAX_BOX_DEPTH, worldSettings.boxLength));
      worldSettings.fluidLength = Math.max(40, Math.min(worldSettings.boxLength, worldSettings.fluidLength));
      pistonSettings.minLength = Math.max(60, Math.min(worldSettings.boxLength, pistonSettings.minLength));
      pistonSettings.period = Math.max(0.5, pistonSettings.period);
      pistonSettings.power = Math.max(0.0, Math.min(2.0, pistonSettings.power));
      pistonSettings.pushWidth = Math.max(0.5, Math.min(8.0, pistonSettings.pushWidth));
    }

    function refreshControllerDisplays() {
      Object.values(controllerRefs).forEach((controller) => controller.updateDisplay());
    }

    function getRenderZOffset() {
      return BASE_BOX_DEPTH - worldSettings.boxLength * (1 + SCENE_PULLBACK_RATIO);
    }

    function getCameraTargetZ() {
      return 68 + getRenderZOffset() * 0.5;
    }

    function applyLiveSettings() {
      clampSettings();
      simulator.setInitialFluidDepth(worldSettings.fluidLength);
      simulator.setBoundaryCouplingWidth(pistonSettings.pushWidth);
      simulator.setPistonPower(pistonSettings.power);
      renderUniformsViews.render_z_offset[0] = getRenderZOffset();
      renderUniformsViews.box_anchor_z[0] = worldSettings.boxLength;
    }

    function resetCameraView() {
      applyLiveSettings();
      camera.reset(canvasElement, DEFAULT_CAMERA_DISTANCE, [BOX_WIDTH / 2, 18, getCameraTargetZ()], fov, zoomRate);
      camera.setCameraMode(cameraSettings.cameraMode);
      uniformsNeedUpdate = true;
    }

    function resetSimulation({ resetTime = true, resetCamera = true } = {}) {
      applyLiveSettings();
      const activeBoxSize = [BOX_WIDTH, BOX_HEIGHT, worldSettings.boxLength];
      simulator.reset(currentParticleCount, gridBoxSize, activeBoxSize);
      realBoxSize = [...activeBoxSize];
      previousDepth = realBoxSize[2];
      if (resetTime) {
        pistonTime = Math.PI * 0.5;
      }
      if (!pistonSettings.pistonEnabled) {
        realBoxSize[2] = worldSettings.boxLength;
        previousDepth = realBoxSize[2];
      }
      if (resetCamera) {
        resetCameraView();
      }
      renderUniformsViews.box_size.set(realBoxSize);
      renderUniformsViews.render_z_offset[0] = getRenderZOffset();
      renderUniformsViews.box_anchor_z[0] = worldSettings.boxLength;
      device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);
      uniformsNeedUpdate = false;
      refreshControllerDisplays();
    }

    function addMoreParticles() {
      const centerX = BOX_WIDTH / 2;
      const centerY = BOX_HEIGHT / 2;
      const centerZ = Math.max(10, realBoxSize[2] - 18);
      const sphereRadius = 5;
      const numSphereParticles = 10000;

      simulator.addSphere(centerX, centerY, centerZ, sphereRadius, numSphereParticles);
    }

    renderer.setQualityMode(qualitySettings.quality);

    const simulationFolder = gui.addFolder('Simulation');
    controllerRefs.isPaused = simulationFolder.add(simulationSettings, 'isPaused').name('Pause Simulation').onChange((value) => {
      simulationSettings.isPaused = value;
    });
    simulationFolder.add(simulationSettings, 'addParticles').name('Add 10,000 Particles');
    simulationFolder.add(simulationSettings, 'resetSimulation').name('Reset Fluid');
    simulationFolder.open();

    const worldFolder = gui.addFolder('World');
    controllerRefs.boxLength = worldFolder.add(worldSettings, 'boxLength', BASE_BOX_DEPTH, MAX_BOX_DEPTH, 5).name('Box Length').onChange(() => {
      applyLiveSettings();
      uniformsNeedUpdate = true;
      refreshControllerDisplays();
    }).onFinishChange(() => {
      resetSimulation({ resetTime: true, resetCamera: false });
    });
    controllerRefs.fluidLength = worldFolder.add(worldSettings, 'fluidLength', 40, MAX_BOX_DEPTH, 5).name('Fluid Seed').onChange(() => {
      applyLiveSettings();
      refreshControllerDisplays();
    }).onFinishChange(() => {
      resetSimulation({ resetTime: true, resetCamera: false });
    });
    worldFolder.open();

    const pistonFolder = gui.addFolder('Piston Controls');
    controllerRefs.pistonEnabled = pistonFolder.add(pistonSettings, 'pistonEnabled').name('Enable Piston').onChange((value) => {
      pistonSettings.pistonEnabled = value;
      if (value) {
        pistonTime = Math.PI * 0.5;
      } else {
        realBoxSize[2] = worldSettings.boxLength;
        previousDepth = realBoxSize[2];
        uniformsNeedUpdate = true;
      }
    });
    controllerRefs.minLength = pistonFolder.add(pistonSettings, 'minLength', 60, MAX_BOX_DEPTH, 5).name('Min Length').onChange(() => {
      applyLiveSettings();
      uniformsNeedUpdate = true;
      refreshControllerDisplays();
    });
    controllerRefs.period = pistonFolder.add(pistonSettings, 'period', 1.0, 16.0, 0.1).name('Period (s)').onChange(() => {
      clampSettings();
      refreshControllerDisplays();
    });
    controllerRefs.power = pistonFolder.add(pistonSettings, 'power', 0.0, 2.0, 0.05).name('Power').onChange(() => {
      applyLiveSettings();
    });
    controllerRefs.pushWidth = pistonFolder.add(pistonSettings, 'pushWidth', 0.5, 8.0, 0.25).name('Push Width').onChange(() => {
      applyLiveSettings();
    });
    pistonFolder.open();

    const cameraFolder = gui.addFolder('Camera');
    controllerRefs.cameraMode = cameraFolder.add(cameraSettings, 'cameraMode', ['orbit', 'coolcal']).name('Camera Mode').onChange((value) => {
      cameraSettings.cameraMode = value;
      camera.setCameraMode(value);
    });
    cameraFolder.add(cameraSettings, 'resetView').name('Reset View');
    cameraFolder.open();

    const renderingFolder = gui.addFolder('Rendering');
    controllerRefs.quality = renderingFolder.add(qualitySettings, 'quality', {
      'Low (Potato)': 'low',
      'Medium': 'medium',
    }).name('Quality').onChange((value) => {
      qualitySettings.quality = value;
      renderer.setQualityMode(value);
    });
    renderingFolder.open();

    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        simulationSettings.isPaused = !simulationSettings.isPaused;
        refreshControllerDisplays();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'g') {
        addMoreParticles();
      }
    });

    let errorLog = document.getElementById('error-reason');
    errorLog.textContent = '';
    device.lost.then(info => {
      const reason = info.reason ? `reason: ${info.reason}` : 'unknown reason';
      errorLog.textContent = reason;
    });

    resetSimulation({ resetTime: false, resetCamera: true });

    let lastTime = performance.now();
    async function frame(currentTime) {
      stats.begin();

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      camera.update(deltaTime);
      const cameraDirty = camera.consumeDirty();
      let pistonVelocity = 0;

      if (!simulationSettings.isPaused) {
        if (pistonSettings.pistonEnabled) {
          const pistonAngularSpeed = (2 * Math.PI) / pistonSettings.period;
          pistonTime += deltaTime * pistonAngularSpeed;
          const pistonBlend = 0.5 + 0.5 * Math.sin(pistonTime);
          realBoxSize[2] = pistonSettings.minLength + (worldSettings.boxLength - pistonSettings.minLength) * pistonBlend;
        } else {
          realBoxSize[2] = worldSettings.boxLength;
        }

        if (Math.abs(realBoxSize[2] - previousDepth) > 1e-3) {
          pistonVelocity = (realBoxSize[2] - previousDepth) / Math.max(deltaTime, 1e-6);
        }
        uniformsNeedUpdate = true;
      }

      if (uniformsNeedUpdate) {
        renderUniformsViews.box_size.set(realBoxSize);
        renderUniformsViews.render_z_offset[0] = getRenderZOffset();
        renderUniformsViews.box_anchor_z[0] = worldSettings.boxLength;
      }

      if (uniformsNeedUpdate || cameraDirty) {
        device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);
      }
      uniformsNeedUpdate = false;

      const commandEncoder = device.createCommandEncoder();

      simulator.changeBoxSize(realBoxSize, pistonVelocity);
      if (!simulationSettings.isPaused) {
        simulator.execute(commandEncoder);
      }
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
