import { mat4, vec3 } from 'https://cdn.skypack.dev/wgpu-matrix'
import { renderUniformsValues, renderUniformsViews } from './common.js'

export class Camera {
    constructor (canvasElement) {
        // Camera mode: 'orbit' or 'coolcal'
        this.mode = 'orbit'  // Start with orbit mode
        
        // Common properties
        this.isDragging = false
        this.prevX = 0
        this.prevY = 0
        this.fov = 0
        
        // Orbit camera properties (old camera)
        this.currentXtheta = 0
        this.currentYtheta = 0
        this.maxYTheta = 0
        this.minYTheta = 0
        this.orbitSensitivity = 0.005
        this.currentDistance = 0
        this.maxDistance = 0
        this.minDistance = 0
        this.target = []
        this.zoomRate = 0
        
        // Free camera properties (coolcal)
        this.yaw = 0  // Left-right rotation
        this.pitch = 0  // Up-down rotation
        this.mouseSensitivity = 0.005
        this.position = [0, 0, 0]
        this.forward = [0, 0, -1]
        this.right = [1, 0, 0]
        this.up = [0, 1, 0]
        this.moveSpeed = 80.0
        this.fastMoveSpeed = 320.0
        
        // Movement state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            fast: false
        }

        // Mouse controls (different behavior based on camera mode)
        canvasElement.addEventListener("mousedown", (event) => {
            event.preventDefault();
            console.log("Camera: mousedown detected, setting isDragging to true");
            this.isDragging = true;
            this.prevX = event.clientX;
            this.prevY = event.clientY;
            if (this.mode === 'coolcal') {
                canvasElement.requestPointerLock();
            }
        });

        canvasElement.addEventListener("wheel", (event) => {
            event.preventDefault();
            const scrollDelta = event.deltaY;
            
            if (this.mode === 'orbit') {
                // Orbit camera zoom
                this.currentDistance += ((scrollDelta > 0) ? 1 : -1) * this.zoomRate;
                if (this.currentDistance < this.minDistance) this.currentDistance = this.minDistance;
                this.recalculateView();
            } else {
                // Free camera forward/backward movement
                const moveDirection = vec3.scale(this.forward, -scrollDelta * 0.1);
                this.position = vec3.add(this.position, moveDirection);
                this.recalculateView();
            }
        }, { passive: false });

        canvasElement.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                console.log("Camera: mousemove detected while dragging");
                let deltaX, deltaY;

                if (this.mode === 'coolcal' && document.pointerLockElement === canvasElement) {
                    // Use movement deltas when pointer is locked
                    deltaX = event.movementX;
                    deltaY = event.movementY;
                } else {
                    // Fallback to position deltas
                    const currentX = event.clientX;
                    const currentY = event.clientY;
                    deltaX = this.prevX - currentX;
                    deltaY = this.prevY - currentY;
                    this.prevX = currentX;
                    this.prevY = currentY;
                }

                // Camera rotation - works regardless of simulation pause state
                if (this.mode === 'orbit') {
                    console.log(`Camera: orbit mode rotation - deltaX: ${deltaX}, deltaY: ${deltaY}`);
                    this.currentXtheta += this.orbitSensitivity * deltaX;
                    this.currentYtheta += this.orbitSensitivity * deltaY;
                    if (this.currentYtheta > this.maxYTheta) this.currentYtheta = this.maxYTheta;
                    if (this.currentYtheta < this.minYTheta) this.currentYtheta = this.minYTheta;
                    this.recalculateView();
                } else {
                    console.log(`Camera: free camera rotation - deltaX: ${deltaX}, deltaY: ${deltaY}`);
                    this.yaw -= deltaX * this.mouseSensitivity;
                    this.pitch -= deltaY * this.mouseSensitivity;
                    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
                    this.updateVectors();
                    this.recalculateView();
                }
            }
        });
        
        canvasElement.addEventListener("mouseup", (event) => {
            this.isDragging = false;
            if (this.mode === 'coolcal' && document.pointerLockElement === canvasElement) {
                document.exitPointerLock();
            }
        });

        // Prevent context menu from interfering with right-click drag
        canvasElement.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        // Keyboard controls for movement (only for coolcal mode)
        document.addEventListener("keydown", (event) => {
            // Only handle movement keys in coolcal mode
            if (this.mode !== 'coolcal') return;
            
            // Prevent conflicts with existing key handlers
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ShiftLeft', 'KeyC', 'ControlLeft'].includes(event.code)) {
                event.preventDefault();
            }
            
            switch(event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.forward = true;
                    console.log("Forward movement activated");
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.backward = true;
                    console.log("Backward movement activated");
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.right = true;  // A and ArrowLeft move right
                    console.log("Right movement activated");
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.left = true;   // D and ArrowRight move left
                    console.log("Left movement activated");
                    break;
                case 'Space':
                    this.keys.up = true;
                    console.log("Up movement activated");
                    break;
                case 'ShiftLeft':
                case 'KeyC':
                    this.keys.down = true;
                    console.log("Down movement activated");
                    break;
                case 'ControlLeft':
                    this.keys.fast = true;
                    console.log("Fast movement activated");
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch(event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.forward = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.backward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.right = false;  // A and ArrowLeft key release
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.left = false;   // D and ArrowRight key release
                    break;
                case 'Space':
                    this.keys.up = false;
                    break;
                case 'ShiftLeft':
                case 'KeyC':
                    this.keys.down = false;
                    break;
                case 'ControlLeft':
                    this.keys.fast = false;
                    break;
            }
        });
    }

    setCameraMode(mode) {
        this.mode = mode;
        console.log(`Camera mode switched to: ${mode}`);
    }

    reset(canvasElement, initDistance, target, fov, zoomRate) {
        this.fov = fov;
        this.target = target;
        this.zoomRate = zoomRate;
        
        // Setup orbit camera properties
        this.currentXtheta = Math.PI / 2;
        this.currentYtheta = -Math.PI / 12;
        this.maxYTheta = 0;
        this.minYTheta = -0.99 * Math.PI / 2;
        this.orbitSensitivity = 0.005;
        this.currentDistance = initDistance;
        this.minDistance = 0.1 * initDistance;
        
        // Calculate original camera position for both modes
        var mat = mat4.identity();
        mat4.translate(mat, target, mat);
        mat4.rotateY(mat, this.currentXtheta, mat);
        mat4.rotateX(mat, this.currentYtheta, mat);
        mat4.translate(mat, [0, 0, initDistance], mat);
        var originalPosition = mat4.multiply(mat, [0, 0, 0, 1]);
        
        // Set camera position
        this.position = [originalPosition[0], originalPosition[1], originalPosition[2]];
        
        // Setup free camera orientation
        const dirToTarget = vec3.normalize(vec3.subtract(target, this.position));
        this.yaw = Math.atan2(dirToTarget[0], dirToTarget[2]);
        this.pitch = Math.asin(-dirToTarget[1]) - Math.PI / 4;  // 45 degrees lower than original
        
        // Clamp pitch to prevent flipping
        this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
        this.updateVectors();

        const aspect = canvasElement.clientWidth / canvasElement.clientHeight;
        const projection = mat4.perspective(fov, aspect, 0.1, 50000);
        renderUniformsViews.projection_matrix.set(projection);
        renderUniformsViews.inv_projection_matrix.set(mat4.inverse(projection));
        this.recalculateView();
    }

    updateVectors() {
        // Calculate forward vector from yaw and pitch
        this.forward = [
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw)
        ]
        
        // Calculate right vector (cross product of world up and forward)
        this.right = vec3.normalize(vec3.cross([0, 1, 0], this.forward))
        
        // Calculate up vector (cross product of forward and right)
        this.up = vec3.normalize(vec3.cross(this.forward, this.right))
    }

    update(deltaTime) {
        // Only update movement for coolcal mode
        if (this.mode !== 'coolcal') return;
        
        // Calculate movement speed based on whether fast mode is enabled
        const currentSpeed = this.keys.fast ? this.fastMoveSpeed : this.moveSpeed
        const moveDistance = currentSpeed * deltaTime

        // Calculate movement direction based on pressed keys
        let moveDirection = [0, 0, 0]

        if (this.keys.forward) {
            moveDirection = vec3.add(moveDirection, vec3.scale(this.forward, moveDistance))
        }
        if (this.keys.backward) {
            moveDirection = vec3.add(moveDirection, vec3.scale(this.forward, -moveDistance))
        }
        if (this.keys.right) {
            moveDirection = vec3.add(moveDirection, vec3.scale(this.right, moveDistance))
        }
        if (this.keys.left) {
            moveDirection = vec3.add(moveDirection, vec3.scale(this.right, -moveDistance))
        }
        if (this.keys.up) {
            moveDirection = vec3.add(moveDirection, vec3.scale([0, 1, 0], moveDistance))
        }
        if (this.keys.down) {
            moveDirection = vec3.add(moveDirection, vec3.scale([0, 1, 0], -moveDistance))
        }

        // Apply movement
        this.position = vec3.add(this.position, moveDirection)
        
        // Update view matrix if we moved
        if (vec3.length(moveDirection) > 0) {
            this.recalculateView()
        }
    }

    recalculateView() {
        console.log(`Camera: recalculateView called - mode: ${this.mode}, theta: ${this.currentXtheta}, ${this.currentYtheta}, distance: ${this.currentDistance}`);
        let view;
        
        if (this.mode === 'orbit') {
            // Original orbit camera logic
            var mat = mat4.identity();
            mat4.translate(mat, this.target, mat);
            mat4.rotateY(mat, this.currentXtheta, mat);
            mat4.rotateX(mat, this.currentYtheta, mat);
            mat4.translate(mat, [0, 0, this.currentDistance], mat);
            var position = mat4.multiply(mat, [0, 0, 0, 1]);

            view = mat4.lookAt(
                [position[0], position[1], position[2]], // position
                this.target, // target
                [0, 1, 0], // up
            );
            console.log(`Camera: new position calculated: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}]`);
        } else {
            // Free camera (coolcal) logic
            const target = vec3.add(this.position, this.forward);
            view = mat4.lookAt(
                this.position, // camera position
                target,        // look at target
                this.up        // up vector
            );
        }

        renderUniformsViews.view_matrix.set(view);
        renderUniformsViews.inv_view_matrix.set(mat4.inverse(view));
        console.log("Camera: view matrix updated in renderUniformsViews");
    }
}
