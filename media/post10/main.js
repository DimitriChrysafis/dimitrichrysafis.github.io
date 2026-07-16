import { Camera } from './camera.js?v=20260712reflective3'
import { MLSMPMSimulator, mlsmpmParticleStructSize } from './mls-mpm/mls-mpm.js?v=20260712reflective3'
import { FluidRenderer } from './render/fluidRender.js?v=20260712reflective3'
import { renderUniformsValues, renderUniformsViews, numParticlesMax } from './common.js?v=20260712reflective3'

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
const DEFAULT_PISTON_ENABLED = true;
const MAX_RENDER_PIXEL_RATIO = 1.5;
const MAX_ADAPTIVE_RENDER_STRIDE = 4;
const SIMULATION_SPEED = 1.5;
const SOLVER_SUBSTEPS_PER_FRAME = 2;
const PULSE_DURATION_SECONDS = 1.65;
const PULSE_COMPRESSION_RATIO = 0.72;

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

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_RENDER_PIXEL_RATIO);
  canvas.width = devicePixelRatio * canvas.clientWidth;
  canvas.height = devicePixelRatio * canvas.clientHeight;

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format: presentationFormat, alphaMode: 'opaque' });

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
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const renderUniformBuffer = device.createBuffer({
      label: 'render uniform buffer',
      size: renderUniformsValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const simulator = new MLSMPMSimulator(particleBuffer, diameter, device, BOX_WIDTH, BOX_HEIGHT, MAX_BOX_DEPTH);
    await simulator.initialize();

    const renderer = new FluidRenderer(device, canvas, presentationFormat, radius, fov, particleBuffer, renderUniformBuffer);
    await renderer.initialize();

    const camera = new Camera(canvasElement);

    const simulationSettings = {
      isPaused: false,
      particleCount: DEFAULT_PARTICLE_COUNT,
      wakeFluid: () => wakeFluid(),
      pulseFluid: () => triggerPulse(),
      addParticles: () => addMoreParticles(),
      resetSimulation: () => resetSimulation({ resetTime: true, resetCamera: false }),
    };
    const worldSettings = {
      boxLength: DEFAULT_BOX_LENGTH,
      fluidLength: DEFAULT_FLUID_LENGTH,
    };
    const pistonSettings = {
      pistonEnabled: DEFAULT_PISTON_ENABLED,
      minLength: DEFAULT_MIN_LENGTH,
      period: DEFAULT_PERIOD_SECONDS,
      power: DEFAULT_PISTON_POWER,
      pushWidth: DEFAULT_PUSH_WIDTH,
    };
    const cameraSettings = {
      cameraMode: 'orbit',
      resetView: () => resetCameraView(),
    };
    const renderingSettings = {
      showBoundary: true,
      sphereScale: 1.0,
      renderStride: 2,
    };
    const performanceSettings = {
      adaptiveRenderDensity: true,
    };
    const interactionSettings = {
      radius: 22,
      force: 1.35,
    };

    let pistonTime = Math.PI * 0.5;
    const gridBoxSize = [BOX_WIDTH, BOX_HEIGHT, MAX_BOX_DEPTH];
    let currentParticleCount = DEFAULT_PARTICLE_COUNT;
    let realBoxSize = [BOX_WIDTH, BOX_HEIGHT, worldSettings.boxLength];
    let previousDepth = realBoxSize[2];
    let uniformsNeedUpdate = true;
    let previousStatus = '';
    let pulseTimeRemaining = 0;
    let activeRenderStride = renderingSettings.renderStride;
    let slowFrameStreak = 0;
    let fastFrameStreak = 0;
    const pointerState = {
      down: false,
      moved: false,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      point: [BOX_WIDTH * 0.5, 30, worldSettings.boxLength * 0.6],
      impulse: [0, 0, 0],
      strength: 0,
    };

    const stateElement = document.getElementById('simulation-state');
    const detailElement = document.getElementById('sim-detail');
    const interactionOrb = document.getElementById('interaction-orb');

    function formatParticleCount(count) {
      return Math.max(0, count).toLocaleString();
    }

    function setStatus(state, detail) {
      const nextStatus = `${state}|${detail}`;
      if (nextStatus === previousStatus) return;
      previousStatus = nextStatus;
      if (stateElement) stateElement.textContent = state;
      if (detailElement) detailElement.textContent = detail;
    }

    function normalizedRenderStride(value) {
      return clamp(Math.round(value), 1, MAX_ADAPTIVE_RENDER_STRIDE);
    }

    function setActiveRenderStride(value) {
      const nextStride = normalizedRenderStride(value);
      if (nextStride === activeRenderStride) return;
      activeRenderStride = nextStride;
      renderUniformsViews.render_stride[0] = activeRenderStride;
      uniformsNeedUpdate = true;
    }

    function applyRenderSettings({ resetAdaptive = false } = {}) {
      const scaledDiameter = diameter * renderingSettings.sphereScale;
      renderUniformsViews.sphere_size.set([scaledDiameter, scaledDiameter]);
      const configuredStride = normalizedRenderStride(renderingSettings.renderStride);
      if (resetAdaptive || !performanceSettings.adaptiveRenderDensity) {
        activeRenderStride = configuredStride;
      } else {
        activeRenderStride = Math.max(activeRenderStride, configuredStride);
      }
      renderUniformsViews.render_stride[0] = activeRenderStride;
    }

    function updateAdaptiveRenderDensity(deltaTime) {
      const configuredStride = normalizedRenderStride(renderingSettings.renderStride);
      if (!performanceSettings.adaptiveRenderDensity) {
        setActiveRenderStride(configuredStride);
        slowFrameStreak = 0;
        fastFrameStreak = 0;
        return;
      }

      if (deltaTime > 0.026) {
        slowFrameStreak++;
        fastFrameStreak = 0;
        if (slowFrameStreak >= 30 && activeRenderStride < MAX_ADAPTIVE_RENDER_STRIDE) {
          setActiveRenderStride(activeRenderStride + 1);
          slowFrameStreak = 0;
        }
      } else if (deltaTime < 0.019) {
        fastFrameStreak++;
        slowFrameStreak = 0;
        if (fastFrameStreak >= 180 && activeRenderStride > configuredStride) {
          setActiveRenderStride(activeRenderStride - 1);
          fastFrameStreak = 0;
        }
      } else {
        slowFrameStreak = 0;
        fastFrameStreak = 0;
      }
    }

    function wakeFluid() {
      simulationSettings.isPaused = false;
      setStatus('SIMULATING', `${formatParticleCount(simulator.numParticles || currentParticleCount)} shaded fluid spheres`);
      if (controllerRefs.isPaused) controllerRefs.isPaused.updateDisplay();
    }

    function triggerPulse() {
      if (pistonSettings.pistonEnabled) {
        pistonSettings.pistonEnabled = false;
        if (controllerRefs.pistonEnabled) controllerRefs.pistonEnabled.updateDisplay();
      }
      pulseTimeRemaining = PULSE_DURATION_SECONDS;
      wakeFluid();
      setStatus('TURBULENCE PULSE', `${formatParticleCount(simulator.numParticles || currentParticleCount)} spheres · compression wave engaged`);
    }

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

    function clamp(value, minimum, maximum) {
      return Math.max(minimum, Math.min(maximum, value));
    }

    function normalizeVector(vector) {
      const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
      return [vector[0] / length, vector[1] / length, vector[2] / length];
    }

    function getCameraBasis() {
      const target = camera.target || [BOX_WIDTH * 0.5, 28, getCameraTargetZ()];
      const forward = normalizeVector([
        target[0] - camera.position[0],
        target[1] - camera.position[1],
        target[2] - camera.position[2],
      ]);
      const right = normalizeVector([-forward[2], 0, forward[0]]);
      const up = normalizeVector([
        right[1] * forward[2] - right[2] * forward[1],
        right[2] * forward[0] - right[0] * forward[2],
        right[0] * forward[1] - right[1] * forward[0],
      ]);
      return { forward, right, up };
    }

    function screenToFluidPoint(clientX, clientY) {
      const rect = canvasElement.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
      const { forward, right, up } = getCameraBasis();
      const perspectiveScale = Math.tan(fov * 0.5);
      const aspect = rect.width / rect.height;
      const ray = normalizeVector([
        forward[0] + right[0] * ndcX * aspect * perspectiveScale + up[0] * ndcY * perspectiveScale,
        forward[1] + right[1] * ndcX * aspect * perspectiveScale + up[1] * ndcY * perspectiveScale,
        forward[2] + right[2] * ndcX * aspect * perspectiveScale + up[2] * ndcY * perspectiveScale,
      ]);
      const interactionPlaneY = clamp(worldSettings.fluidLength * 0.28, 20, 42);
      const planeDistance = (interactionPlaneY - camera.position[1]) / (Math.abs(ray[1]) > 0.001 ? ray[1] : -0.001);
      const distance = planeDistance > 0 ? planeDistance : 0;
      const renderX = camera.position[0] + ray[0] * distance;
      const renderY = camera.position[1] + ray[1] * distance;
      const renderZ = camera.position[2] + ray[2] * distance;
      return [
        clamp(renderX, 4, BOX_WIDTH - 4),
        clamp(renderY, 4, BOX_HEIGHT - 6),
        clamp(renderZ - getRenderZOffset(), 4, realBoxSize[2] - 5),
      ];
    }

    function queuePointerInteraction(event, impulse, strength) {
      pointerState.point = screenToFluidPoint(event.clientX, event.clientY);
      pointerState.impulse = impulse;
      pointerState.strength = Math.max(pointerState.strength, strength);
      pointerState.x = event.clientX;
      pointerState.y = event.clientY;
      wakeFluid();
      setStatus('MOUSE SPLASH', `${formatParticleCount(simulator.numParticles)} spheres · local impulse active`);
    }

    function updateInteractionOrb() {
      if (!interactionOrb) return;
      if (pointerState.strength > 0.02) {
        interactionOrb.style.left = `${pointerState.x}px`;
        interactionOrb.style.top = `${pointerState.y}px`;
        interactionOrb.classList.add('active');
      } else {
        interactionOrb.classList.remove('active');
      }
    }

    function applyLiveSettings() {
      clampSettings();
      simulator.setInitialFluidDepth(worldSettings.fluidLength);
      simulator.setBoundaryCouplingWidth(pistonSettings.pushWidth);
      simulator.setPistonPower(pistonSettings.power);
      renderUniformsViews.render_z_offset[0] = getRenderZOffset();
      renderUniformsViews.box_anchor_z[0] = worldSettings.boxLength;
      applyRenderSettings({ resetAdaptive: true });
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
      applyRenderSettings({ resetAdaptive: true });
      simulationSettings.isPaused = false;
      pulseTimeRemaining = 0;
      pointerState.strength = 0;
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
      if (pistonSettings.pistonEnabled) {
        setStatus('PISTON ACTIVE', `${formatParticleCount(simulator.numParticles)} shaded spheres`);
      } else {
        setStatus('SIMULATING', `${formatParticleCount(simulator.numParticles)} shaded spheres · piston idle`);
      }
    }

    function addMoreParticles() {
      wakeFluid();
      const centerX = BOX_WIDTH / 2;
      const centerY = BOX_HEIGHT / 2;
      const centerZ = Math.max(10, realBoxSize[2] - 18);
      const sphereRadius = 5;
      const numSphereParticles = 10000;

      simulator.addSphere(centerX, centerY, centerZ, sphereRadius, numSphereParticles);
      setStatus('SIMULATING', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres`);
    }

    const simulationFolder = gui.addFolder('Simulation');
    controllerRefs.isPaused = simulationFolder.add(simulationSettings, 'isPaused').name('Pause Simulation').onChange((value) => {
      if (value) {
        setStatus('PAUSED', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres`);
      } else {
        wakeFluid();
      }
    });
    controllerRefs.particleCount = simulationFolder.add(simulationSettings, 'particleCount', 100000, 600000, 10000).name('Particle Count').onFinishChange((value) => {
      currentParticleCount = Math.round(value / 10000) * 10000;
      simulationSettings.particleCount = currentParticleCount;
      resetSimulation({ resetTime: true, resetCamera: false });
    });
    simulationFolder.add(simulationSettings, 'wakeFluid').name('Wake Fluid');
    simulationFolder.add(simulationSettings, 'pulseFluid').name('Turbulence Pulse');
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
        pulseTimeRemaining = 0;
        wakeFluid();
        pistonTime = Math.PI * 0.5;
        setStatus('PISTON ACTIVE', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres`);
      } else {
        realBoxSize[2] = worldSettings.boxLength;
        previousDepth = realBoxSize[2];
        uniformsNeedUpdate = true;
        if (!simulationSettings.isPaused) {
          setStatus('SIMULATING', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres · piston idle`);
        }
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
    controllerRefs.sphereScale = renderingFolder.add(renderingSettings, 'sphereScale', 0.7, 1.4, 0.05).name('Sphere Scale').onChange(() => {
      applyRenderSettings();
      uniformsNeedUpdate = true;
    });
    controllerRefs.renderStride = renderingFolder.add(renderingSettings, 'renderStride', 1, 4, 1).name('Render Every Nth').onChange(() => {
      applyRenderSettings({ resetAdaptive: true });
      uniformsNeedUpdate = true;
    });
    controllerRefs.adaptiveRenderDensity = renderingFolder.add(performanceSettings, 'adaptiveRenderDensity').name('Auto Render Density').onChange((enabled) => {
      if (!enabled) {
        setActiveRenderStride(renderingSettings.renderStride);
      }
      slowFrameStreak = 0;
      fastFrameStreak = 0;
    });
    controllerRefs.showBoundary = renderingFolder.add(renderingSettings, 'showBoundary').name('Show Wall & Piston').onChange((value) => {
      renderingSettings.showBoundary = value;
      renderer.setBoundaryVisible(value);
    });
    renderingFolder.open();

    const interactionFolder = gui.addFolder('Mouse Interaction');
    controllerRefs.interactionRadius = interactionFolder.add(interactionSettings, 'radius', 8, 34, 1).name('Splash Radius');
    controllerRefs.interactionForce = interactionFolder.add(interactionSettings, 'force', 0.35, 2.5, 0.05).name('Force');
    interactionFolder.open();

    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        if (simulationSettings.isPaused) {
          wakeFluid();
        } else {
          simulationSettings.isPaused = true;
          setStatus('PAUSED', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres`);
        }
        refreshControllerDisplays();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'g') {
        addMoreParticles();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'Space' && cameraSettings.cameraMode === 'orbit') {
        event.preventDefault();
        triggerPulse();
      }
    });

    canvasElement.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      pointerState.down = true;
      pointerState.moved = false;
      pointerState.startX = event.clientX;
      pointerState.startY = event.clientY;
    });

    canvasElement.addEventListener('pointermove', (event) => {
      if (!pointerState.down) return;
      const dx = event.clientX - pointerState.startX;
      const dy = event.clientY - pointerState.startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) pointerState.moved = true;
    });

    function releasePointerInteraction(event) {
      if (!pointerState.down) return;
      if (!pointerState.moved) {
        queuePointerInteraction(event, [0, 3.0 * interactionSettings.force, 0], 1.5 * interactionSettings.force);
      }
      pointerState.down = false;
    }

    canvasElement.addEventListener('pointerup', releasePointerInteraction);
    canvasElement.addEventListener('pointercancel', releasePointerInteraction);

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

      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const simulationDeltaTime = deltaTime * SIMULATION_SPEED;

      updateAdaptiveRenderDensity(deltaTime);
      camera.update(deltaTime);
      const cameraDirty = camera.consumeDirty();
      let pistonVelocity = 0;

      if (!simulationSettings.isPaused) {
        if (pistonSettings.pistonEnabled) {
          const pistonAngularSpeed = (2 * Math.PI) / pistonSettings.period;
          pistonTime += simulationDeltaTime * pistonAngularSpeed;
          const pistonBlend = 0.5 + 0.5 * Math.sin(pistonTime);
          realBoxSize[2] = pistonSettings.minLength + (worldSettings.boxLength - pistonSettings.minLength) * pistonBlend;
          setStatus('PISTON ACTIVE', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres`);
        } else if (pulseTimeRemaining > 0) {
          const progress = 1.0 - pulseTimeRemaining / PULSE_DURATION_SECONDS;
          const pulseBlend = Math.sin(progress * Math.PI);
          realBoxSize[2] = worldSettings.boxLength - (worldSettings.boxLength - pistonSettings.minLength) * PULSE_COMPRESSION_RATIO * pulseBlend;
          pulseTimeRemaining = Math.max(0, pulseTimeRemaining - simulationDeltaTime);
          setStatus('TURBULENCE PULSE', `${formatParticleCount(simulator.numParticles)} shaded spheres · compression wave engaged`);
        } else {
          realBoxSize[2] = worldSettings.boxLength;
          setStatus('SIMULATING', `${formatParticleCount(simulator.numParticles)} shaded fluid spheres · piston idle`);
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

      if (pointerState.strength > 0.02) {
        simulator.setInteraction(
          pointerState.point,
          pointerState.impulse,
          interactionSettings.radius,
          pointerState.strength,
        );
        pointerState.strength *= 0.78;
      } else {
        pointerState.strength = 0;
        simulator.clearInteraction();
      }
      updateInteractionOrb();

      const commandEncoder = device.createCommandEncoder();

      simulator.changeBoxSize(realBoxSize, pistonVelocity);
      if (!simulationSettings.isPaused) {
        simulator.execute(commandEncoder, SOLVER_SUBSTEPS_PER_FRAME * SIMULATION_SPEED);
      }
      renderer.execute(context, commandEncoder, simulator.numParticles, activeRenderStride);

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
