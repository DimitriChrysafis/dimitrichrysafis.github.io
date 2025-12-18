# Physics-Based Particle Simulations: A Deep Dive
### SRC: [https://github.com/DimitriChrysafis/BallDrawer](https://github.com/DimitriChrysafis/BallDrawer)


## Verlet Integration Demonstrations

<video width="1000" controls autoplay muted>  
  <source src="../media/post7/initial.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>


<br />
<br />


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


<br />
<br />
<br />


## KEY IDEA HOW IT WORKS:

Before each video is recorded, a complete physics simulation runs with predefined parameters. All particles begin as uniform red balls, which later map to colors from a target image. This document provides a comprehensive explanation of the mathematical foundations and implementation details powering these simulations.


<br />
<br />
<br />


## How Verlet Integration Works

<br />

The system evolves without explicit velocity tracking, relying entirely on position history.

<br />

<div>
$$
\begin{align*}
\text{State}_t &= \{ \vec{x}_t, \vec{x}_{t-\Delta t}, \vec{a}_t \} \\
\downarrow \\
\vec{x}_{t+\Delta t} &= 2\vec{x}_t - \vec{x}_{t-\Delta t} + \vec{a}_t \Delta t^2
\end{align*}
$$
</div>

<br />
<br />

### Formal derivation from Taylor Series

<br />

We expand position $\vec{x}$ forward and backward in time around $t$:

<br />

<div>
$$
\begin{cases} 
\vec{x}(t+\Delta t) &= \vec{x}(t) + \vec{v}(t)\Delta t + \frac{1}{2}\vec{a}(t)\Delta t^2 + \frac{1}{6}\vec{b}(t)\Delta t^3 + \mathcal{O}(\Delta t^4) \\
\vec{x}(t-\Delta t) &= \vec{x}(t) - \vec{v}(t)\Delta t + \frac{1}{2}\vec{a}(t)\Delta t^2 - \frac{1}{6}\vec{b}(t)\Delta t^3 + \mathcal{O}(\Delta t^4)
\end{cases}
$$
</div>

<br />

Summing the system cancels odd-order terms (Velocity $\vec{v}$ and Jerk $\vec{b}$):

<br />

<div>
$$
\vec{x}(t+\Delta t) + \vec{x}(t-\Delta t) = 2\vec{x}(t) + \vec{a}(t)\Delta t^2 + \mathcal{O}(\Delta t^4)
$$
</div>

<br />

Rearranging for the next state $\vec{x}(t+\Delta t)$:

<br />

<div>
$$
\boxed{\vec{x}_{next} = 2\vec{x}_{curr} - \vec{x}_{prev} + \vec{a}_{curr} \Delta t^2}
$$
</div>

<br />
<br />

### Impulse-Based Velocity approximation

While velocity is implicit, it can be approximated for damping or friction:

<br />

<div>
$$
\vec{v}_t \approx \frac{\vec{x}_t - \vec{x}_{t-\Delta t}}{\Delta t}
$$
</div>


<br />
<br />
<br />


## Temporal Stability

<br />

To maintain simpler collision logic at high speeds, we perform temporal supersampling.

<br />

<div>
$$
\Delta T_{frame} = \frac{1}{60}s
$$
</div>

<br />

<div>
$$
\text{Substeps } N = 8
$$
</div>

<br />

<div>
$$
\Delta t = \frac{\Delta T_{frame}}{N} \approx 2.08 \text{ms}
$$
</div>

<br />

This ensures that particle displacement per step is smaller than the particle radius, preventing tunneling.

<br />

<div>
$$
|\Delta \vec{x}|_{max} < r_{particle}
$$
</div>

<br />
<br />
<br />


## Collision Response

<br />

Collision handling acts as a position constraint solver.

<br />

### 1. Separation Vector Analysis

For any two particles $i$ and $j$:

<br />

<div>
$$
\vec{\delta}_{ij} = \vec{x}_j - \vec{x}_i
$$
</div>

<br />

<div>
$$
d_{ij} = ||\vec{\delta}_{ij}||
$$
</div>

<br />

### 2. Constraint Violation Check

We check if the distance is less than the sum of radii:

<br />

<div>
$$
C(\vec{x}_i, \vec{x}_j) = d_{ij} - (r_i + r_j) < 0
$$
</div>

<br />

### 3. Position Correction (Projection)

If $C < 0$, we resolve by projecting particles out of the collision manifold along the normal $\hat{n}$.

<br />

<div>
$$
\hat{n} = \frac{\vec{\delta}_{ij}}{d_{ij}}
$$
</div>

<br />

The total penetration depth is $P = (r_i + r_j) - d_{ij}$.

We distribute this correction equally (assuming equal mass):

<br />

<div>
$$
\Delta \vec{x}_i = -\frac{P}{2} \hat{n}
$$
</div>

<br />

<div>
$$
\Delta \vec{x}_j = +\frac{P}{2} \hat{n}
$$
</div>

<br />

<div>
$$
\begin{bmatrix}
\vec{x}_i' \\
\vec{x}_j'
\end{bmatrix}
=
\begin{bmatrix}
\vec{x}_i \\
\vec{x}_j
\end{bmatrix}
+
\begin{bmatrix}
-0.5 P \hat{n} \\
+0.5 P \hat{n}
\end{bmatrix}
$$
</div>


<br />
<br />
<br />


## Spatial Hashing

<br />

Naive $O(N^2)$ checks are computationally prohibitive. We map the continuous simulation domain $\Omega \in \mathbb{R}^2$ to a discrete grid space $\mathbb{Z}^2$.

<br />

### Grid Basis

<br />

<div>
$$
\mathcal{G}_{size} = 2 \cdot r_{max} + \epsilon
$$
</div>

<br />

### Discrete Mapping Function

<br />

<div>
$$
H(\vec{x}) : \mathbb{R}^2 \rightarrow \mathbb{Z}^2
$$
</div>

<br />

<div>
$$
H(x, y) = \left( \left\lfloor \frac{x}{\mathcal{G}_{size}} \right\rfloor, \left\lfloor \frac{y}{\mathcal{G}_{size}} \right\rfloor \right)
$$
</div>

<br />

### Adjacency Search

For a particle in cell $(u, v)$, we only compute constraints against set $S_{local}$:

<br />

<div>
$$
S_{local} = \bigcup_{i=-1}^{1} \bigcup_{j=-1}^{1} \text{Cell}(u+i, v+j)
$$
</div>

<br />

This reduces the complexity regime from Quadratic to Linear:

<br />

<div>
$$
\mathcal{O}(N^2) \rightarrow \mathcal{O}(N)
$$
</div>

<br />
