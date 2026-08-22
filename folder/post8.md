# Sphere Packing inside Arbitrary Meshes
### SRC: [SpherePacking](https://github.com/DimitriChrysafis/SpherePacking)

## Demos

[Bunny](../media/post8/bunny.html) · [Dragon](../media/post8/dragon.html) · [Ogre](../media/post8/ogre.html) · [Binary Search](../media/post8/animation.html)

<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
  <iframe
    src="../media/post8/bunny.html"
    title="Sphere packing inside the Stanford Bunny"
    style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;"
    scrolling="no">
  </iframe>
</div>

<br />

## The loop

<img class="latex-formula formula-wide" src="../media/post8/diagrams/formula-01.svg?v=3" alt="Mesh to inside and clearance queries to largest seed sphere to tangent expansion to packed mesh">

GPU kernels batch the ray/triangle tests, nearest-surface distance queries, and candidate checks.
The first stage is global: it finds a safe, large seed anywhere in the mesh. The second stage is local: each new sphere grows from an existing one until a constraint becomes active.

## 1. Inside or outside

For a watertight mesh, cast a non-degenerate ray from $O$ through $P$.

<img class="latex-diagram" src="../media/post8/diagrams/ray-triangle.svg?v=3" alt="LaTeX diagram of a ray intersecting a triangle">

<img class="latex-formula" src="../media/post8/diagrams/formula-02.svg?v=3" alt="Ray and barycentric-coordinate intersection equation">

<img class="latex-formula" src="../media/post8/diagrams/formula-03.svg?v=3" alt="Forward ray and barycentric hit constraints">

The parity rule is then

<img class="latex-formula" src="../media/post8/diagrams/formula-04.svg?v=3" alt="Parity rule for point containment">

Each ray kernel returns $(t,u,v)$. Only forward hits with valid barycentric coordinates contribute to the parity count; shared edge and vertex hits need a consistent tie-break rule.

For Möller–Trumbore:

<img class="latex-formula" src="../media/post8/diagrams/formula-05.svg?v=3" alt="Triangle edge definitions">

<img class="latex-formula" src="../media/post8/diagrams/formula-06.svg?v=3" alt="Möller Trumbore intermediate values">

<img class="latex-formula" src="../media/post8/diagrams/formula-07.svg?v=3" alt="Möller Trumbore barycentric and ray solutions">

## 2. Largest interior sphere

Sample the interior on a grid $G$. For every interior point, measure the distance to the triangle surface. The seed is the point with the largest such distance.

<img class="latex-diagram" src="../media/post8/diagrams/grid-clearance.svg?v=4" alt="LaTeX diagram of grid samples and the largest interior clearance circle">

<img class="latex-formula" src="../media/post8/diagrams/formula-08.svg?v=3" alt="Distance from a point to the mesh boundary">

<img class="latex-formula" src="../media/post8/diagrams/formula-09.svg?v=3" alt="Largest-clearance grid seed and radius">

That radius is a conservative upper bound for every later sphere. This global pass avoids committing the solver to the first local gap it sees.

## 3. Tangent expansion

From an accepted sphere $(C_a,r_a)$, choose a unit direction $\hat d$ and solve for the next radius. As $r$ grows, the candidate center moves outward by exactly the same amount, so the new sphere stays tangent to its anchor.

<img class="latex-formula" src="../media/post8/diagrams/formula-10.svg?v=3" alt="Tangent candidate-center equation">

The two spheres touch because

<img class="latex-formula" src="../media/post8/diagrams/formula-11.svg?v=3" alt="Tangency condition">

For a valid/invalid bracket $[L,H]$ around the first failed radius:

<img class="latex-formula" src="../media/post8/diagrams/formula-12.svg?v=3" alt="Binary search update rule">

<img class="latex-formula" src="../media/post8/diagrams/formula-13.svg?v=3" alt="Candidate sphere validity test">

The containment term keeps the center inside the mesh. The clearance term prevents surface penetration. The last term rejects overlap with every sphere already accepted into the packing. The output is a hierarchy of large interior spheres followed by progressively smaller gap-filling spheres, all using the same compact GPU-friendly tests.

## Result

<img class="post8-result" src="../media/post-images/sphere-packing.png" alt="Sphere packing result inside the Stanford Bunny">

<img class="latex-formula formula-wide" src="../media/post8/diagrams/formula-14.svg?v=3" alt="Global seed to local tangent solve to dense non-overlapping packing">
