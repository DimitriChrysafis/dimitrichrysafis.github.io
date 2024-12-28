# Smooth Blending of Spheres

<video width="600" controls>
  <source src="../media/post3/blubblubblub.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Signed Distance Field Basics
An **SDF function** for a shape returns the shortest distance from a point $\mathbf{p}$ to the surface of the shape.

<br />

- $d(\mathbf{p}) > 0$: the point is outside the shape.
- $d(\mathbf{p}) < 0$: the point is inside the shape.
- $d(\mathbf{p}) = 0$: this lies exactly on the surface.

<br />

For two spheres centered at $\mathbf{c}_1$ and $\mathbf{c}_2$ with radii $r_1$ and $r_2$, their SDFs are:

$$
d_1(\mathbf{p}) = \|\mathbf{p} - \mathbf{c}_1\| - r_1
$$
$$
d_2(\mathbf{p}) = \|\mathbf{p} - \mathbf{c}_2\| - r_2
$$

<br />

## Smooth Union: Blending Two SDFs
To blend $d_1$ and $d_2$, we compute the **smooth union**:

$$
h = \text{clamp}\left(0.5 + 0.5 \cdot \frac{d_2 - d_1}{k}, 0, 1\right)
$$

Where:
- $d_1$: SDF of the first sphere.
- $d_2$: SDF of the second sphere.
- $k$: Smoothness parameter (controls blending radius).
- $\text{clamp}(x, 0, 1)$: Ensures $h$ stays in the range $[0, 1]$.

The blended SDF is given by:

$$
d_{\text{blend}} = \text{mix}(d_1, d_2, h) - k \cdot h \cdot (1 - h)
$$

## Explanation of Terms
1. **Blend Weight**:
   $$
   h = \text{clamp}\left(0.5 + 0.5 \cdot \frac{d_2 - d_1}{k}, 0, 1\right)
   $$
   - $\frac{d_2 - d_1}{k}$: Scales the distance difference between the two shapes.
   - $h$: Transition factor between the two shapes.

2. **Blended Distance**:
   $$
   \text{mix}(d_1, d_2, h) = h \cdot d_2 + (1 - h) \cdot d_1
   $$
   - Combines the two distances based on $h$.

3. **Adjustment Term**:
   $$
   -k \cdot h \cdot (1 - h)
   $$
   - Smooths the surface between the shapes.

<br />

## Material Blending (Optional)
The visual properties (e.g., color, reflectivity(I HAVE NOT DONE)) are blended using the same $h$:

$$
\text{material}_{\text{blend}} = \text{mix}(\text{material}_1, \text{material}_2, h)
$$

<br />

## Example of Use
If $k \to 0$, the result is a hard union (no blending). As $k$ increases, the transition becomes smoother.

<br />

## Graphical Visualization
**$k = 0$**: Hard edges.
**$k > 0$**: Smooth blend. Spheres "melt" into each other.

<br />

## 2D and 3D Visualization of Blending
<video width="600" controls>
  <source src="../media/post3/miniblub.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<br />

### 2D Cross-Section
Consider a horizontal slice through the blended spheres. The SDF forms a smooth transition between the circles.

<br />
