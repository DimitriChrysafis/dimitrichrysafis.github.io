# Physics-Based Particle Simulations: A Deep Dive
### SRC: [https://github.com/DimitriChrysafis/BallDrawer](https://github.com/DimitriChrysafis/BallDrawer)

## Two Verlet Integration Demonstrations

<video width="1000" controls autoplay muted>  
  <source src="../media/post7/initial.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>

<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
  <iframe 
    width="100%" 
    height="500" 
    src="https://www.youtube.com/embed/Gz6gZwLvjaw" 
    frameborder="0" 
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen> 
  </iframe> 
</div>

## Key Simulation Principles

Before each video is recorded, a complete physics simulation runs with predefined parameters. All particles begin as uniform red balls, which later map to colors from a target image. This document provides a comprehensive explanation of the mathematical foundations and implementation details powering these simulations.

---

## 1. The Mathematical Base: Verlet Integration

Verlet integration forms the core of the physics engine used in this simulation. Its stability and efficiency make it an ideal choice for particle systems.

### 1.1 Classical Verlet Integration Formulation

The standard Verlet integration equation updates a particle's position based strictly on its current position, previous position, and acceleration. This relationship is defined as:

$$x(t+\Delta t) = 2x(t) - x(t-\Delta t) + a(t)\Delta t^2$$

In this equation, $x(t)$ represents the current position at time $t$, while $x(t-\Delta t)$ refers to the position at the previous time step. The term $a(t)$ denotes the acceleration vector acting on the particle, and $\Delta t$ represents the discrete time step of the simulation.

The fundamental advantage of this formula is that velocity is implicit in the term $(x(t) - x(t-\Delta t))$. Consequently, there is no need to explicitly store or update velocity vectors, reducing memory overhead and complexity.

### 1.2 Derivation and Stability

To understand why Verlet integration works so effectively, we can derive it from Taylor series expansions of the position function. For a position function $x(t)$ with continuous derivatives, the expansions around time $t$ provide the forward and backward approximations.

The forward expansion is given by:

$$x(t+\Delta t) = x(t) + v(t)\Delta t + \frac{1}{2}a(t)\Delta t^2 + \frac{1}{6}\dddot{x}(t)\Delta t^3 + O(\Delta t^4)$$

Correspondingly, the backward expansion is:

$$x(t-\Delta t) = x(t) - v(t)\Delta t + \frac{1}{2}a(t)\Delta t^2 - \frac{1}{6}\dddot{x}(t)\Delta t^3 + O(\Delta t^4)$$

By adding these two equations, the first-order terms (velocity) and third-order terms cancel out. This leaves us with an error of order $O(\Delta t^4)$, which is significantly more accurate than many standard integrators. The summation results in:

$$x(t+\Delta t) + x(t-\Delta t) = 2x(t) + a(t)\Delta t^2 + O(\Delta t^4)$$

Dropping the error term yields the standard Verlet formula.

### 1.3 High-Velocity Stability

Simulations dealing with numerous fast-moving objects often encounter stability issues. A robust solution involves sub-stepping the physics updates. We define a sub-step time interval $\Delta t_{sub}$ as:

$$\Delta t_{sub} = \frac{\Delta t}{N_{substeps}}$$

For a simulation running at 60Hz ($\Delta t = \frac{1}{60}$) with 8 substeps, the effective time step becomes approximately $0.00208$ seconds.

Each frame, the system performs $N_{substeps}$ iterations of the physics update. This effectively increases the temporal resolution during collision handling, preventing tunneling—where particles pass through barriers between frames—and improving the accuracy of collision responses. The total acceleration applied per substep is scaled accordingly:

$$a_{sub} = a \cdot \frac{\Delta t_{sub}^2}{\Delta t^2} = a \cdot \frac{1}{N_{substeps}^2}$$

The symplectic nature of Verlet integration preserves energy better than explicit Euler integration, which tends to artificially introduce energy into the system over time.

---

## 2. Collision Detection and Response

### 2.1 Pairwise Collision Detection

Effective collision detection relies on geometric relationships between particles. Consider two particles with positions $\mathbf{p}_1$ and $\mathbf{p}_2$ and radii $r_1$ and $r_2$. The process begins by calculating the displacement vector between their centers, $\mathbf{d} = \mathbf{p}_2 - \mathbf{p}_1$.

Next, we compute the distance between the two centers using the Euclidean norm:

$$|\mathbf{d}| = \sqrt{\mathbf{d} \cdot \mathbf{d}} = \sqrt{d_x^2 + d_y^2}$$

The overlap $\delta$ is then determined by subtracting the distance from the sum of the radii:

$$\delta = r_1 + r_2 - |\mathbf{d}|$$

A collision is confirmed if the overlap $\delta$ is greater than zero. This geometric approach provides a computationally simple yet physically accurate basis for collision resolution.

---

## 3. Emitter Mechanics

To ensure a visually pleasing and controlled simulation, the particle emission process is carefully regulated rather than random.

### 3.1 Emitter Positioning

The simulation utilizes ten emitters distributed evenly across the top of the screen. The position of the $i$-th emitter is calculated as:

$$E_i = \left(\left(i + \frac{1}{2}\right) \cdot \frac{W}{10},\, 50\right), \text{ for } i \in \{0, \dots, 9\}$$

This formula ensures uniform distribution across the width of the container.

### 3.2 Emission Pattern

Particle emission follows a deterministic pattern. For a given particle number $n$, we first calculate its batch number, $\text{batch} = \lfloor n / 10 \rfloor$, which determines the timing group. The specific emitter responsible for the particle is identified by $i = n \bmod 10$. Finally, the emission time is derived as $t_e = \text{batch} / 60$ seconds.

This logic creates a rhythmic, cycling pattern where emitters release particles in a consistent sequence, contributing to the "flow" of the simulation.

---

## 4. Spatial Optimization

Naive collision detection between $n$ particles requires $O(n^2)$ comparisons, which becomes prohibitively expensive as $n$ grows. To maintain performance, we implement spatial partitioning.

### 4.1 Grid Construction

The simulation space is divided into a grid of cells. The dimensions of each cell are set slightly larger than the maximum particle diameter to ensure that a particle can only collide with mathematical neighbors. The cell size is defined as:

$$\text{cell\_size} = 2 \cdot r_{max} + \epsilon$$

Here, $r_{max}$ is the maximum particle radius (15 pixels) and $\epsilon$ is a small buffer (typically 1-2 pixels). The grid dimensions $n_x$ and $n_y$ are calculated by dividing the total width and height by the cell size.

### 4.2 Spatial Partitioning

Each particle is assigned to a specific cell index based on its coordinate position. The column index is found via $\lfloor p_x / \text{cell\_size} \rfloor$ and the row index via $\lfloor p_y / \text{cell\_size} \rfloor$. Boundary checks clamp these indices to ensure they remain valid within the grid range $[0, n_x-1]$ and $[0, n_y-1]$.

### 4.3 Cell-Based Collision Resolution

Instead of a global pairwise check, the system only evaluates particles against others in the same or immediately adjacent cells. For a particle located in cell $(i,j)$, the collision search is restricted to the current cell $(i,j)$ and its eight neighbors $(i\pm1, j\pm1)$.

This spatial optimization reduces the average computational complexity from $O(n^2)$ to approximately $O(n)$, enabling the simulation of thousands of particles in real-time.

### 4.4 Complexity Analysis

With a uniform particle distribution, each cell contains approximately $k = n/(n_x \cdot n_y)$ particles. Consequently, each particle requires checking against roughly $9k$ other particles. The total number of checks becomes:

$$n \cdot 9 \cdot \frac{n}{n_x \cdot n_y} = \frac{9n^2}{n_x \cdot n_y}$$

Since the grid size $n_x \cdot n_y$ scales linearly with the simulation area, and the number of particles $n$ typically scales with area as well, the ratio remains constant, resulting in linear $O(n)$ performance for large-scale simulations.

---

## 5. Color Mapping

The final visual element involves mapping colors from a source image to the particles once the physics simulation reaches equilibrium.

Each particle's position in the simulation space is converted to normalized coordinates $(u,v)$ in the range $[0,1]$:

$$u = \frac{p_x}{W}, \quad v = \frac{p_y}{H}$$

These coordinates are then used to sample the texture of the target image, assigning the corresponding color to the particle.
