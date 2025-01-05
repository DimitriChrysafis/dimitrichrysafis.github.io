# Version 1 Of Polynomial Solver

In this post, I will break down a simple method (with code) that:

- Breaks into the companion matrix
- Gets eigenvalues
- Converges
- Provides the answer

[Link to the code](https://github.com/DimitriChrysafis/dimitrichrysafis.github.io/blob/main/media/post4/main.cpp)


<br />


### Companion Matrix (a square matrix whose eigenvalues are the roots of the polynomial)

<br />

---

<br />

### Companion Matrix Construction
For a polynomial $ P(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0 $, the companion matrix $ C $ is:

$$
C = 
\begin{bmatrix}
0 & 1 & 0 & \dots & 0 \\\\
0 & 0 & 1 & \dots & 0 \\\\
\vdots & \vdots & \vdots & \ddots & \vdots \\\\
-\frac{a_0}{a_n} & -\frac{a_1}{a_n} & \dots & -\frac{a_{n-1}}{a_n} & 0
\end{bmatrix}
$$

---

## Example

For the polynomial:

$$
P(x) = x^4 - 10x^3 + 35x^2 - 50x + 24
$$

The coefficients are:

$$
a_4 = 1, \quad a_3 = -10, \quad a_2 = 35, \quad a_1 = -50, \quad a_0 = 24
$$

1. Normalize the coefficients (divide by $ a_4 = 1 $):


$$
\text{Normalized coefficients: } 1, -10, 35, -50, 24
$$

2. Construct the companion matrix:

$$
C = 
\begin{bmatrix}
0 & 1 & 0 & 0 \\\\
0 & 0 & 1 & 0 \\\\
0 & 0 & 0 & 1 \\\\
-24 & -50 & -35 & -10
\end{bmatrix}
$$

---

## Eigenvalues

The eigenvalues of $\( C \)$ are the roots of $\( P(x) \)$. Solving for the eigenvalues yields the roots of the polynomial.

<br />

---
# Eigenvalues Using the QR Algorithm

The QR algorithm iteratively computes the eigenvalues of a matrix. Let’s break down the steps for finding eigenvalues of the companion matrix.

<br />

---

### Step 1: Matrix Decomposition

For a given matrix \( C \), the QR decomposition involves writing it as the product of two matrices:

$$
C = QR
$$

<br />

where:

<br />

- $\( Q \)$ is an **orthogonal matrix**, meaning $\( Q^T Q = I \)$, where $\( I \)$ is the identity matrix.
- $\( R \)$ is an **upper triangular matrix**, meaning all elements below the main diagonal are zero.

<br />

For example, consider the matrix $\( C \)$:

<br />

Given the matrix \( C \):

$$
C = 
\begin{bmatrix}
1 & 2 \\\\
3 & 4
\end{bmatrix}
$$

We perform QR decomposition to express \( C \) as the product of two matrices \( Q \) and \( R \), where:

$$
C = Q \cdot R
$$

### Step 1: Compute the first column of \( Q \)

We begin by computing the first column of \( Q \), denoted \( q_1 \). This is the normalized version of the first column of \( C \), denoted \( c_1 \).

The first column of \( C \) is:

$$
c_1 = \begin{bmatrix} 1 \\\\ 3 \end{bmatrix}
$$

We compute the norm of \( c_1 \):

$$
\| c_1 \| = \sqrt{1^2 + 3^2} = \sqrt{10}
$$

Now, normalize \( c_1 \) to obtain \( q_1 \):

$$
q_1 = \frac{1}{\| c_1 \|} \cdot c_1 = \frac{1}{\sqrt{10}} \cdot \begin{bmatrix} 1 \\\\ 3 \end{bmatrix} = \begin{bmatrix} 0.3162 \\ 0.9487 \end{bmatrix}
$$

Thus, the first column of \( Q \) is:

$$
q_1 = \begin{bmatrix} 0.3162 \\\\ 0.9487 \end{bmatrix}
$$

### Step 2: Compute the second column of \( Q \)

Next, we compute the second column of \( Q \), denoted \( q_2 \). We first find the component of the second column of \( C \) that is orthogonal to \( q_1 \).

The second column of \( C \) is:

$$
c_2 = \begin{bmatrix} 2 \\\\ 4 \end{bmatrix}
$$

#### Step 2a: Find the projection of \( c_2 \) onto \( q_1 \)

The projection of \( c_2 \) onto \( q_1 \) is:

$$
\text{proj}_{q_1}(c_2) = \left( \frac{c_2^T q_1}{q_1^T q_1} \right) q_1
$$

Since \( q_1^T q_1 = 1 \) (because \( q_1 \) is a unit vector), we compute \( c_2^T q_1 \):

$$
c_2^T q_1 = 2 \times 0.3162 + 4 \times 0.9487 = 0.6324 + 3.7948 = 4.4272
$$

Thus, the projection is:

$$
\text{proj}_{q_1}(c_2) = 4.4272 \cdot \begin{bmatrix} 0.3162 \\\\ 0.9487 \end{bmatrix} = \begin{bmatrix} 1.4 \\ 4.2 \end{bmatrix}
$$

#### Step 2b: Subtract the projection from \( c_2 \)

Now, subtract the projection from \( c_2 \) to get the component of \( c_2 \) that is orthogonal to \( q_1 \):

$$
v_2 = c_2 - \text{proj}_{q_1}(c_2) = \begin{bmatrix} 2 \\\\ 4 \end{bmatrix} - \begin{bmatrix} 1.4 \\ 4.2 \end{bmatrix} = \begin{bmatrix} 0.6 \\ -0.2 \end{bmatrix}
$$

#### Step 2c: Normalize \( v_2 \) to obtain \( q_2 \)

Next, we normalize \( v_2 \) to obtain \( q_2 \):

$$
\| v_2 \| = \sqrt{(0.6)^2 + (-0.2)^2} = \sqrt{0.36 + 0.04} = \sqrt{0.4} = 0.6325
$$

Thus, the second column of \( Q \) is:

$$
q_2 = \frac{1}{0.6325} \cdot \begin{bmatrix} 0.6 \\\\ -0.2 \end{bmatrix} = \begin{bmatrix} 0.9487 \\ -0.3162 \end{bmatrix}
$$

### Step 3: Construct the matrix \( Q \)

We now have the columns of \( Q \):

$$
Q = 
\begin{bmatrix}
0.3162 & 0.9487 \\\\
0.9487 & -0.3162
\end{bmatrix}
$$

### Step 4: Compute the matrix \( R \)

Now, we compute the upper triangular matrix \( R \), where the elements are given by the dot products of the columns of \( C \) with the corresponding columns of \( Q \):

$$
R_{ij} = q_i^T c_j
$$

#### First row of \( R \):

$$
R_{11} = q_1^T c_1 = 0.3162 \times 1 + 0.9487 \times 3 = 0.3162 + 2.8461 = 3.1623
$$
$$
R_{12} = q_1^T c_2 = 0.3162 \times 2 + 0.9487 \times 4 = 0.6324 + 3.7948 = 4.4272
$$

#### Second row of \( R \):

$$
R_{22} = q_2^T c_2 = 0.9487 \times 2 + (-0.3162) \times 4 = 1.8974 - 1.2648 = 0.6325
$$

Thus, the matrix \( R \) is:

$$
R = 
\begin{bmatrix}
3.1623 & 4.4272 \\\\
0 & 0.6325
\end{bmatrix}
$$

### Final Result

The QR decomposition of \( C \) is:

$$
Q = 
\begin{bmatrix}
0.3162 & 0.9487 \\\\
0.9487 & -0.3162
\end{bmatrix}
\quad \text{and} \quad 
R = 
\begin{bmatrix}
3.1623 & 4.4272 \\\\
0 & 0.6325
\end{bmatrix}
$$

Thus, \( C \) is the product of \( Q \) and \( R \), confirming the QR decomposition.

<br />

The goal of the QR decomposition is to separate the matrix $\( C \)$ into $\( Q \)$ (orthogonal) and \( R \) (upper triangular), which will allow us to iteratively improve the matrix.

<br />

---

### Step 2: Iteration Process

After the decomposition, the next step is to form the new matrix $\( C_{\text{new}} \):$

<br />

$$
C_{\text{new}} = RQ
$$

<br />

This new matrix is the result of multiplying the upper triangular matrix \( R \) with the orthogonal matrix \( Q \). The key idea is that this operation will gradually make the matrix approach a diagonal form as the iterations progress.

<br />

---

### Step 3: Convergence


$$
|C_{ij}| < \epsilon \quad \text{for} \quad i \neq j
$$

where $\( \epsilon \)$ is the tolerance (e.g., $\( \epsilon = 10^{-15} \))$.

<br />

---

### Step 4: Eigenvalues

Once the matrix is sufficiently diagonal, the eigenvalues are the diagonal elements of the matrix. These eigenvalues correspond to the roots of the polynomial. 

<br />

---

### Example Walkthrough

Consider the companion matrix \( C \) for a polynomial:

$$
C = 
\begin{bmatrix}
0 & 1 & 0 & 0 \\\\
0 & 0 & 1 & 0 \\\\
0 & 0 & 0 & 1 \\\\
-24 & -50 & -35 & -10
\end{bmatrix}
$$

<br />

We want to find the eigenvalues of this matrix using the QR algorithm.

1. **First Iteration:**
   Perform the QR decomposition on \( C \):

   $$ C = QR $$

   Let’s say we find:

   $$
   Q = 
   \begin{bmatrix}
   0.57 & 0.80 & 0.22 & 0.17 \\\\
   0.52 & -0.17 & 0.81 & -0.20 \\\\
   0.55 & 0.56 & 0.53 & -0.35 \\\\
   0.34 & 0.19 & -0.30 & 0.87
   \end{bmatrix}
   \quad \text{and} \quad 
   R = 
   \begin{bmatrix}
   -26.62 & -56.79 & -39.18 & -15.49 \\\\
   0 & -1.67 & 10.24 & -5.17 \\\\
   0 & 0 & 4.53 & 10.58 \\\\
   0 & 0 & 0 & 4.82
   \end{bmatrix}
   $$

<br />

   Now compute $\( C_{\text{new}} = RQ \).$

<br />

2. **Subsequent Iterations:**
   Repeat the process by computing the QR decomposition on $\( C_{\text{new}} \)$. After a few iterations, the matrix will converge and become nearly diagonal.

<br />

3. **Final Matrix:**
   After convergence, $\( C_{\text{new}} \)$ will look something like this:

   $$
   C_{\text{new}} = 
   \begin{bmatrix}
   \lambda_1 & 0 & 0 & 0 \\\\
   0 & \lambda_2 & 0 & 0 \\\\
   0 & 0 & \lambda_3 & 0 \\\\
   0 & 0 & 0 & \lambda_4
   \end{bmatrix}
   $$

   The values $\( \lambda_1, \lambda_2, \lambda_3, \lambda_4 \)$ on the diagonal are the eigenvalues of \( C \), which are the roots of the polynomial.

<br />


---

This process yields the eigenvalues of the companion matrix, which correspond to the roots of the original polynomial.
