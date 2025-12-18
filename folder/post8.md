# Sphere Packing inside Arbitrary Meshes
### SRC: [https://github.com/DimitriChrysafis/SpherePacking](https://github.com/DimitriChrysafis)

## Demos

<br />

### 1. The Stanford Bunny

Links: <a href="../media/post8/dragon.html" target="_blank" rel="noopener noreferrer">Dragon</a> | <a href="../media/post8/ogre.html" target="_blank" rel="noopener noreferrer">Ogre</a>

<br />
<br />

<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="../media/post8/bunny.html" 
    style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;"
    scrolling="no">
  </iframe>
</div>

<br />
<br />
<br />


## KEY IDEA HOW IT WORKS:

To tightly pack spheres inside an arbitrary 3D mesh, we use a hybrid approach combining GPU-accelerated grid search for initial placement and a stochastic tangent-based purely iterative solver for filling gaps. All geometric queries invoke custom CUDA/MPS kernels for high-throughput ray-triangle intersection tests.


<br />
<br />
<br />


## GPU Intersection

<br />

Point containment is determined via the Generalized Winding Number or simple Ray Casting (Parity Rule) for watertight meshes.

<br />

<div>
$$
\text{Inside}(P) \iff \left( \sum_{T \in \text{Mesh}} \text{Intersect}(P, \vec{d}, T) \right) \equiv 1 \pmod 2
$$
</div>

<br />

We solve for intersection time $t$ and barycentric coordinates $(u, v)$ against triangle vertices $V_0, V_1, V_2$. This is a change of basis problem mapping the ray space to the triangle's barycentric space.

<br />

<div>
$$
\vec{P} = \vec{O} + t\vec{D} = (1 - u - v)V_0 + uV_1 + vV_2
$$
</div>

<br />

Rearranging into a linear system $Ax = b$:

<br />

<div>
$$
\begin{bmatrix}
-\vec{D} & V_1 - V_0 & V_2 - V_0
\end{bmatrix}
\begin{bmatrix}
t \\ u \\ v
\end{bmatrix}
= \vec{O} - V_0
$$
</div>

<br />

Using Cramer's Rule (Möller–Trumbore algorithm), we define the edge vectors and determinants:

<br />

<div>
$$
\begin{aligned}
\vec{E}_1 &= V_1 - V_0 \\
\vec{E}_2 &= V_2 - V_0 \\
\vec{T} &= \vec{O} - V_0 \\
\vec{P} &= \vec{D} \times \vec{E}_2 \\
\vec{Q} &= \vec{T} \times \vec{E}_1
\end{aligned}
$$
</div>

<br />

The solution for $t$ is then given by the ratio of determinants:

<br />

<div>
$$
t = \frac{\det(\vec{T}, \vec{E}_1, \vec{E}_2)}{\det(-\vec{D}, \vec{E}_1, \vec{E}_2)} = \frac{1}{\vec{P} \cdot \vec{E}_1} (\vec{Q} \cdot \vec{E}_2)
$$
</div>


<br />
<br />
<br />


## Grid Search

<br />

To find the largest possible sphere in standard space, we discretize the bounding volume into a high-resolution grid $G$. This acts as a global optimization step to escape local optima that a purely greedy approach might fall into.

<br />

<div>
$$
G_{ijk} \in \mathbb{R}^3 \cap \Omega_{mesh}
$$
</div>

<br />

For every valid grid point, we compute the nearest distance to the surface point cloud $S$. This is effectively computing the Signed Distance Function (SDF) on the GPU:

<br />

<div>
$$
\text{SDF}(p) = \min_{s \in S} ||p - s||
$$
</div>

<br />

<div>
$$
R_{max} = \max_{p \in G} (\text{SDF}(p))
$$
</div>

<br />

This provides the optimal starting seed for the packing algorithm.


<br />
<br />
<br />


## Tangent Solver

<br />

Subsequent spheres are placed by expanding from the surface of existing spheres. This ensures tight packing density ($\phi_{local} \approx 0.74$).

<br />

Given an anchor sphere $(C_a, r_a)$ and a random direction $\hat{d}$, the new sphere center is parameterized by its radius $r$:

<br />

<div>
$$
C_{new}(r) = C_a + (r_a + r) \hat{d}
$$
</div>

<br />

We find the maximum valid $r$ using a **Binary Search** over the interval $[0, R_{max}]$.

<br />

### Binary Search Logic

<br />

<div>
$$
\begin{array}{c}
\text{Start Interval: } [L, H] \\
\downarrow \\
\text{Midpoint: } m = \frac{L+H}{2} \\
\downarrow \\
\text{Check Validity}(C_{new}(m), m) \\
\swarrow \qquad \searrow \\
\text{Valid} \qquad \text{Invalid} \\
L \leftarrow m \qquad H \leftarrow m
\end{array}
$$
</div>

<br />

The validity check $\text{Valid}(C, r)$ involves three simultaneous constraints:

<br />

### 1. Mesh Containment

The sphere must remain entirely inside the mesh.

<br />

<div>
$$
\text{Inside}(C) \land (\text{SDF}(C) \ge r)
$$
</div>

<br />

### 2. Surface Clearance

The sphere cannot penetrate the mesh boundary.

<br />

<div>
$$
r \le \min_{s \in S} ||C - s||
$$
</div>

<br />

### 3. Mutual Exclusion

The sphere cannot overlap with any existing sphere $i$.

<br />

<div>
$$
\forall i: ||C - C_i|| \ge r + r_i
$$
</div>

    <br />
    <br />
    <br />


    ## KEY IDEA HOW IT WORKS:

    To tightly pack spheres inside an arbitrary 3D mesh, we use a hybrid approach combining GPU-accelerated grid search
    for initial placement and a stochastic tangent-based purely iterative solver for filling gaps. All geometric queries
    invoke custom CUDA/MPS kernels for high-throughput ray-triangle intersection tests.


    <br />
    <br />
    <br />


    ## GPU Intersection

    <br />

    Point containment is determined via the Generalized Winding Number or simple Ray Casting (Parity Rule) for
    watertight meshes.

    <br />

    <div>
        $$
        \text{Inside}(P) \iff \left( \sum_{T \in \text{Mesh}} \text{Intersect}(P, \vec{d}, T) \right) \equiv 1 \pmod 2
        $$
    </div>

    <br />

    We solve for intersection time $t$ and barycentric coordinates $(u, v)$ against triangle vertices $V_0, V_1, V_2$:

    <br />

    <div>
        $$
        \vec{P} = \vec{O} + t\vec{D} = (1 - u - v)V_0 + uV_1 + vV_2
        $$
    </div>

    <br />

    Rearranging into a linear system:

    <br />

    <div>
        $$
        \begin{bmatrix}
        -\vec{D} & V_1 - V_0 & V_2 - V_0
        \end{bmatrix}
        \begin{bmatrix}
        t \\ u \\ v
        \end{bmatrix}
        = \vec{O} - V_0
        $$
    </div>

    <br />

    Using Cramer's Rule (Möller–Trumbore algorithm):

    <br />

    <div>
        $$
        \begin{aligned}
        \vec{E}_1 &= V_1 - V_0 \\
        \vec{E}_2 &= V_2 - V_0 \\
        \vec{T} &= \vec{O} - V_0 \\
        \vec{P} &= \vec{D} \times \vec{E}_2 \\
        \vec{Q} &= \vec{T} \times \vec{E}_1
        \end{aligned}
        $$
    </div>

    <br />

    <div>
        $$
        t = \frac{1}{\vec{P} \cdot \vec{E}_1} (\vec{Q} \cdot \vec{E}_2)
        $$
    </div>


    <br />
    <br />
    <br />


    ## Grid Search

    <br />

    To find the largest possible sphere in standard space, we discretize the bounding volume into a high-resolution grid
    $G$.

    <br />

    <div>
        $$
        G_{ijk} \in \mathbb{R}^3 \cap \Omega_{mesh}
        $$
    </div>

    <br />

    For every valid grid point, we compute the nearest distance to the surface point cloud $S$:

    <br />

    <div>
        $$
        R_{max} = \max_{p \in G} \left( \min_{s \in S} ||p - s|| \right)
        $$
    </div>

    <br />

    This provides the optimal starting seed for the packing algorithm.


    <br />
    <br />
    <br />


    ## Tangent Solver

    <br />

    Subsequent spheres are placed by expanding from the surface of existing spheres.

    <br />

    Given an anchor sphere $(C_a, r_a)$ and a random direction $\hat{d}$:

    <br />

    <div>
        $$
        C_{new}(r) = C_a + (r_a + r) \hat{d}
        $$
    </div>

    <br />

    We perform a bisection search to maximize radius $r$ subject to three constraints:

    <br />

    ### 1. Mesh Containment

    <br />

    <div>
        $$
        \text{Inside}(C_{new}(r)) = \text{True}
        $$
    </div>

    <br />

    ### 2. Surface Clearance

    <br />

    <div>
        $$
        r \le \min_{s \in S} ||C_{new}(r) - s||
        $$
    </div>

    <br />

    ### 3. Mutual Exclusion

    <br />

    <div>
        $$
        ||C_{new}(r) - C_existing|| \ge r + r_{existing}
        $$
    </div>
