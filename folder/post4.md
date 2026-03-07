# Solving a Polynomial

This project takes a polynomial, turns it into a matrix, runs QR iteration, and reads off the roots.

[Link to the code](https://github.com/DimitriChrysafis/dimitrichrysafis.github.io/blob/main/media/post4/main.cpp)

The whole idea is

<div>
$$
\text{polynomial coefficients}
\rightarrow
\text{companion matrix}
\rightarrow
\text{QR iterations}
\rightarrow
\text{almost diagonal matrix}
\rightarrow
\text{roots}
$$
</div>

The key fact is simple:

<div>
$$
\text{roots of the polynomial} = \text{eigenvalues of the companion matrix}
$$
</div>

So instead of solving the polynomial directly, I solve an eigenvalue problem.

Start with

<div>
$$
P(x) = a_nx^n + a_{n-1}x^{n-1} + \dots + a_1x + a_0
$$
</div>

First normalize by the leading coefficient so the polynomial is monic. Then build the companion matrix. The version I use in code is

<div>
$$
C=
\begin{bmatrix}
-a_{n-1} & -a_{n-2} & \dots & -a_1 & -a_0 \\
1 & 0 & \dots & 0 & 0 \\
0 & 1 & \dots & 0 & 0 \\
\vdots & \vdots & \ddots & \vdots & \vdots \\
0 & 0 & \dots & 1 & 0
\end{bmatrix}
$$
</div>

That matrix has the same eigenvalues as the roots of the polynomial.

Take

<div>
$$
P(x)=x^4-10x^3+35x^2-50x+24
$$
</div>

The normalized coefficients are already

<div>
$$
1,\,-10,\,35,\,-50,\,24
$$
</div>

So the companion matrix becomes

<div>
$$
C=
\begin{bmatrix}
10 & -35 & 50 & -24 \\
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0
\end{bmatrix}
$$
</div>

At that point the polynomial problem is just a matrix problem.

For the current matrix $C_k$, compute

<div>
$$
C_k = Q_kR_k
$$
</div>

and then build the next matrix with

<div>
$$
C_{k+1} = R_kQ_k
$$
</div>

So the iteration looks like this:

<div>
$$
C_0
\rightarrow
Q_0R_0
\rightarrow
R_0Q_0 = C_1
\rightarrow
Q_1R_1
\rightarrow
R_1Q_1 = C_2
\rightarrow \cdots
$$
</div>

In the decomposition $C = QR$, the matrix $Q$ is orthogonal and $R$ is upper triangular. Every pass is basically

<div>
$$
\text{factor} \rightarrow \text{swap order} \rightarrow \text{repeat}
$$
</div>

That repeated reorder keeps the eigenvalues the same, but pushes the matrix toward upper-triangular / diagonal form.

I stop when the off-diagonal terms are tiny:

<div>
$$
|C_{ij}| < \varepsilon \qquad (i \neq j)
$$
</div>

with something like

<div>
$$
\varepsilon = 10^{-15}
$$
</div>

Once the matrix has basically converged,

<div>
$$
C_{final} \approx
\begin{bmatrix}
\lambda_1 & 0 & 0 & 0 \\
0 & \lambda_2 & 0 & 0 \\
0 & 0 & \lambda_3 & 0 \\
0 & 0 & 0 & \lambda_4
\end{bmatrix}
$$
</div>

then

<div>
$$
\{\lambda_1,\lambda_2,\lambda_3,\lambda_4\}
$$
</div>

are the roots.

For the example above, the roots are

<div>
$$
1,\,2,\,3,\,4
$$
</div>

That is why I like this approach. I do not need a separate closed-form trick for every degree. I just build the companion matrix, run QR until it settles, and read the diagonal.
