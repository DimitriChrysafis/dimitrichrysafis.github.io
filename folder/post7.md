# The 2 Demos<br /><br />
<video width="1000" controls autoplay muted>  <br />
  <source src="../media/post7/initial.mp4" type="video/mp4">  <br />
  Your browser does not support the video tag.  <br />
</video><br /><br />

<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
  <iframe 
    width="100%" 
    height="500" 
    src="https://www.youtube.com/embed/oEo6cb6Z4Oc" 
    frameborder="0" 
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen> 
  </iframe> 
</div>


## How does it work?<br /><br />
Before the video is recorded, a simulation is run with identical parameters. All circles are initially uncolored, creating a scene with uniform red balls. The following explanation breaks down the mathematics used for the physics simulation.<br /><br />

---<br /><br />

### 1. Understanding basic Verlet Integration<br /><br />
Verlet Integration updates the position of a particle using its current and previous positions, and the acceleration acting on it. This method does not require storing the velocity explicitly.<br /><br />

#### Standard Verlet Formula<br /><br />
The fundamental equation is given by:<br /><br />
$x(t+\Delta t) = 2\,x(t) - x(t-\Delta t) + a(t)\,\Delta t^2$<br /><br />
where:<br />
- $x(t)$ is the current position<br />
- $x(t-\Delta t)$ is the previous position<br />
- $a(t)$ is the acceleration at time $t$<br />
- $\Delta t$ is the time step<br /><br />

#### Derivation Using Taylor Series<br /><br />
The Taylor expansion of the position function about time $t$ is:<br /><br />
$x(t+\Delta t) = x(t) + v(t)\,\Delta t + \frac{1}{2}\,a(t)\,\Delta t^2 + O(\Delta t^3)$<br /><br />
Similarly, expanding backwards:<br /><br />
$x(t-\Delta t) = x(t) - v(t)\,\Delta t + \frac{1}{2}\,a(t)\,\Delta t^2 - O(\Delta t^3)$<br /><br />
Adding these two equations cancels the velocity terms:<br /><br />
$x(t+\Delta t) + x(t-\Delta t) = 2\,x(t) + a(t)\,\Delta t^2 + O(\Delta t^3)$<br /><br />
Neglecting the error term $O(\Delta t^3)$, we rearrange to obtain:<br /><br />
$x(t+\Delta t) = 2\,x(t) - x(t-\Delta t) + a(t)\,\Delta t^2$<br /><br />

#### Integration with Damping and Gravity<br /><br />
For the simulation, the update equations are modified to include damping and gravitational acceleration:<br /><br />
For the $x$-coordinate:<br /><br />
$x_{new} = x + (x - x_{prev}) \cdot v_{damp}$<br /><br />
For the $y$-coordinate:<br /><br />
$y_{new} = y + (y - y_{prev}) \cdot v_{damp} + g_{eff}\,\Delta t^2$<br /><br />
where:<br />
- $(x - x_{prev})$ is the implicit velocity<br />
- $v_{damp}$ is a damping coefficient (e.g., $0.95$ to reduce energy over time)<br />
- $g_{eff}$ is the effective gravitational acceleration<br /><br />

#### Time Step Subdivision<br /><br />
For enhanced stability, especially during collisions, the overall time step is divided into substeps. If the base time step is:<br /><br />
$\Delta t = \frac{1}{60}$ seconds<br /><br />
and there are $8$ substeps, then each substep is:<br /><br />
$\Delta t_{sub} = \frac{\Delta t}{8}$<br /><br />
Acceleration is then applied as $g_{eff}\,\Delta t_{sub}^2$, to make sure theres good precision.<br /><br />


---<br /><br />
### Extra code details on how it works (simple) <br /><br />

**Scene Setup**<br /><br />
- The simulation window is set to $W = 1920$ and $H = 1080$, so the total area is $A_{\text{window}} = W \times H$.<br /><br />
- A fill threshold (when it knows to stop pumping out balls) is defined as $A_{\text{threshold}} = 0.9 \times A_{\text{window}}$, which stops ball emission when the total ball area reaches this value.<br /><br />

**Emitter Positions and Ball Launching**<br /><br />
- There are $N_{\text{spouts}} = 10$ emitters, each positioned at<br /><br />
$E_i = \left(\left(i + \frac{1}{2}\right) \cdot \frac{W}{10},\, 50\right)$, for $i = 0,1,\dots,9$.<br /><br />
- Each ball is launched with an initial speed of $v_0 = 1000\ \text{pixels/s}$ and is affected by gravity $g = 900\ \text{pixels/s}^2$.<br /><br />

**Emission Angle Calculation**<br /><br />
- The emission process groups balls into batches. For ball number $n$, the batch is calculated as $ \text{batch} = \left\lfloor \frac{n}{N_{\text{spouts}}} \right\rfloor$ and the emission time as $t_e = \frac{\text{batch}}{60}$.<br /><br />
- The base angle is set to $45^\circ$ for emitters with index $i < \frac{N_{\text{spouts}}}{2}$ and $135^\circ$ otherwise.<br /><br />
- A small variation is introduced: $ \theta_{\text{var}} = \left( (n \bmod N_{\text{spouts}}) - \frac{N_{\text{spouts}}}{2} \right) \times 0.5$.<br /><br />
- An oscillatory offset is applied: $ \theta_{\text{osc}} = 40^\circ \cdot \sin\!\left(\frac{2\pi\, t_e}{5.0}\right)$, giving the total launch angle as $ \theta = \theta_{\text{base}} + \theta_{\text{var}} + \theta_{\text{osc}}$.<br /><br />

**Ball Initialization and Physics**<br /><br />
- Each ball gets a random radius $r \in [5,\,15]$ and a mass $m = 0.1$, with its area computed as $A_{\text{ball}} = \pi r^2$.<br /><br />
- The initial velocity components are determined by $v_x = 1000 \cos\theta$ and $v_y = 1000 \sin\theta$.<br /><br />
- Balls are emitted until the cumulative area $\sum_{\text{balls}} \pi r^2$ reaches or exceeds $A_{\text{threshold}}$.<br /><br />
- The physics engine uses the kinematic equations:<br /><br />
$\mathbf{p}(t+\Delta t) = \mathbf{p}(t) + \mathbf{v}(t)\,\Delta t + \frac{1}{2}\mathbf{g}\,(\Delta t)^2$<br /><br />
and<br /><br />
$\mathbf{v}(t+\Delta t) = \mathbf{v}(t) + \mathbf{g}\,\Delta t$, with $\Delta t = \frac{1}{60}$ seconds.<br /><br />

**Color Mapping from an Image**<br /><br />
- After the simulation settles, each ball's position $(x, y)$ is converted to relative coordinates: $x_{\text{rel}} = \frac{x}{W}$ and $y_{\text{rel}} = \frac{y}{H}$.<br /><br />
- These are mapped to the image dimensions by computing<br /><br />
$X = \lfloor x_{\text{rel}} \times (w_{\text{img}} - 1) \rfloor,\quad Y = \lfloor y_{\text{rel}} \times (h_{\text{img}} - 1) \rfloor$,<br /><br />
and a $3 \times 3$ pixel region is sampled to determine the ball's average color.<br /><br />

**Spout Geometry and Rendering**<br /><br />
- Each emitter's spout oscillates dynamically. At time $t$, its angle is given by<br /><br />
$\theta(t) = \theta_{\text{base}} + 40^\circ \cdot \sin\!\left(\frac{2\pi t}{5.0}\right)$.<br /><br />
- With a spout length $L = 30$ pixels, the tip is at<br /><br />
$T = \Bigl(e_x + L \cos\theta(t),\ e_y + L \sin\theta(t)\Bigr)$, and the base is rendered by offsetting the emitter’s position by half the spout width along the perpendicular vector to $\theta(t)$.<br /><br />

## Now for the second simulation

The second simulation is extremely similar logic just with 

---<br /><br />
## Random optimizations for anyone who cares <br /><br />

### NUMBA Acceleration<br /><br />
NUMBA JIT compiles Python functions into supa dupa fast machine code yay, speeding up physics stuff like `update_positions` and `collision_detection`.<br /><br />

### Spatial Partitioning<br /><br />
Instead of O(n²) collision checks, the simulation divides space into a grid, only testing collisions within the same or neighboring cells. [Click here for a good explanation](https://gameprogrammingpatterns.com/spatial-partition.html)
<br /><br />

### Multithreaded Video Recording<br /><br />
Rendering and video encoding run on a separate thread, with frames stored in a queue (`frameQueue`). 
This prevents I/O bottlenecks<br /><br />
