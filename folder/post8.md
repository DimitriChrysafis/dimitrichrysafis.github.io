# How To Pack Spheres

<br />

# Embedded Demos (SCROLL TO ZOOM and click and drag to look around)

<br />

### Bunny
<iframe src="https://dimitrichrysafis.github.io/media/post8/bunny.html" width="100%" height="500px"></iframe>

<br />

## Demos

[Dragon Demo](https://dimitrichrysafis.github.io/media/post8/dragon.html) | 
[Bunny Demo](https://dimitrichrysafis.github.io/media/post8/bunny.html) | 
[Ogre Demo](https://dimitrichrysafis.github.io/media/post8/ogre.html)

<br />

Sphere packing is an NP-hard problem that becomes more complex with spheres of different sizes. The implementation in chad.py creates a packing where every sphere is tangent to at least one other sphere.

<br />

### 1. Inside/Outside Testing: Ray Casting Method

<br />

**Mathematical Formulation:**
For point $\mathbf{p}$ and ray direction $\mathbf{d}$, intersection with triangle $(\mathbf{v}_0, \mathbf{v}_1, \mathbf{v}_2)$ via Möller–Trumbore algorithm:

<br />

$$\begin{bmatrix} t \\ u \\ v \end{bmatrix} = \frac{1}{\mathbf{d} \cdot (\mathbf{e}_1 \times \mathbf{e}_2)} \begin{bmatrix} (\mathbf{s} \times \mathbf{e}_2) \cdot \mathbf{d} \\ (\mathbf{s} \times \mathbf{e}_1) \cdot \mathbf{d} \\ (\mathbf{s} \times \mathbf{e}_1) \cdot \mathbf{e}_2 \end{bmatrix}$$

<br />

Where:
- $\mathbf{e}_1 = \mathbf{v}_1 - \mathbf{v}_0$ is the first edge vector of the triangle
- $\mathbf{e}_2 = \mathbf{v}_2 - \mathbf{v}_0$ is the second edge vector of the triangle
- $\mathbf{s} = \mathbf{p} - \mathbf{v}_0$ is the vector from the first vertex to the ray origin

<br />

**Intersection Conditions:**
- $t > 0$ (intersection in front of ray origin)
- $0 \leq u \leq 1$ (intersection is to the right of the first edge)
- $0 \leq v \leq 1$ (intersection is to the left of the third edge)
- $u + v \leq 1$ (intersection is below the second edge)

<br />

**How It Works:**
The algorithm casts a ray from each test point in a fixed direction and counts intersections with the mesh triangles. If the count is odd, the point is inside; if even, it's outside. The GPU implementation processes points in batches for efficiency, computing ray-triangle intersections in parallel.

<br />

### 2. Distance to Surface Calculation

<br />

**Mathematical Formulation:**
Minimum distance from point $\mathbf{p}$ to mesh surface:

<br />

$$d(\mathbf{p}, \text{mesh}) = \min_{\mathbf{q} \in \text{mesh}} \|\mathbf{p} - \mathbf{q}\|$$

<br />

Where $\mathbf{p}$ is the potential sphere center and $\mathbf{q}$ ranges over all points on the mesh surface.

<br />

**How It Works:**
The algorithm approximates this by sampling points on the mesh surface and finding the minimum Euclidean distance to these sample points. The GPU implementation uses batched processing to efficiently compute distances between candidate points and surface points.

<br />

### 3. Finding the First Sphere

<br />

**Maximal Inscribed Sphere Problem:**

<br />

$$\max_{\mathbf{c} \in \Omega} \min_{\mathbf{q} \in \partial \Omega} \|\mathbf{c} - \mathbf{q}\|$$

<br />

Where $\Omega$ is mesh interior and $\partial \Omega$ is boundary.

<br />

**How It Works:**
To find the largest sphere that fits inside the mesh, the algorithm:
1. Creates a uniform grid of candidate points within the mesh's bounding box
2. Filters points to keep only those inside the mesh (using ray casting)
3. Computes the distance from each point to the mesh surface
4. Selects the point with the maximum distance

<br />

### 4. Finding Tangent Spheres

<br />

**Constrained Optimization Problem:**

<br />

$$
\begin{align}
\max_{\mathbf{c}, r} & \quad r \\
\text{subject to} \quad & \mathbf{c} \in \Omega \\
& r \leq \min_{\mathbf{q} \in \partial \Omega} \|\mathbf{c} - \mathbf{q}\| \\
& \|\mathbf{c} - \mathbf{c}_i\| \geq r + r_i \quad \text{for all existing spheres } i \\
& \|\mathbf{c} - \mathbf{c}_j\| = r + r_j \quad \text{for some existing sphere } j
\end{align}
$$

<br />

**How It Works:**
The core of the algorithm finds new spheres tangent to existing ones by:

<br />

1. **Selecting anchor spheres**: Choose existing spheres with probability proportional to their volume.
2. **Generating random directions**: From each anchor sphere center, cast rays in random directions.
3. **Binary search**: For each ray, find the optimal radius for a new sphere that satisfies all constraints.

<br />

<iframe src="https://dimitrichrysafis.github.io/media/post8/animation.html" width="100%" height="500px"></iframe>

<br />

The search bounds are:
- Lower bound: $r_{\text{min}} = 0$ (or some small positive value)
- Upper bound: $r_{\text{max}} = $ distance to the bounding box in direction $\mathbf{d}$

<br />

### 5. Weighted Sampling Strategy

<br />

**Probability Distribution:**
Probability of selecting sphere $i$ as anchor:

<br />

$$P(i) = \frac{V_i}{\sum_j V_j} = \frac{r_i^3}{\sum_j r_j^3}$$

<br />

Where $V_i = \frac{4\pi}{3}r_i^3$ is sphere volume.

<br />

**How It Works:**
The selection of anchor spheres uses weighted sampling, where the probability is proportional to sphere volume. This approach is justified because:

<br />

1. Larger spheres have more surface area, providing more potential tangent points
2. Placing spheres tangent to larger spheres tends to fill space more efficiently
3. Lower curvature (larger radius) creates more space for new spheres to fit tangentially

<br />


$$\text{cell}(\mathbf{c}) = \left(\left\lfloor\frac{c_x}{s}\right\rfloor, \left\lfloor\frac{c_y}{s}\right\rfloor, \left\lfloor\frac{c_z}{s}\right\rfloor\right)$$

<br />

Where $\mathbf{c} = (c_x, c_y, c_z)$ is the sphere center and $s$ is the cell size.

<br />

## Volume Filling Analysis

<br />

Packing efficiency is measured as the ratio of sphere volume to mesh volume:

<br />

$$\text{Fill Ratio} = \frac{\sum_{i} \frac{4\pi}{3}r_i^3}{\text{Mesh Volume}}$$

<br />

Theoretical upper bounds for sphere packing include:
- Regular packing (e.g., face-centered cubic): $\frac{\pi}{3\sqrt{2}} \approx 74.05\%$
- Random packing: approximately $64\%$
- Apollonian packing: approaches $100\%$ as sphere count approaches infinity

<br />

