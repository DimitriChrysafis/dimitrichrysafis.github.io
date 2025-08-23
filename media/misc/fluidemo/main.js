import { Camera } from './camera.js'
import { MLSMPMSimulator, mlsmpmParticleStructSize } from './mls-mpm/mls-mpm.js'
import { FluidRenderer } from './render/fluidRender.js'
import { renderUniformsValues, renderUniformsViews, numParticlesMax } from './common.js'

const BOX_WIDTH = 100;
const BOX_HEIGHT = 100;
const BOX_DEPTH = 100;

async function init() {
  const canvas = document.querySelector('canvas');

  if (!navigator.gpu) {
    alert("WebGPU is not supported on your browser.");
    throw new Error();
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    alert("Adapter is not available.");
    throw new Error();
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

  let devicePixelRatio = 3.0;
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


    const canvasElement = document.getElementById("fluidCanvas");
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

    const simulator = new MLSMPMSimulator(particleBuffer, posvelBuffer, diameter, device, BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH);
    await simulator.initialize();
    
    const renderer = new FluidRenderer(device, canvas, presentationFormat, radius, fov, posvelBuffer, renderUniformBuffer);
    await renderer.initialize();
    
    const camera = new Camera(canvasElement);
    
    let isPaused = false;
    let waveEnabled = true;
    let waveTime = 0;
    let waveAmplitude = 0.40;
    let boxDepth = 100;
    
    let wireframeEnabled = true;
    let boundingBoxEnabled = true;
    
    renderer.setBoundingBoxMode(boundingBoxEnabled);
    
    renderer.setWireframeMode(wireframeEnabled);
    
    const gui = new dat.GUI();
    
    const simulationFolder = gui.addFolder('Simulation');
    simulationFolder.add({ isPaused: isPaused }, 'isPaused').name('Pause Simulation').onChange((value) => {
      isPaused = value;
    });
    
    simulationFolder.add({ 
      addParticles: () => addMoreParticles() 
    }, 'addParticles').name('Add 10,000 Particles');
    
    simulationFolder.open();
    
    const waveFolder = gui.addFolder('Wave Controls');
    waveFolder.add({ waveEnabled: waveEnabled }, 'waveEnabled').name('Enable Moving Wall').onChange((value) => {
      waveEnabled = value;
      if (waveEnabled) {
        waveTime = 0;
      } else {
      }
    });
    
    waveFolder.open();
    
    const cameraFolder = gui.addFolder('Camera');
    let cameraMode = 'orbit';
    cameraFolder.add({ cameraMode: cameraMode }, 'cameraMode', ['orbit', 'coolcal']).name('Camera Mode').onChange((value) => {
      cameraMode = value;
      camera.setCameraMode(value);
    });
    cameraFolder.open();
    
    const renderingFolder = gui.addFolder('Rendering');
    renderingFolder.add({ wireframeEnabled: wireframeEnabled }, 'wireframeEnabled').name('potato friendly mode').onChange((value) => {
      wireframeEnabled = value;
      if (renderer && renderer.setWireframeMode) {
        renderer.setWireframeMode(wireframeEnabled);
      }
    });
    
    renderingFolder.add({ boundingBoxEnabled: boundingBoxEnabled }, 'boundingBoxEnabled').name('Show Bounding Box').onChange((value) => {
      boundingBoxEnabled = value;
      if (renderer && renderer.setBoundingBoxMode) {
        renderer.setBoundingBoxMode(boundingBoxEnabled);
      }
    });
    
    renderingFolder.open();
    
    function addMoreParticles() {
      const centerX = BOX_WIDTH / 2;
      const centerY = BOX_HEIGHT / 2;
      const centerZ = BOX_DEPTH / 2;
      const radius = 5;
      const numSphereParticles = 10000;
      
      simulator.addSphere(centerX, centerY, centerZ, radius, numSphereParticles);
    }
    
    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        isPaused = !isPaused;
        gui.updateDisplay();
      }
    });
    
    document.addEventListener('keydown', function(event) {
      if (event.key.toLowerCase() === 'g') {
        addMoreParticles();
      }
    });

    let errorLog = document.getElementById('error-reason');
    errorLog.textContent = "";
    device.lost.then(info => {
      const reason = info.reason ? `reason: ${info.reason}` : 'unknown reason';
      errorLog.textContent = reason;
    });

    let currentParticleCount = 400000;
    let initBoxSize = [BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH];
    let realBoxSize = [...initBoxSize];
    simulator.reset(currentParticleCount, initBoxSize);
    
    camera.reset(canvasElement, 150, [BOX_WIDTH / 2, BOX_HEIGHT / 4, BOX_DEPTH / 2], fov, zoomRate);

    let boxWidthRatio = 1.0;
    let prevBoxSize = [...realBoxSize];
    let uniformsNeedUpdate = true;

    let lastTime = performance.now();
    async function frame(currentTime) {
      stats.begin();

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Always allow camera updates regardless of pause state
      camera.update(deltaTime);

      if (!isPaused) {
        if (waveEnabled) {
          waveTime += 0.02;
          boxWidthRatio = 1.0 + Math.sin(waveTime) * waveAmplitude;

          boxWidthRatio = Math.max(0.2, Math.min(2.0, boxWidthRatio));

          realBoxSize[2] = initBoxSize[2] * boxWidthRatio;
          simulator.changeBoxSize(realBoxSize);
          uniformsNeedUpdate = true;
        }
      }

      // Always update uniforms every frame to ensure camera works while paused
      renderUniformsViews.box_size.set(realBoxSize);
      device.queue.writeBuffer(renderUniformBuffer, 0, renderUniformsValues);
      
      // Update tracking variables
      if (realBoxSize[0] !== prevBoxSize[0] || realBoxSize[1] !== prevBoxSize[1] || realBoxSize[2] !== prevBoxSize[2]) {
        prevBoxSize = [...realBoxSize];
      }
      uniformsNeedUpdate = false;

      const commandEncoder = device.createCommandEncoder();

      if (!isPaused) {
        simulator.execute(commandEncoder);
      }
      renderer.execute(context, commandEncoder, simulator.numParticles);

      device.queue.submit([commandEncoder.finish()]);
      
      stats.end();
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    
    setInterval(() => {
      
      if (Math.floor(Date.now() / 10000) % 30 === 0) {
      }
    }, 5000);
  } catch (error) {
  }
}

main();
