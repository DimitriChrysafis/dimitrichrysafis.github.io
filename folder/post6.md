## The fractals shown in this post

<br />

### <span style="color:#FF6347">Newton's Fractal</span>, [click here for web demo of Newton's fractal](https://dimitrichrysafis.github.io/media/post6/newton/combinedNewton.html)

<br />

### <span style="color:#1E90FF">Kleinian limit set-Maskit</span> [click here for web demo of Kleinian limit set-Maskit]( https://dimitrichrysafis.github.io/media/post6/notnewton/index.html)

<br />

### <span style="color:#32CD32">Julia Fractal</span>, still image, [click here for web demo of Julia (click to start)]( https://dimitrichrysafis.github.io/media/post6/misc/1.html)source code can be found here, done in swift for metal on apple gpus.

<br />

### <span style="color:#FFD700">A infinite(kind of) zoom on Julia Fractal</span>, once again in swift in the same repo as above https://github.com/DimitriChrysafis/Julia-Stuff ACTUAL SWIFT STUFF

<br />

### <span style="color:#8A2BE2">Mandelbulb</span>, done in glsl

<br />
<br />
<br />
<br />



---

### Starting W/Julia

The Julia set is defined by the recurrence

$$
z_{n+1} = z_n^2 + c, \\qquad z_0 \in \mathbb{C}, \quad c \in \mathbb{C}.
$$

---

A point escapes once

$$
|z_n| > 2.
$$

The filled Julia set for a fixed $\( c \)$ is

$$
K_c = \{\, z_0 \in \mathbb{C} : |z_n| \le 2 \text{ for all } n \,\}.
$$

The escape-time function is

$$
N(z_0) = \min \{\, n \in \mathbb{N} : |z_n| > 2 \,\} \quad (\text{if no such } n, \; N(z_0)=\infty).
$$

---

### Demo Expansion

Write

$$
z_0 = x_0 + i\,y_0 \quad \text{and} \quad c = a + i\,b.
$$

Then the first iterate is

$$
z_1 = (x_0^2 - y_0^2 + a) + i\,(2x_0y_0 + b).
$$

and the second is

$$
\begin{aligned}
z_2 &= \Bigl[(x_0^2 - y_0^2 + a)^2 - (2x_0y_0 + b)^2 + a\Bigr] \\
    &\quad + i\,\Bigl[\,2(x_0^2 - y_0^2 + a)(2x_0y_0 + b) + b\,\Bigr].
\end{aligned}
$$

After that it is just the same recurrence over and over.

<br />
---

### How to actually make the design

Pick a grid of starting points $\( z_0 \)$ in the complex plane.
Run the recurrence on each point.
Count how many iterations it takes to escape.
That count is $\( N(z_0) \)$.

Points with small $\( N(z_0) \)$ blow up fast.
Points that never escape, or take a very long time, are part of the filled Julia set.
Those are the points that define the picture.

<br />

<br />
---


<br />

# CLICK AND DRAG AROUND ANYWHERE ON THIS BLACK POSTER
# THE CHANGING OF C IS WHAT MAKES IT CHANGE
<iframe src="media/post6/misc/1.html" width="1000" height="400"></iframe>
---
Made in swift for metal
<iframe src="https://www.youtube.com/embed/MqJBRySBNvY" width="1000" height="1000" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>





<br />

---
## Newton's Method Iteration

Newton's method updates a point by

$$
z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}.
$$

For

$$
f(z) = z^3 - 1,
$$

we have

$$
f'(z) = 3z^2.
$$

So the iteration becomes

$$
z_{n+1} = z_n - \frac{z_n^3 - 1}{3z_n^2}.
$$

Starting from an initial guess $\( z_0 \)$, the iteration converges to one of the roots of $\( z^3 - 1 \)$.

---
<br />
### Improving the Convergence:
<br />

<br />
Initial guess matters a lot.
For $\( f(z) = z^3 - 1 \)$ there are three roots,
$\( z = 1, e^{2\pi i / 3}, e^{4\pi i / 3} \)$,
so the method usually converges to whichever root the starting point falls toward.

---

### Convergence Criterion

Iteration stops when

$$
|f(z_n)| < \varepsilon,
$$

for a small threshold $$\( \varepsilon > 0 \).$$


# CLICK AROUND HERE TO SEE THE CONVERGENCE PLEASE


<iframe src="media/post6/newton/combinedNewton.html" width="1000" height="400"></iframe>


# Kleinian Groups and Their Goofy Circle Patterns

A **Kleinian group** $\( G \)$ is a discrete subgroup of $\(\operatorname{PSL}(2,\mathbb{C})\)$. Its elements act on the Riemann sphere
$$
\widehat{\mathbb{C}} = \mathbb{C} \cup \{\infty\}
$$
by Möbius transformations. That is where the circular and fractal patterns come from.

---

## Möbius Transformations

A Möbius transformation is
$$
T(z) = \frac{az+b}{cz+d}, \quad a,b,c,d\in\mathbb{C}, \quad ad-bc\neq 0.
$$
A common normalization is
$$
ad - bc = 1.
$$
These maps send circles and lines to circles or lines, which is the main geometric reason the images look the way they do.

---

## Group Action

The group acts on the Riemann sphere by
$$
G \times \widehat{\mathbb{C}} \to \widehat{\mathbb{C}}, \quad (g, z) \mapsto g(z).
$$
Repeating those transformations produces the dense, self-similar patterns.

---

## Limit Set

For a point $\( z \in \widehat{\mathbb{C}} \)$, its orbit is
$$
G(z) = \{\, g(z) : g \in G \,\}.
$$
The **limit set** $\(\Lambda(G)\)$ is
$$
\Lambda(G) = \overline{G(z)} \setminus \{\text{isolated points}\},
$$
or equivalently,
$$
\Lambda(G) = \{\, w \in \widehat{\mathbb{C}} : \exists\, \{g_n\} \subset G \text{ with } g_n(z) \to w \,\}.
$$

---

## Domain of Discontinuity

The **domain of discontinuity** is
$$
\Omega(G) = \widehat{\mathbb{C}} \setminus \Lambda(G).
$$
On $\(\Omega(G)\)$, the action of $\( G \)$ is properly discontinuous:
$$
\forall\, z \in \Omega(G), \quad \exists\, U \ni z \text{ such that } \{\, g \in G : g(U) \cap U \neq \varnothing \,\} \text{ is finite.}
$$

---

## Generating Circular Patterns

The circular look comes from two things:

**Circle Preservation:**  
   Möbius transformations preserve circles and lines, so repeated application keeps producing circular arcs and circles.

**Inversions and Reflections:**  
   Many elements of Kleinian groups can be viewed as inversions in circles. An inversion in a circle $\( C \)$ with center $\( c \)$ and radius $\( r \)$ is
   $$
   z \mapsto c + \frac{r^2}{\overline{z-c}},
   $$
   which swaps the inside and outside of the circle.

   
<iframe src="media/post6/notnewton/index.html" width="1000" height="400"></iframe>
<img src="../media/post6/freezeframe2.png" width="700" height="1800">


# im highkey lazy i do NOT wanna be writing this up

<video width="1000" controls>  
  <source src="../media/post6/bulb.mp4" type="video/mp4">
</video>  
