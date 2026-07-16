# 3D Fluid Simulator

The volumetric fluid simulator assets now live in `media/post10/`.

Open the live demo at `media/post10/index.html`.

The default scene starts with 400,000 GPU-simulated particles rendered as shaded spheres in the original velocity-color palette. It runs at 1.5× speed, including piston motion, pulses, and GPU solver substeps. A ray-traced-style reflective orb adds depth behind the simulation. For smoother motion, it renders every second particle by default while retaining the complete simulation; change **Render Every Nth** in the Rendering panel to trade performance for density. **Auto Render Density** is on by default and temporarily lowers only visual density if the frame rate drops. The renderer reads directly from the simulation buffer, avoiding a second per-frame particle copy. The piston starts enabled, while the GPU solver keeps running until you manually pause it. Use the control panel to change the particle count, trigger a turbulence pulse, pause the fluid, or enable the piston. Click the fluid for a localized splash and drag to orbit the camera.
