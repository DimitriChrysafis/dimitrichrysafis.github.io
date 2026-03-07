# Small Physics Sim For Balls
### SRC: [https://github.com/DimitriChrysafis/BallDrawer](https://github.com/DimitriChrysafis/BallDrawer)

## Demo

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

The sim runs first.
Then each ball gets mapped to a target color, so the final result looks more like a drawing system than a normal physics scene.

## The pipeline

This is the loop:

<div>
$$
\text{apply forces}
\rightarrow
\text{Verlet update}
\rightarrow
\text{substeps}
\rightarrow
\text{resolve collisions}
\rightarrow
\text{render}
$$
</div>

The two main ideas are:

- Verlet integration for motion
- spatial hashing for fast collision checks

## Verlet integration

I do not store velocity as the main state.
I store current position, previous position, and acceleration.

<div>
$$
\text{state}_t = \{\vec{x}_t,\; \vec{x}_{t-\Delta t},\; \vec{a}_t\}
$$
</div>

Then I step forward with

<div>
$$
\boxed{\vec{x}_{t+\Delta t} = 2\vec{x}_t - \vec{x}_{t-\Delta t} + \vec{a}_t\Delta t^2}
$$
</div>

Read it like this:

<div>
$$
\text{next} = \text{current} + (\text{current} - \text{previous}) + \text{acceleration push}
$$
</div>

So the particle keeps its motion, then acceleration bends it.

### Why this formula works

Use Taylor expansion forward and backward in time:

<div>
$$
\begin{aligned}
\vec{x}(t+\Delta t) &= \vec{x}(t) + \vec{v}(t)\Delta t + \frac12 \vec{a}(t)\Delta t^2 + \mathcal{O}(\Delta t^3) \\
\vec{x}(t-\Delta t) &= \vec{x}(t) - \vec{v}(t)\Delta t + \frac12 \vec{a}(t)\Delta t^2 + \mathcal{O}(\Delta t^3)
\end{aligned}
$$
</div>

Add them and the velocity terms cancel.
That gives the Verlet step.

If I need velocity anyway, I estimate it with

<div>
$$
\vec{v}_t \approx \frac{\vec{x}_t - \vec{x}_{t-\Delta t}}{\Delta t}
$$
</div>

That is enough for damping-type behavior.

## Why I use substeps

One big frame step is too risky.
Particles can tunnel through each other or through walls.
So I split each frame into smaller physics steps.

<div>
$$
\Delta T_{frame} = \frac{1}{60}
\qquad
N = 8
\qquad
\Delta t = \frac{\Delta T_{frame}}{N}
$$
</div>

Diagram:

<div>
$$
\text{one frame}
\rightarrow
\underbrace{\Delta t + \Delta t + \Delta t + \cdots + \Delta t}_{8\ \text{substeps}}
$$
</div>

Smaller steps make the solver much more stable.
Roughly, I want each move to stay smaller than a ball radius:

<div>
$$
|\Delta \vec{x}|_{max} < r_{particle}
$$
</div>

## Collision response

I treat collisions as a position-fixing problem.
For two balls $i$ and $j$:

<div>
$$
\vec{\delta}_{ij} = \vec{x}_j - \vec{x}_i,
\qquad
d_{ij} = \|\vec{\delta}_{ij}\|
$$
</div>

If the distance is too small, they overlap:

<div>
$$
C(\vec{x}_i, \vec{x}_j) = d_{ij} - (r_i + r_j) < 0
$$
</div>

Then I push them apart along the collision normal:

<div>
$$
\hat{n} = \frac{\vec{\delta}_{ij}}{d_{ij}}
$$
</div>

The penetration depth is

<div>
$$
P = (r_i + r_j) - d_{ij}
$$
</div>

For equal-mass particles, I split the correction evenly:

<div>
$$
\Delta \vec{x}_i = -\frac{P}{2}\hat{n},
\qquad
\Delta \vec{x}_j = +\frac{P}{2}\hat{n}
$$
</div>

Picture:

<div>
$$
\circ\!\!\!\!\!\circ
\quad \Longrightarrow \quad
\circ \qquad \circ
$$
</div>

It is simple, but it is stable, and that matters more here.

## Spatial hashing

Checking every ball against every other ball is too slow.
That is

<div>
$$
\mathcal{O}(N^2)
$$
</div>

So I bucket particles into a grid first.

### Grid cell size

<div>
$$
\mathcal{G}_{size} = 2r_{max} + \varepsilon
$$
</div>

### Hash from world space to grid space

<div>
$$
H(x,y) = \left( \left\lfloor \frac{x}{\mathcal{G}_{size}} \right\rfloor, \left\lfloor \frac{y}{\mathcal{G}_{size}} \right\rfloor \right)
$$
</div>

So every particle lands in one cell.
Then I only search nearby cells.

Diagram:

<div>
$$
\begin{matrix}
(u-1,v+1) & (u,v+1) & (u+1,v+1) \\
(u-1,v)   & (u,v)   & (u+1,v)   \\
(u-1,v-1) & (u,v-1) & (u+1,v-1)
\end{matrix}
$$
</div>

For a particle in cell $(u,v)$, I only test against particles in this $3 \times 3$ neighborhood:

<div>
$$
S_{local} = \bigcup_{i=-1}^{1} \bigcup_{j=-1}^{1} \text{Cell}(u+i, v+j)
$$
</div>

That is the difference between unusable and fast enough.

## What mattered most

This was not meant to be a perfect physics engine.
It was meant to be:

- stable
- fast enough for lots of balls
- easy to tune visually

Verlet gives smooth motion.
Substeps keep it from blowing up.
Position projection keeps overlaps clean.
Spatial hashing keeps it fast.

That was enough to make the demos work.
