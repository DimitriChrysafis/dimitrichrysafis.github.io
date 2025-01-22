const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2', { antialias: true });

// i know this looks bad
const settings = {
    resolution: { width: window.innerWidth, height: window.innerHeight },
    zoom: 1.0, targetZoom: 1.0, zoomSpeed: 0.15,
    pan: { x: 0.5, y: 0.9 }, targetPan: { x: 0.5, y: 0.9 }, panSpeed: 0.1,
    time: 0, isAnimating: true,
    mouse: { x: 0, y: 0, isDragging: false, lastPos: { x: 0, y: 0 } }
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    settings.resolution.width = window.innerWidth;
    settings.resolution.height = window.innerHeight;
    canvas.width = settings.resolution.width * dpr;
    canvas.height = settings.resolution.height * dpr;
    canvas.style.width = `${settings.resolution.width}px`;
    canvas.style.height = `${settings.resolution.height}px`;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

async function init() {
    const vertexShaderSource = await fetch('vertex.glsl').then(res => res.text());
    const fragmentShaderSource = await fetch('fragment.glsl').then(res => res.text());

    const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniformLocations = {
        time: gl.getUniformLocation(program, 'iTime'),
        resolution: gl.getUniformLocation(program, 'iResolution'),
        zoom: gl.getUniformLocation(program, 'zoom'),
        mousePos: gl.getUniformLocation(program, 'mousePos'),
        pan: gl.getUniformLocation(program, 'pan')
    };

    const render = () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        settings.zoom += (settings.targetZoom - settings.zoom) * settings.zoomSpeed;
        settings.pan.x += (settings.targetPan.x - settings.pan.x) * settings.panSpeed;
        settings.pan.y += (settings.targetPan.y - settings.pan.y) * settings.panSpeed;

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.uniform1f(uniformLocations.time, settings.time);
        gl.uniform2f(uniformLocations.resolution, canvas.width, canvas.height);
        gl.uniform1f(uniformLocations.zoom, settings.zoom);
        gl.uniform2f(uniformLocations.mousePos, settings.mouse.x, settings.mouse.y);
        gl.uniform2f(uniformLocations.pan, settings.pan.x, settings.pan.y);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const animate = () => {
        if (settings.isAnimating) {
            settings.time += 0.016;
            render();
            requestAnimationFrame(animate);
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        settings.mouse.x = (e.clientX - rect.left) / rect.width * 2 - 1;
        settings.mouse.y = (e.clientY - rect.top) / rect.height * 2 - 1;

        if (settings.mouse.isDragging) {
            const dx = (e.clientX - settings.mouse.lastPos.x) / canvas.width * settings.zoom * 2;
            const dy = (e.clientY - settings.mouse.lastPos.y) / canvas.height * settings.zoom * 2;
            settings.targetPan.x -= dx * (canvas.width / canvas.height);
            settings.targetPan.y += dy;
            settings.mouse.lastPos.x = e.clientX;
            settings.mouse.lastPos.y = e.clientY;
        }
    };

    const handleMouseDown = (e) => {
        settings.mouse.isDragging = true;
        settings.mouse.lastPos.x = e.clientX;
        settings.mouse.lastPos.y = e.clientY;
    };

    const handleMouseUp = () => {
        settings.mouse.isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    animate();
}

init();
