// setup.js
function getSimulationSetup() {
    const simWidth = window.innerWidth;
    const simHeight = window.innerHeight;
    const targetCellCount = 200 * 70;
    const estimatedH = Math.sqrt((simWidth * simHeight) / targetCellCount);
    const h = Math.max(6, Math.round(estimatedH));

    const spawners = [
        {
            id: 'left_shooter',
            position: { x: h * 5, y: simHeight - h * 5 },
            velocity: { x: h * 40.0, y: -h * 10.0 },
            rate: 15,
            jitter: h * 0.5,
        },
        {
            id: 'right_shooter',
            position: { x: simWidth - h * 5, y: simHeight - h * 5 },
            velocity: { x: -h * 40.0, y: -h * 10.0 },
            rate: 15,
            jitter: h * 0.5,
        }
    ];

    const config = {
        numPressureIters: 20,
        numParticleIters: 2,
        maxParticles: 20000,

        gravity: -9.81 * 0,
        flipRatio: 0.2,
        overRelaxation: 1.9,

        spawners: spawners,
        enableSpawning: true,

        particleSeparationFactor: 2.5,

        maxSpeedForColor: h / (1 / 60.0) * 2.0,

        compensateDrift: true,
        particleRestDensity: 4.0,
        driftStiffness: 0.1
    };
    return config;
}