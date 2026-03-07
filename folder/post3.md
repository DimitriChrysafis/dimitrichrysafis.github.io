# Smooth Blending of Spheres

<video width="1000" controls autoplay muted loop>  
  <source src="../media/post3/blubblubblub.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>  

<br />
<br />
<br />

## SDF Basics

A signed distance function gives a number for every point in space:

<div>
$$
\begin{cases}
d(\mathbf{p}) > 0 & \text{outside} \\
d(\mathbf{p}) = 0 & \text{surface} \\
d(\mathbf{p}) < 0 & \text{inside}
\end{cases}
$$
</div>

For a sphere with center $\mathbf{c}$ and radius $r$,

<div>
$$
d(\mathbf{p}) = \|\mathbf{p} - \mathbf{c}\| - r
$$
</div>

<br />
<br />
<br />

## Smooth Union

A hard union is just

<div>
$$
d_{union} = \min(d_1, d_2)
$$
</div>

That works, but gives a hard seam.
To make the spheres melt together, I use a smooth union:

<div>
$$
h = \operatorname{clamp}\left(0.5 + 0.5\frac{d_2-d_1}{k},\; 0,\; 1\right)
$$
</div>

<div>
$$
d_{blend} = \operatorname{mix}(d_2, d_1, h) - k\,h(1-h)
$$
</div>

Here $k$ controls how wide the blend is.
Small $k$ stays close to a hard union. Larger $k$ gives a softer bridge.

As $k \to 0$,

<div>
$$
\lim_{k \to 0} d_{blend} = \min(d_1,d_2)
$$
</div>

<br />
<br />
<br />

## Material Interpolation

The material should blend with the geometry.
Using the same weight $h$,

<div>
$$
\text{Mat}_{rgb} = (1-h)\text{Mat}_1 + h\text{Mat}_2
$$
</div>

Otherwise the surface shape is smooth but the shading still breaks.

<br />
<br />
<br />

## Visualization

<video width="1000" controls autoplay muted loop>  
  <source src="../media/post3/miniblub.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>

What you see is the zero level set of the blended field:

<div>
$$
d_{blend}(\mathbf{p}) = 0
$$
</div>

So the middle blob is not a mesh glued between two spheres.
It appears because the combined distance field changes shape in the overlap region.

A compact way to think about it is

<div>
$$
(d_1,d_2) \rightarrow d_{blend} \rightarrow \{\mathbf{p}: d_{blend}(\mathbf{p})=0\}
$$
</div>

Near one sphere, one field dominates.
Near the overlap, both fields matter, and the correction term creates the rounded neck.

The same blend weight also tells you where each sphere still has influence:

<div>
$$
h \approx 0 \Rightarrow \text{mostly sphere 1}
\qquad
h \approx 1 \Rightarrow \text{mostly sphere 2}
$$
</div>

Normals come from the gradient,

<div>
$$
\mathbf{n} = \frac{\nabla d(\mathbf{p})}{\|\nabla d(\mathbf{p})\|}
$$
</div>

so if the field is smooth, the lighting is smooth too.

That is basically the whole effect:

<div>
$$
\text{blend the field} + \text{blend the material} + \text{shade with the blended normal}
$$
</div>
