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

The Julia set is simply just defined by the recurrence relation:

$$
z_{n+1} = z_n^2 + c, \qquad z_0 \in \mathbb{C}, \quad c \in \mathbb{C}.
$$

---

If you watch actual manim renders of it, you can better visualize the escape criterios. Just know the sequence diverges if:

$$
|z_n| > 2 \quad \Longrightarrow \quad \text{diverges}.
$$


The filled Julia set for a given $\( c \)$ is defined as:

$$
K_c = \{\, z_0 \in \mathbb{C} : |z_n| \le 2 \text{ for all } n \,\}.
$$

Define the iteration count function $\( N(z_0) \)$ as:

$$
N(z_0) = \min \{\, n \in \mathbb{N} : |z_n| > 2 \,\} \quad (\text{if no such } n, \; N(z_0)=\infty).
$$

---

### Demo Expansion

Let

$$
z_0 = x_0 + i\,y_0 \quad \text{and} \quad c = a + i\,b.
$$

Then the first iterations are:

1. **Iteration 1:**

   $$
   z_1 = (x_0^2 - y_0^2 + a) + i\,(2x_0y_0 + b).
   $$

2. **Iteration 2:**

$$
\begin{aligned}
z_2 &= \Bigl[(x_0^2 - y_0^2 + a)^2 - (2x_0y_0 + b)^2 + a\Bigr] \\
    &\quad + i\,\Bigl[\,2(x_0^2 - y_0^2 + a)(2x_0y_0 + b) + b\,\Bigr].
\end{aligned}
$$


The process continues similarly for higher iterations.

<br />
---

### How to actually make the design
Just start by making a code to pick a grid of initial points $\( z_0 \)$ in the complex plane. Each of these points will be tested through the iterative process described above.

<br />

#### Iteration and Escape Time:
For each point $\( z_0 \)$, we apply the recurrence
$ z_{n+1} = z_n^2 + c. $
We kep track of how many iterations it takes until the point “escapes” (i.e., when
$
|z_n| > 2).
$
This count is $\( N(z_0) \).$

<br />
Points for which $( N(z_0) )$ is very low diverge quickly.
Points that never escape (or require a very large number of iterations) are considered part of the filled Julia set and we draw them


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

Newton's method for finding the roots of a function $\( f(z) \)$ is given by the iterative formula:

$$
z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}.
$$

### Example: $\( f(z) = z^3 - 1 \)$

Let’s consider the function:

$$
f(z) = z^3 - 1.
$$

First, we need to compute its derivative:

$$
f'(z) = \frac{d}{dz}(z^3 - 1) = 3z^2.
$$

Now, we can plug these into the Newton’s method formula:

$$
z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)} = z_n - \frac{z_n^3 - 1}{3z_n^2}.
$$

This gives us the iterative process:

$$
z_{n+1} = z_n - \frac{z_n^3 - 1}{3z_n^2}.
$$

Thus, starting with an initial guess $\( z_0 \)$, we can apply this iteration to converge to one of the roots of $\( f(z) = z^3 - 1 \)$.

---
<br />
### Improving the Convergence:
<br />

<br />
Initial Guess: The convergence of Newton's method heavily depends on the choice of the initial guess $\( z_0 \)$. 
Multiple Roots: For $\( f(z) = z^3 - 1 \)$, there are three roots: $\( z = 1, e^{2\pi i / 3}, e^{4\pi i / 3} \)$, so the method will converge to the root closest to the starting point.

---

### Convergence Criterion

Iteration stops when:

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
via Möbius transformations. These actions often generate intricate, circular, and fractal patterns.

---

## 1. Möbius Transformations

A Möbius transformation \( T \) is defined by
$$
T(z) = \frac{az+b}{cz+d}, \quad a,b,c,d\in\mathbb{C}, \quad ad-bc\neq 0.
$$
A common normalization is
$$
ad - bc = 1.
$$
These transformations map circles and lines in $\(\widehat{\mathbb{C}}\)$ to circles or lines, which is the key to the circular patterns observed.

---

## 2. Group Action

The group $\( G \)$ acts on the Riemann sphere by
$$
G \times \widehat{\mathbb{C}} \to \widehat{\mathbb{C}}, \quad (g, z) \mapsto g(z).
$$
The repeated action of different Möbius transformations from \( G \) produces complex and often self-similar images.

---

## 3. Limit Set

For any point $\( z \in \widehat{\mathbb{C}} \)$, the orbit is defined as
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

## 4. Domain of Discontinuity

TJA **domain of discontinuity** is given by
$$
\Omega(G) = \widehat{\mathbb{C}} \setminus \Lambda(G).
$$
On $\(\Omega(G)\)$, the action of $\( G \)$ is properly discontinuous:
$$
\forall\, z \in \Omega(G), \quad \exists\, U \ni z \text{ such that } \{\, g \in G : g(U) \cap U \neq \varnothing \,\} \text{ is finite.}
$$

---

## 5. Generating Circular Patterns

The circular patterns emerge because:

1. **Circle Preservation:**  
   Möbius transformations preserve circles (and straight lines). Hence, even after repeated applications, the images of circles remain circles or become circular arcs.

2. **Inversions and Reflections:**  
   Many elements of Kleinian groups can be seen as inversions in circles. An inversion in a circle $\( C \)$ (with center $\( c \)$ and radius $\( r \))$ is given by
   $$
   z \mapsto c + \frac{r^2}{\overline{z-c}},
   $$
   which maps the exterior of \( C \) to its interior and vice versa. 

   
<iframe src="media/post6/notnewton/index.html" width="1000" height="400"></iframe>
<img src="../media/post6/freezeframe2.png" width="700" height="1800">


# im highkey lazy i do NOT wanna be writing this up

<video width="1000" controls>  
  <source src="../media/post6/bulb.mp4" type="video/mp4">
</video>  
