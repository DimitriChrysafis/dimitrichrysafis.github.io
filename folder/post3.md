# Smooth Blending of Spheres

<video width="1000" controls autoplay muted loop>  
  <source src="../media/post3/blubblubblub.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>  


<br />
<br />
<br />


## SDF Basics  

<br />

The Signed Distance Function (SDF) $d(\mathbf{p})$ maps a point in space to its distance from a surface.

<br />

<div>
$$
\begin{cases} 
d(\mathbf{p}) > 0 & \text{outside} \\
d(\mathbf{p}) = 0 & \text{surface} \\
d(\mathbf{p}) < 0 & \text{inside}
\end{cases}
$$
</div>

<br />

For a sphere $S = \{\mathbf{c}, r\}$:

<br />

<div>
$$
d(\mathbf{p}) = \|\mathbf{p} - \mathbf{c}\| - r
$$
</div>


<br />
<br />
<br />


## Smooth Union

<br />

Standard constructive solid geometry (CSG) uses $\min(d_1, d_2)$ for union, creating sharp creases. To blend smoothly, we use a polynomial mix factor $h$.

<br />

<div>
$$
h = \text{clamp}\left( 0.5 + 0.5 \frac{d_2 - d_1}{k}, 0, 1 \right)
$$
</div>

<br />

<div>
$$
d_{\text{blend}} = \text{mix}(d_1, d_2, h) - k \cdot h(1 - h)
$$
</div>

<br />

The term $k$ controls the Lipschitz continuity of the blend. As $k \to 0$, $d_{\text{blend}} \to \min(d_1, d_2)$.

<br />

<div>
$$
\lim_{k \to 0} \text{SmoothUnion}(d_1, d_2, k) = \text{Union}(d_1, d_2)
$$
</div>


<br />
<br />
<br />


## Material Interpolation

<br />

Physical properties such as albedo, roughness, or metallic factors can be interpolated using the same blend weight $h$.

<br />

<div>
$$
\text{Mat}_{rgb} = (1-h)\text{Mat}_1 + h\text{Mat}_2
$$
</div>


<br />
<br />
<br />


## Visualizations

<br />

<video width="1000" controls autoplay muted loop>  
  <source src="../media/post3/miniblub.mp4" type="video/mp4">  
  Your browser does not support the video tag.  
</video>
