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

**Mathematical Thing:**
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

### 2. Minimum distance calc

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

# For the initial sphere

**Logic:**
To find the largest sphere that fits inside the mesh, the algorithm:
1. Creates a uniform grid of candidate points within the mesh's bounding box
2. Filters points to keep only those inside the mesh (using ray casting)
3. Computes the distance from each point to the mesh surface
4. Selects the point with the maximum distance

<br />

### 4. Finding Tangent Spheres

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

