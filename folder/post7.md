# Physics-Based Particle Simulations: A Deep Dive
### SRC: https://github.com/DimitriChrysafis/BallDrawer
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

## KEY IDEA HOW IT WORKS: 

Before each video is recorded, a complete physics simulation runs with predefined parameters. All particles begin as uniform red balls, which later map to colors from a target image. This document provides a comprehensive explanation of the mathematical foundations and implementation details powering these simulations.

---

<br />



## 1. The Mathematical Base: Verlet Integration

Verlet integration is key for the actual physics engine powering this


<br />

### 1.1 Classical Verlet Integration Formulation

The standard Verlet integration equation updates a particle's position based on its current position, previous position, and acceleration:

$$x(t+\Delta t) = 2x(t) - x(t-\Delta t) + a(t)\Delta t^2$$

<br />

Where:
- $x(t)$ represents the current position at time $t$
- 
<br />

- $x(t-\Delta t)$ represents the previous position at time $t-\Delta t$ 
- 
<br />

- $a(t)$ is the acceleration vector at time $t$
- 
<br />

- $\Delta t$ is the discrete time step


<br />

The true reason that this formula is the goat is that velocity is implicit in the term $(x(t) - x(t-\Delta t))$, meaning we don't need to explicitly store or update velocity vectors.

<br />

### 1.2 Derivation and understanding

<br />

To understand why Verlet integration works so well, we can derive it from Taylor series expansions of the position function.

<br />

For a position function $x(t)$ with continuous derivatives, the Taylor expansions around time $t$ are:

Forward expansion:
$$x(t+\Delta t) = x(t) + v(t)\Delta t + \frac{1}{2}a(t)\Delta t^2 + \frac{1}{6}\dddot{x}(t)\Delta t^3 + O(\Delta t^4)$$

Backward expansion:
$$x(t-\Delta t) = x(t) - v(t)\Delta t + \frac{1}{2}a(t)\Delta t^2 - \frac{1}{6}\dddot{x}(t)\Delta t^3 + O(\Delta t^4)$$

Adding these two equations:
$$x(t+\Delta t) + x(t-\Delta t) = 2x(t) + a(t)\Delta t^2 + O(\Delta t^4)$$


<br />

If you can see, the first order terms (velocity) cancel out, and the third-order terms also cancel, leaving us with an error of order $O(\Delta t^4)$, which is better than many standard integrators. Rearranging:

$$x(t+\Delta t) = 2x(t) - x(t-\Delta t) + a(t)\Delta t^2 + O(\Delta t^4)$$

Now just drop the error term gives us the standard Verlet formula.


<br />

### 1.3 How to make this stable at high velocities

A lot of the time when you have lots of quickly moving balls, thinks break :() Here is a way to (sort of) get around that.

$$\Delta t_{sub} = \frac{\Delta t}{N_{substeps}}$$

The simulation uses $\Delta t = \frac{1}{60}$ seconds (matching typical display refresh rates) and $N_{substeps} = 8$, giving:

$$\Delta t_{sub} = \frac{1}{480} \approx 0.00208 \text{ seconds}$$

Each frame, we perform $N_{substeps}$ iterations of the physics update, which is basically just increasing the resolution during collision handling. This prevents tunneling (particles passing through barriers) and improves the accuracy of collision responses.

<br />

The total acceleration per substep becomes:

$$a_{sub} = a \cdot \frac{\Delta t_{sub}^2}{\Delta t^2} = a \cdot \frac{1}{N_{substeps}^2}$$

### 1.4 Extra Note
This far better than explicit Euler integration which tends to artificially increase energy

<br />

---

<br />

## 2. Collision Detection and Response

<br />

### 2.1 Pairwise Collision Detection

<br />

For two particles with positions $\mathbf{p}_1$ and $\mathbf{p}_2$ and radii $r_1$ and $r_2$, the collision detection involves:

1. Calculating the displacement vector between centers:
   $$\mathbf{d} = \mathbf{p}_2 - \mathbf{p}_1$$

2. Computing the distance between centers:
   $$|\mathbf{d}| = \sqrt{\mathbf{d} \cdot \mathbf{d}} = \sqrt{d_x^2 + d_y^2}$$

3. Determining overlap:
   $$\delta = r_1 + r_2 - |\mathbf{d}|$$

4. A collision exists if $\delta > 0$

<br />

This is the simplest way to do it, I could ask an 8 year old how they would take about solving the problem and they would probably just say the above thing but in less formal terms.

<br />


---

## 3. Emitter System Dynamics

I need this to look nice after all, and I can't just have it shooting balls super fast, so this is how I dealt with my spouts.

<br />

### 3.1 Emitter Positioning

The simulation places $N_{spouts} = 10$ emitters evenly across the top of the screen:

$$E_i = \left(\left(i + \frac{1}{2}\right) \cdot \frac{W}{N_{spouts}},\, 50\right), \text{ for } i = 0,1,\dots,9$$

Yay now they're uniformly distributed

### 3.2 Emission Pattern

For ball number $n$, we calculate:

<br />

- Batch number: $\text{batch} = \lfloor n / N_{spouts} \rfloor$

<br />

- Emitter index: $i = n \bmod N_{spouts}$

<br />

- Emission time: $t_e = \text{batch} / 60$ seconds

<br />

This creates a cycling pattern where each emitter releases particles in the right sequence (same as round 1).

---

<br />

## 4. Spatial Optimization with Grid-Based Partitioning

Naive collision detection between $n$ particles requires $O(n^2)$ comparisons. To improve efficiency, we implement spatial partitioning.

<br />

### 4.1 Grid Making

The space is divided into a grid of cells, each with dimensions slightly larger than the maximum particle diameter:

$$\text{cell\_size} = 2 \cdot r_{max} + \epsilon$$

Where $r_{max}$ is the maximum particle radius (15 pixels) and $\epsilon$ is a small buffer (typically 1-2 pixels).

The number of cells in each dimension is:

$$n_x = \lceil W / \text{cell\_size} \rceil$$
$$n_y = \lceil H / \text{cell\_size} \rceil$$

### 4.2 Assigned Seating

Each particle is assigned to a cell based on its position:

$$\text{cell\_x} = \lfloor p_x / \text{cell\_size} \rfloor$$
$$\text{cell\_y} = \lfloor p_y / \text{cell\_size} \rfloor$$

Handling boundary cases:
$$\text{cell\_x} = \max(0, \min(\text{cell\_x}, n_x-1))$$
$$\text{cell\_y} = \max(0, \min(\text{cell\_y}, n_y-1))$$

### 4.3 Cell-Based Collision Detection

Instead of checking all particles against each other, we only check particles within the same or adjacent cells:

1. For each cell $(i,j)$:
<br />

   - For each particle $p$ in cell $(i,j)$:
<br />

     - Check for collisions with other particles in cell $(i,j)$
<br />

     - Check for collisions with particles in the 8 neighboring cells $(i±1,j±1)$
<br />


This reduces the average number of checks from $O(n^2)$ to approximately $O(n)$, a significant performance improvement for large numbers of particles.

<br />

### 4.4 Mathematical Complexity Analysis

With uniform particle distribution, each cell contains approximately $n/(n_x \cdot n_y)$ particles. For each particle, we check approximately $9 \cdot n/(n_x \cdot n_y)$ other particles (current cell plus 8 neighbors).

<br />

Total checks: $n \cdot 9 \cdot n/(n_x \cdot n_y) = 9n^2/(n_x \cdot n_y)$

<br />

Since $n_x \cdot n_y$ scales with the simulation area, and the number of particles also scales with area, this approaches $O(n)$ complexity for large simulations.

<br />

---

<br />

## 5. Color Mapping(the easiest part)

After the physics simulation reaches equilibrium/chill state, we map colors from a source image to the particles.

<br />

### 5.1 Position in space to the position on the image

Each particle's position in the simulation space is converted to normalized coordinates:

$$u = \frac{p_x}{W}, \quad v = \frac{p_y}{H}$$

Where $(u,v)$ are the normalized coordinates in the range $[0,1]$.



