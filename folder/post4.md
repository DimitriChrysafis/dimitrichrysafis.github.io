# Companion Matrix Explanation
 
The **companion matrix** is a square matrix associated with a polynomial whose eigenvalues correspond to the roots of the polynomial. By constructing the companion matrix and solving for its eigenvalues, we can find the roots of the polynomial.

---

## Example: 

Consider the polynomial \( P(x) = x^4 - 10x^3 + 35x^2 - 50x + 24 \). We will build the companion matrix for this polynomial and find its eigenvalues, which are the roots of the polynomial.

### Step 1: Construct the Companion Matrix

Given the polynomial \( P(x) = x^4 - 10x^3 + 35x^2 - 50x + 24 \), the coefficients are:

$$
a_4 = 1, \quad a_3 = -10, \quad a_2 = 35, \quad a_1 = -50, \quad a_0 = 24
$$

The companion matrix \( C \) is constructed as follows:

1. Normalize the coefficients by dividing each by the leading coefficient \( a_4 = 1 \) (no change in coefficients here).
2. Place ones on the subdiagonal.
3. The first row contains the normalized coefficients in reverse order, negated.

Thus, the companion matrix \( C \) is:

$$
C = 
\begin{bmatrix}
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1 \\
-24 & -50 & -35 & -10
\end{bmatrix}
$$

---

### Step 2: Find the Eigenvalues

To find the eigenvalues of the companion matrix \( C \), solve the characteristic equation:

$$
\text{det}(C - \lambda I) = 0
$$

This is equivalent to:

$$
\begin{vmatrix}
-\lambda & 1 & 0 & 0 \\
0 & -\lambda & 1 & 0 \\
0 & 0 & -\lambda & 1 \\
-24 & -50 & -35 & -10-\lambda
\end{vmatrix} = 0
$$

Expanding the determinant:

$$
-\lambda \begin{vmatrix}
-\lambda & 1 & 0 \\
-50 & -35 & -10-\lambda \\
0 & -\lambda & 1
\end{vmatrix} + 1 \begin{vmatrix}
0 & 1 & 0 \\
-24 & -50 & -35 \\
-50 & -35 & -10-\lambda
\end{vmatrix} = 0
$$

This leads to the characteristic equation:

$$
-\lambda^4 + 10\lambda^3 - 35\lambda^2 + 50\lambda - 24 = 0
$$

---

### Step 3: Solve for the Roots

Solving the characteristic equation, the roots of \( P(x) \) (and the eigenvalues of \( C \)) are:

$$
\lambda_1 = 2, \quad \lambda_2 = 3, \quad \lambda_3 = 4, \quad \lambda_4 = 1
$$

Thus, the roots of the polynomial \( P(x) = x^4 - 10x^3 + 35x^2 - 50x + 24 \) are \( 2, 3, 4, 1 \).

---

## Conclusion

The companion matrix \( C \) for the polynomial \( P(x) = x^4 - 10x^3 + 35x^2 - 50x + 24 \) has eigenvalues \( 2, 3, 4, 1 \), which correspond to the roots of the polynomial.

