// engine.js

class FluidSimulation {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.simWidth = window.innerWidth;
        this.simHeight = window.innerHeight;
        this.canvas.width = this.simWidth;
        this.canvas.height = this.simHeight;
        console.log(`Canvas/Sim Dimensions: ${this.simWidth} x ${this.simHeight}`);

        const targetCellCount = config.targetCellCount || 200 * 70;
        const estimatedH = Math.sqrt((this.simWidth * this.simHeight) / targetCellCount);
        this.h = Math.max(6, Math.round(estimatedH));
        this.numX = Math.floor(this.simWidth / this.h) + 1;
        this.numY = Math.floor(this.simHeight / this.h) + 1;
        this.numCells = this.numX * this.numY;
        this.fInvSpacing = 1.0 / this.h;

        this.particleRadius = config.particleRadius || this.h * 0.3;
        this.pRadius = this.particleRadius;

        this.dt = config.dt || 1.0 / 60.0;
        this.numPressureIters = config.numPressureIters || 20;
        this.numParticleIters = config.numParticleIters || 2;
        this.overRelaxation = config.overRelaxation || 1.9;
        this.flipRatio = config.flipRatio || 0.2;
        this.gravity = config.gravity || -9.81 * 20;

        this.compensateDrift = config.compensateDrift ?? true;
        this.particleRestDensity = config.particleRestDensity || 4.0;
        this.driftStiffness = config.driftStiffness || 0.1;

        this.separateParticles = config.separateParticles ?? true;
        this.particleRestDist = this.pRadius * (config.particleSeparationFactor || 2.5);
        this.particleRestDistSq = this.particleRestDist * this.particleRestDist;
        this.pGridSpacing = this.particleRestDist * 1.05;
        this.pInvSpacing = 1.0 / this.pGridSpacing;
        this.pNumX = Math.floor(this.simWidth / this.pGridSpacing) + 1;
        this.pNumY = Math.floor(this.simHeight / this.pGridSpacing) + 1;
        this.pNumCells = this.pNumX * this.pNumY;

        this.obstacles = [];
        this.isDrawingObstacle = false;
        this.obstacleStartX = 0;
        this.obstacleStartY = 0;
        this.currentObstacleRect = null;

        this.maxSpeedForColor = config.maxSpeedForColor || (this.h / this.dt * 10.0);
        console.log(`Max speed for color normalization: ${this.maxSpeedForColor.toFixed(1)} px/s`);

        this.enableSpawning = config.enableSpawning ?? false;
        this.spawners = Array.isArray(config.spawners) ? config.spawners : [];
        this.maxParticles = config.maxParticles || 15000;

        this.u = new Float32Array(this.numCells); this.v = new Float32Array(this.numCells);
        this.prevU = new Float32Array(this.numCells); this.prevV = new Float32Array(this.numCells);
        this.p = new Float32Array(this.numCells); this.s = new Float32Array(this.numCells);
        this.cellType = new Int32Array(this.numCells);
        this.particleDensity = new Float32Array(this.numCells);
        this.weightsU = new Float32Array(this.numCells);
        this.weightsV = new Float32Array(this.numCells);

        this.particles = [];
        this.numParticles = 0;


        this.particleGrid = Array.from({ length: this.pNumCells }, () => []);

        console.log(`Fluid Grid: ${this.numX} x ${this.numY} (${this.numCells} cells), h=${this.h.toFixed(2)}px`);
        console.log(`Push Grid: ${this.pNumX} x ${this.pNumY}, spacing=${this.pGridSpacing.toFixed(2)}px`);
        console.log(`Max Particles: ${this.maxParticles}`);
        console.log(`Loaded ${this.spawners.length} spawners.`);

        this._initializeGrid();
    }

    _initializeGrid() {
        this.u.fill(0); this.v.fill(0); this.p.fill(0); this.particleDensity.fill(0);
        this.prevU.fill(0); this.prevV.fill(0); this.weightsU.fill(0); this.weightsV.fill(0);
        for (let i = 0; i < this.numX; i++) {
            for (let j = 0; j < this.numY; j++) {
                const idx = this.gridToIdx(i, j);
                this.s[idx] = 1.0; this.cellType[idx] = 2;
                if (i === 0 || i === this.numX - 1 || j === 0 || j === this.numY - 1) {
                    this.s[idx] = 0.0; this.cellType[idx] = 0;
                }
            }
        }
        console.log("Grid boundaries initialized.");
     }
    clamp(value, min, max) { return Math.max(min, Math.min(value, max)); }
    gridToIdx(x, y) { x = this.clamp(x, 0, this.numX - 1); y = this.clamp(y, 0, this.numY - 1); return x + y * this.numX; }
    pGridToIdx(x, y) {  x = this.clamp(x, 0, this.pNumX - 1); y = this.clamp(y, 0, this.pNumY - 1); return x + y * this.pNumX; }
    buildParticleGrid() {
        for (let i = 0; i < this.particleGrid.length; i++) { if (this.particleGrid[i].length > 0) { this.particleGrid[i].length = 0; } }
        for (let i = 0; i < this.numParticles; i++) {
            const p = this.particles[i];
            const cx = Math.floor(p.x * this.pInvSpacing); const cy = Math.floor(p.y * this.pInvSpacing);
            const idx = this.pGridToIdx(cx, cy);
            if (idx >= 0 && idx < this.particleGrid.length && this.particleGrid[idx]) { this.particleGrid[idx].push(i); }
        }
     }
    spawnParticles() {
        if (!this.enableSpawning || this.spawners.length === 0) {
            return;
        }

        for (const spawner of this.spawners) {
            if (!spawner || typeof spawner.rate !== 'number' || spawner.rate <= 0 ||
                !spawner.position || !spawner.velocity) {
                continue;
            }

            const particlesToSpawn = spawner.rate;
            const spawnPosX = spawner.position.x;
            const spawnPosY = spawner.position.y;
            const spawnVelX = spawner.velocity.x;
            const spawnVelY = spawner.velocity.y;
            const jitter = spawner.jitter || 0;
            for (let i = 0; i < particlesToSpawn; i++) {
                if (this.numParticles >= this.maxParticles) {

                    return;
                }

                const jitterX = (Math.random() - 0.5) * jitter;
                const jitterY = (Math.random() - 0.5) * jitter;
                const px = spawnPosX + jitterX;
                const py = spawnPosY + jitterY;

                const spawnX = this.clamp(px, this.h, this.simWidth - this.h);
                const spawnY = this.clamp(py, this.h, this.simHeight - this.h);

                this.particles.push({
                    x: spawnX,
                    y: spawnY,
                    u: spawnVelX + (Math.random() - 0.5) * 0.1 * spawnVelX,
                    v: spawnVelY + (Math.random() - 0.5) * 0.1 * spawnVelY,

                });
                this.numParticles++;
            }
        }
    }

    integrateParticles() {
        const gravityDt = this.dt * this.gravity;
        for (let i = 0; i < this.numParticles; i++) {
            const p = this.particles[i]; p.v += gravityDt; p.x += p.u * this.dt; p.y += p.v * this.dt;
        }
    }

    pushParticlesApart() {
        for (let iter = 0; iter < this.numParticleIters; iter++) {
            this.buildParticleGrid();
            for (let i = 0; i < this.numParticles; i++) {
                const p1 = this.particles[i]; const p1x = p1.x; const p1y = p1.y;
                const cx = Math.floor(p1x * this.pInvSpacing); const cy = Math.floor(p1y * this.pInvSpacing);
                for (let nx = cx - 1; nx <= cx + 1; nx++) {
                    for (let ny = cy - 1; ny <= cy + 1; ny++) {
                        const gridIdx = this.pGridToIdx(nx, ny);
                         if (gridIdx < 0 || gridIdx >= this.particleGrid.length || !this.particleGrid[gridIdx]) continue;
                        const cellParticles = this.particleGrid[gridIdx];
                        for (const p2Index of cellParticles) {
                            if (i <= p2Index) continue; const p2 = this.particles[p2Index];
                            const dx = p1x - p2.x; const dy = p1y - p2.y; const distSq = dx * dx + dy * dy;
                            if (distSq < this.particleRestDistSq && distSq > 1e-9) {
                                const dist = Math.sqrt(distSq); const overlapFactor = 1.0 - dist / this.particleRestDist;
                                const push = overlapFactor * this.particleRestDist * 0.5; const nx_dir = dx / dist; const ny_dir = dy / dist;
                                const pushStrength = 0.6;
                                p1.x += nx_dir * push * pushStrength; p1.y += ny_dir * push * pushStrength;
                                p2.x -= nx_dir * push * pushStrength; p2.y -= ny_dir * push * pushStrength;
                            } } } } } }
     }

    handleCollisions() { /* ... unchanged ... */
        const minX = this.h + this.pRadius; const maxX = this.simWidth - this.h - this.pRadius;
        const minY = this.h + this.pRadius; const maxY = this.simHeight - this.h - this.pRadius;
        const restitution = 0.1;
        for (let i = 0; i < this.numParticles; i++) {
            const p = this.particles[i]; let x = p.x; let y = p.y; let px_u = p.u; let px_v = p.v;
            if (x < minX) { x = minX; px_u = Math.max(0.0, px_u * -restitution); }
            if (x > maxX) { x = maxX; px_u = Math.min(0.0, px_u * -restitution); }
            if (y < minY) { y = minY; px_v = Math.max(0.0, px_v * -restitution); }
            if (y > maxY) { y = maxY; px_v = Math.min(0.0, px_v * -restitution); }
            for (const rect of this.obstacles) {
                const rectLeft = rect.x; const rectRight = rect.x + rect.width;
                const rectBottom = rect.y; const rectTop = rect.y + rect.height;
                const overlapX = (this.pRadius + rect.width / 2) - Math.abs(x - (rect.x + rect.width / 2));
                const overlapY = (this.pRadius + rect.height / 2) - Math.abs(y - (rect.y + rect.height / 2));
                if (overlapX > 0 && overlapY > 0) {
                    if (overlapX < overlapY) { const sign = Math.sign(x - (rect.x + rect.width / 2)); x += sign * overlapX; px_u *= -restitution; }
                    else { const sign = Math.sign(y - (rect.y + rect.height / 2)); y += sign * overlapY; px_v *= -restitution; }
                } } p.x = x; p.y = y; p.u = px_u; p.v = px_v;
        }
     }

    updateParticleDensity() { /* ... unchanged ... */
        this.particleDensity.fill(0.0);
        const h = this.h; const h2 = 0.5 * h; const invSpacing = this.fInvSpacing;
        const numX = this.numX; const numY = this.numY; const numCells = this.numCells;
        const simWidth = this.simWidth; const simHeight = this.simHeight;
        for (let i = 0; i < this.numParticles; i++) {
            let px = this.particles[i].x; let py = this.particles[i].y;
            px = this.clamp(px, h, simWidth - h); py = this.clamp(py, h, simHeight - h);
            let x0 = Math.floor((px - h2) * invSpacing); let tx = ((px - h2) * invSpacing) - x0; let x1 = Math.min(x0 + 1, numX - 1);
            let y0 = Math.floor((py - h2) * invSpacing); let ty = ((py - h2) * invSpacing) - y0; let y1 = Math.min(y0 + 1, numY - 1);
            const sx = 1.0 - tx; const sy = 1.0 - ty; const w = [sx * sy, tx * sy, tx * ty, sx * ty];
            const idx = [ this.gridToIdx(x0, y0), this.gridToIdx(x1, y0), this.gridToIdx(x1, y1), this.gridToIdx(x0, y1) ];
            for (let k = 0; k < 4; k++) { if (idx[k] >= 0 && idx[k] < numCells) { this.particleDensity[idx[k]] += w[k]; } }
        }
     }

    transferVelocityToGrid() { /* ... unchanged ... */
        this.u.fill(0.0); this.v.fill(0.0); this.weightsU.fill(0.0); this.weightsV.fill(0.0);
        const invSpacing = this.fInvSpacing; const numX = this.numX; const numY = this.numY; const numCells = this.numCells;
        for (let i = 0; i < this.numParticles; i++) {
            const p = this.particles[i]; const px = p.x; const py = p.y; const pu = p.u; const pv = p.v;
            let ixU = Math.floor(px * invSpacing); let iyU = Math.floor((py * invSpacing) - 0.5); let fxU = px * invSpacing - ixU; let fyU = (py * invSpacing) - 0.5 - iyU;
            ixU = this.clamp(ixU, 0, numX - 1); iyU = this.clamp(iyU, 0, numY - 2);
            const wU = [ (1 - fxU) * (1 - fyU), fxU * (1 - fyU), (1 - fxU) * fyU, fxU * fyU ];
            const idxU = [ this.gridToIdx(ixU, iyU), this.gridToIdx(ixU + 1, iyU), this.gridToIdx(ixU, iyU + 1), this.gridToIdx(ixU + 1, iyU + 1) ];
            for (let k = 0; k < 4; k++) { const u_idx = idxU[k]; if (u_idx >= 0 && u_idx < numCells) { this.u[u_idx] += pu * wU[k]; this.weightsU[u_idx] += wU[k]; } }
            let ixV = Math.floor((px * invSpacing) - 0.5); let iyV = Math.floor(py * invSpacing); let fxV = (px * invSpacing) - 0.5 - ixV; let fyV = py * invSpacing - iyV;
            ixV = this.clamp(ixV, 0, numX - 2); iyV = this.clamp(iyV, 0, numY - 1);
            const wV = [ (1 - fxV) * (1 - fyV), fxV * (1 - fyV), (1 - fxV) * fyV, fxV * fyV ];
            const idxV = [ this.gridToIdx(ixV, iyV), this.gridToIdx(ixV + 1, iyV), this.gridToIdx(ixV, iyV + 1), this.gridToIdx(ixV + 1, iyV + 1) ];
            for (let k = 0; k < 4; k++) { const v_idx = idxV[k]; if (v_idx >= 0 && v_idx < numCells) { this.v[v_idx] += pv * wV[k]; this.weightsV[v_idx] += wV[k]; } }
        }
        for (let i = 0; i < numCells; i++) { if (this.weightsU[i] > 1e-9) { this.u[i] /= this.weightsU[i]; } if (this.weightsV[i] > 1e-9) { this.v[i] /= this.weightsV[i]; } }
        this.prevU.set(this.u); this.prevV.set(this.v);
     }

    _updateSolidCells() { /* ... unchanged ... */
        const s = this.s; const numX = this.numX; const numY = this.numY; const invSpacing = this.fInvSpacing;
        for (let i = 1; i < numX - 1; i++) { for (let j = 1; j < numY - 1; j++) { s[this.gridToIdx(i, j)] = 1.0; } }
        for (const rect of this.obstacles) {
            const minCellX = Math.max(1, Math.floor(rect.x * invSpacing));
            const maxCellX = Math.min(numX - 2, Math.floor((rect.x + rect.width) * invSpacing));
            const minCellY = Math.max(1, Math.floor(rect.y * invSpacing));
            const maxCellY = Math.min(numY - 2, Math.floor((rect.y + rect.height) * invSpacing));
            for (let i = minCellX; i <= maxCellX; i++) { for (let j = minCellY; j <= maxCellY; j++) { if (i > 0 && i < numX - 1 && j > 0 && j < numY - 1) { s[this.gridToIdx(i, j)] = 0.0; } } }
        }
     }

    solveIncompressibility() { /* ... unchanged ... */
        const numX = this.numX; const numY = this.numY; const s = this.s; const u = this.u; const v = this.v; const p = this.p;
        const cellType = this.cellType; const particleDensity = this.particleDensity; const particleRestDensity = this.particleRestDensity;
        const compensateDrift = this.compensateDrift; const driftStiffness = this.driftStiffness; const overRelaxation = this.overRelaxation;
        const invSpacing = this.fInvSpacing;
        cellType.fill(2); for (let i = 0; i < this.numCells; i++) { if (s[i] === 0) cellType[i] = 0; }
        for (let i = 0; i < this.numParticles; i++) {
            const px = this.particles[i].x; const py = this.particles[i].y;
            const cx = Math.floor(px * invSpacing); const cy = Math.floor(py * invSpacing);
            if (cx > 0 && cx < numX - 1 && cy > 0 && cy < numY - 1) { const idx = this.gridToIdx(cx, cy); if (s[idx] !== 0) cellType[idx] = 1; }
        }
        p.fill(0.0);
        for (let iter = 0; iter < this.numPressureIters; iter++) {
            for (let i = 1; i < numX - 1; i++) { for (let j = 1; j < numY - 1; j++) {
                const idx = this.gridToIdx(i, j); if (cellType[idx] !== 1) continue;
                const idxL = this.gridToIdx(i - 1, j); const idxR = this.gridToIdx(i + 1, j);
                const idxB = this.gridToIdx(i, j - 1); const idxT = this.gridToIdx(i, j + 1);
                const scaleL = s[idxL]; const scaleR = s[idxR]; const scaleB = s[idxB]; const scaleT = s[idxT];
                const scaleSum = scaleL + scaleR + scaleB + scaleT; if (scaleSum < 1e-6) continue;
                let divergence = u[idxR] - u[idx] + v[idxT] - v[idx];
                if (compensateDrift && particleRestDensity > 0.0) { const density = particleDensity[idx]; const compression = density - particleRestDensity; if (compression > 0.0) { divergence -= driftStiffness * compression; } }
                const pressureUpdate = -divergence * overRelaxation / scaleSum;
                u[idx] -= pressureUpdate * scaleL; u[idxR] += pressureUpdate * scaleR; v[idx] -= pressureUpdate * scaleB; v[idxT] += pressureUpdate * scaleT;
            } } }
     }

    transferVelocityBackToParticles() { /* ... unchanged ... */
        const invSpacing = this.fInvSpacing; const numX = this.numX; const numY = this.numY; const numCells = this.numCells;
        const u = this.u; const v = this.v; const prevU = this.prevU; const prevV = this.prevV; const flipRatio = this.flipRatio;
        for (let i = 0; i < this.numParticles; i++) {
            const p = this.particles[i]; const px = p.x; const py = p.y;
            let ixU = Math.floor(px * invSpacing); let iyU = Math.floor((py * invSpacing) - 0.5); let fxU = px * invSpacing - ixU; let fyU = (py * invSpacing) - 0.5 - iyU;
            ixU = this.clamp(ixU, 0, numX - 1); iyU = this.clamp(iyU, 0, numY - 2);
            const wU = [ (1-fxU)*(1-fyU), fxU*(1-fyU), (1-fxU)*fyU, fxU*fyU ];
            const idxU = [ this.gridToIdx(ixU, iyU), this.gridToIdx(ixU + 1, iyU), this.gridToIdx(ixU, iyU + 1), this.gridToIdx(ixU + 1, iyU + 1) ];
            let gridU_new = 0.0, gridU_old = 0.0; for (let k = 0; k < 4; k++) { const u_idx = idxU[k]; if (u_idx >= 0 && u_idx < numCells) { gridU_new += u[u_idx] * wU[k]; gridU_old += prevU[u_idx] * wU[k]; } }
            let ixV = Math.floor((px * invSpacing) - 0.5); let iyV = Math.floor(py * invSpacing); let fxV = (px * invSpacing) - 0.5 - ixV; let fyV = py * invSpacing - iyV;
            ixV = this.clamp(ixV, 0, numX - 2); iyV = this.clamp(iyV, 0, numY - 1);
            const wV = [ (1-fxV)*(1-fyV), fxV*(1-fyV), (1-fxV)*fyV, fxV*fyV ];
            const idxV = [ this.gridToIdx(ixV, iyV), this.gridToIdx(ixV + 1, iyV), this.gridToIdx(ixV, iyV + 1), this.gridToIdx(ixV + 1, iyV + 1) ];
            let gridV_new = 0.0, gridV_old = 0.0; for (let k = 0; k < 4; k++) { const v_idx = idxV[k]; if (v_idx >= 0 && v_idx < numCells) { gridV_new += v[v_idx] * wV[k]; gridV_old += prevV[v_idx] * wV[k]; } }
            const picU = gridU_new; const picV = gridV_new; const flipU = p.u + (gridU_new - gridU_old); const flipV = p.v + (gridV_new - gridV_old);
            p.u = (1.0 - flipRatio) * picU + flipRatio * flipU; p.v = (1.0 - flipRatio) * picV + flipRatio * flipV;
        }
     }

    draw() { /* ... unchanged ... */
        this.ctx.clearRect(0, 0, this.simWidth, this.simHeight); this.ctx.fillStyle = '#050508'; this.ctx.fillRect(0, 0, this.simWidth, this.simHeight);
        const r = this.particleRadius; const flippedHeight = this.simHeight;
        if (!(r < 0.5 && this.numParticles > 1000)) {
            for (let i = 0; i < this.numParticles; i++) {
                const p = this.particles[i]; const speed = Math.sqrt(p.u * p.u + p.v * p.v); const normSpeed = this.clamp(speed / this.maxSpeedForColor, 0.0, 1.0);
                const baseR = 50; const baseG = 100; const baseB = 200; const rangeR = 205; const rangeG = 155; const rangeB = 55;
                const factor = 1.0 - normSpeed;
                const red = Math.round(baseR + rangeR * factor * factor); const green = Math.round(baseG + rangeG * factor * factor); const blue = Math.round(baseB + rangeB * factor);
                this.ctx.fillStyle = `rgb(${this.clamp(red,0,255)},${this.clamp(green,0,255)},${this.clamp(blue,0,255)})`;
                this.ctx.beginPath(); const drawY = flippedHeight - p.y;
                if (r < 1.5) { this.ctx.rect(p.x - r, drawY - r, r * 2, r * 2); } else { this.ctx.arc(p.x, drawY, r, 0, 2 * Math.PI); } this.ctx.fill();
            } }
        this.ctx.fillStyle = '#888888';
        for (const rect of this.obstacles) { const canvasY = flippedHeight - (rect.y + rect.height); this.ctx.fillRect(rect.x, canvasY, rect.width, rect.height); }
        if (this.isDrawingObstacle && this.currentObstacleRect) {
             this.ctx.strokeStyle = '#FFFFFF'; this.ctx.lineWidth = 1;
             let drawX = this.currentObstacleRect.x; let drawYsim = this.currentObstacleRect.y; let drawW = this.currentObstacleRect.width; let drawH = this.currentObstacleRect.height;
             if (drawW < 0) { drawX += drawW; drawW = -drawW; } if (drawH < 0) { drawYsim += drawH; drawH = -drawH; }
             const canvasY = flippedHeight - (drawYsim + drawH); this.ctx.strokeRect(drawX, canvasY, drawW, drawH);
        }
    }

    // --- Main Simulation Loop ---
    simulationStep() {
        // Spawning is now handled by the updated spawnParticles method
        this.spawnParticles(); // Call the method that iterates through spawners

        this.integrateParticles();
        if (this.separateParticles) { this.pushParticlesApart(); }
        this.handleCollisions();
        this.transferVelocityToGrid();
        if (this.numParticles > 0) {
            this._updateSolidCells();
            this.updateParticleDensity();
            this.solveIncompressibility();
        } else {
            this.u.fill(0); this.v.fill(0); this.p.fill(0);
             this._updateSolidCells();
        }
        this.transferVelocityBackToParticles();
        this.draw();
        requestAnimationFrame(this.simulationStep.bind(this));
    }

    // --- Event Handling (Unchanged for mouse/touch obstacle drawing) ---
    _handleMouseDown(e) { /* ... unchanged ... */
        const rect = this.canvas.getBoundingClientRect(); const rawMouseX = e.clientX - rect.left; const rawMouseY = e.clientY - rect.top; const simMouseY = this.simHeight - rawMouseY;
        this.isDrawingObstacle = true; this.obstacleStartX = rawMouseX; this.obstacleStartY = simMouseY;
        this.currentObstacleRect = { x: this.obstacleStartX, y: this.obstacleStartY, width: 0, height: 0 }; this.canvas.style.cursor = 'crosshair';
     }
    _handleMouseMove(e) { /* ... unchanged ... */
        if (this.isDrawingObstacle) {
            const rect = this.canvas.getBoundingClientRect(); const rawMouseX = e.clientX - rect.left; const rawMouseY = e.clientY - rect.top; const simMouseY = this.simHeight - rawMouseY;
            this.currentObstacleRect.width = rawMouseX - this.obstacleStartX; this.currentObstacleRect.height = simMouseY - this.obstacleStartY;
        }
     }
    _handleMouseUp(e) { /* ... unchanged ... */
        if (this.isDrawingObstacle) {
            this.isDrawingObstacle = false; this.canvas.style.cursor = 'grab';
            if (this.currentObstacleRect) {
                let finalX = this.currentObstacleRect.x; let finalY = this.currentObstacleRect.y; let finalW = this.currentObstacleRect.width; let finalH = this.currentObstacleRect.height;
                if (finalW < 0) { finalX += finalW; finalW = -finalW; } if (finalH < 0) { finalY += finalH; finalH = -finalH; }
                const minSize = this.h * 0.5;
                if (finalW > minSize && finalH > minSize) {
                    finalX = this.clamp(finalX, 0, this.simWidth - finalW); finalY = this.clamp(finalY, 0, this.simHeight - finalH);
                    console.log(`Adding obstacle: x:${finalX.toFixed(1)}, y:${finalY.toFixed(1)}, w:${finalW.toFixed(1)}, h:${finalH.toFixed(1)}`);
                    this.obstacles.push({ x: finalX, y: finalY, width: finalW, height: finalH }); this._updateSolidCells();
                } else { console.log("Ignoring tiny obstacle."); }
            } this.currentObstacleRect = null;
        }
     }
    _handleMouseLeave() { /* ... unchanged ... */ if (this.isDrawingObstacle) { this.isDrawingObstacle = false; this.currentObstacleRect = null; this.canvas.style.cursor = 'grab'; console.log("Obstacle drawing cancelled (mouse left)."); } }
    _handleTouchStart(e) { /* ... unchanged ... */ e.preventDefault(); if (e.touches.length === 1) { const touch = e.touches[0]; const rect = this.canvas.getBoundingClientRect(); const rawTouchX = touch.clientX - rect.left; const rawTouchY = touch.clientY - rect.top; const simTouchY = this.simHeight - rawTouchY; this.isDrawingObstacle = true; this.obstacleStartX = rawTouchX; this.obstacleStartY = simTouchY; this.currentObstacleRect = { x: this.obstacleStartX, y: this.obstacleStartY, width: 0, height: 0 }; } }
    _handleTouchMove(e) { /* ... unchanged ... */ e.preventDefault(); if (this.isDrawingObstacle && e.touches.length === 1) { const touch = e.touches[0]; const rect = this.canvas.getBoundingClientRect(); const rawTouchX = touch.clientX - rect.left; const rawTouchY = touch.clientY - rect.top; const simTouchY = this.simHeight - rawTouchY; this.currentObstacleRect.width = rawTouchX - this.obstacleStartX; this.currentObstacleRect.height = simTouchY - this.obstacleStartY; } }
    _handleTouchEnd(e) { /* ... unchanged ... */ if (this.isDrawingObstacle && e.changedTouches.length > 0) { e.preventDefault(); this._handleMouseUp(null); } }

    start() { /* ... unchanged ... */
        this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
        this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this._handleTouchEnd.bind(this), { passive: false });
        requestAnimationFrame(this.simulationStep.bind(this));
        console.log("Simulation started. Click and drag to draw obstacles.");
    }
}