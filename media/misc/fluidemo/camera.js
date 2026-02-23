import { mat4, vec3 } from 'https://unpkg.com/wgpu-matrix@3.4.0/dist/3.x/wgpu-matrix.module.js'
import { renderUniformsValues, renderUniformsViews } from './common.js'

export class Camera {
    constructor (canvasElement) {
        this.mode = 'orbit'

        this.isDragging = false
        this.prevX = 0
        this.prevY = 0
        this.fov = 0

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

        this.yaw = 0
        this.pitch = 0
        this.mouseSensitivity = 0.005
        this.position = [0, 0, 0]
        this.forward = [0, 0, -1]
        this.right = [1, 0, 0]
        this.up = [0, 1, 0]
        this.moveSpeed = 80.0
        this.fastMoveSpeed = 320.0
        this.dirty = true

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            fast: false
        }

        canvasElement.addEventListener("mousedown", (event) => {
            event.preventDefault();
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
                this.currentDistance += ((scrollDelta > 0) ? 1 : -1) * this.zoomRate;
                if (this.currentDistance < this.minDistance) this.currentDistance = this.minDistance;
                this.recalculateView();
            } else {
                const moveDirection = vec3.scale(this.forward, -scrollDelta * 0.1);
                this.position = vec3.add(this.position, moveDirection);
                this.recalculateView();
            }
        }, { passive: false });

        canvasElement.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                let deltaX, deltaY;

                if (this.mode === 'coolcal' && document.pointerLockElement === canvasElement) {
                    deltaX = event.movementX;
                    deltaY = event.movementY;
                } else {
                    const currentX = event.clientX;
                    const currentY = event.clientY;
                    deltaX = this.prevX - currentX;
                    deltaY = this.prevY - currentY;
                    this.prevX = currentX;
                    this.prevY = currentY;
                }

                if (this.mode === 'orbit') {
                    this.currentXtheta += this.orbitSensitivity * deltaX;
                    this.currentYtheta += this.orbitSensitivity * deltaY;
                    if (this.currentYtheta > this.maxYTheta) this.currentYtheta = this.maxYTheta;
                    if (this.currentYtheta < this.minYTheta) this.currentYtheta = this.minYTheta;
                    this.recalculateView();
                } else {
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

        canvasElement.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        document.addEventListener("keydown", (event) => {
            if (this.mode !== 'coolcal') return;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ShiftLeft', 'KeyC', 'ControlLeft'].includes(event.code)) {
                event.preventDefault();
            }

            switch(event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.forward = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.backward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.right = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.left = true;
                    break;
                case 'Space':
                    this.keys.up = true;
                    break;
                case 'ShiftLeft':
                case 'KeyC':
                    this.keys.down = true;
                    break;
                case 'ControlLeft':
                    this.keys.fast = true;
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
                    this.keys.right = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.left = false;
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
    }

    reset(canvasElement, initDistance, target, fov, zoomRate) {
        this.fov = fov;
        this.target = target;
        this.zoomRate = zoomRate;

        this.currentXtheta = Math.PI / 2;
        this.currentYtheta = -Math.PI / 12;
        this.maxYTheta = 0;
        this.minYTheta = -0.99 * Math.PI / 2;
        this.orbitSensitivity = 0.005;
        this.currentDistance = initDistance;
        this.minDistance = 0.1 * initDistance;

        var mat = mat4.identity();
        mat4.translate(mat, target, mat);
        mat4.rotateY(mat, this.currentXtheta, mat);
        mat4.rotateX(mat, this.currentYtheta, mat);
        mat4.translate(mat, [0, 0, initDistance], mat);
        var originalPosition = mat4.multiply(mat, [0, 0, 0, 1]);

        this.position = [originalPosition[0], originalPosition[1], originalPosition[2]];

        const dirToTarget = vec3.normalize(vec3.subtract(target, this.position));
        this.yaw = Math.atan2(dirToTarget[0], dirToTarget[2]);
        this.pitch = Math.asin(-dirToTarget[1]) - Math.PI / 4;

        this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
        this.updateVectors();

        const aspect = canvasElement.clientWidth / canvasElement.clientHeight;
        const projection = mat4.perspective(fov, aspect, 0.1, 50000);
        renderUniformsViews.projection_matrix.set(projection);
        renderUniformsViews.inv_projection_matrix.set(mat4.inverse(projection));
        this.recalculateView();
    }

    updateVectors() {
        this.forward = [
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw)
        ]

        this.right = vec3.normalize(vec3.cross([0, 1, 0], this.forward))

        this.up = vec3.normalize(vec3.cross(this.forward, this.right))
    }

    update(deltaTime) {
        if (this.mode !== 'coolcal') return;

        const currentSpeed = this.keys.fast ? this.fastMoveSpeed : this.moveSpeed
        const moveDistance = currentSpeed * deltaTime

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

        this.position = vec3.add(this.position, moveDirection)

        if (vec3.length(moveDirection) > 0) {
            this.recalculateView()
        }
    }

    consumeDirty() {
        const wasDirty = this.dirty;
        this.dirty = false;
        return wasDirty;
    }

    recalculateView() {
        let view;

        if (this.mode === 'orbit') {
            var mat = mat4.identity();
            mat4.translate(mat, this.target, mat);
            mat4.rotateY(mat, this.currentXtheta, mat);
            mat4.rotateX(mat, this.currentYtheta, mat);
            mat4.translate(mat, [0, 0, this.currentDistance], mat);
            var position = mat4.multiply(mat, [0, 0, 0, 1]);

            view = mat4.lookAt(
                [position[0], position[1], position[2]],
                this.target,
                [0, 1, 0],
            );
        } else {
            const target = vec3.add(this.position, this.forward);
            view = mat4.lookAt(
                this.position,
                target,
                this.up
            );
        }

        renderUniformsViews.view_matrix.set(view);
        renderUniformsViews.inv_view_matrix.set(mat4.inverse(view));
        this.dirty = true;
    }
}
