# Heat Equation Solution

$$ \frac{\partial u}{\partial t} = \alpha \frac{\partial^2 u}{\partial x^2}, \quad 0 < x < L, \quad t > 0 $$

$$ u(0,t) = 0, \quad u(L,t) = 0 $$

$$ u(x,0) = f(x) = \sin(\frac{\pi x}{L}) $$

$$\begin{align*}
u(x,t) &= X(x)T(t) \\
\frac{\partial u}{\partial t} &= X(x)\frac{dT}{dt} \\
\frac{\partial^2 u}{\partial x^2} &= T(t)\frac{d^2X}{dx^2}
\end{align*}$$

$$ \frac{1}{\alpha}\frac{1}{T}\frac{dT}{dt} = \frac{1}{X}\frac{d^2X}{dx^2} = -\lambda^2 $$

$$ \frac{d^2X}{dx^2} + \lambda^2X = 0 $$
$$ \frac{dT}{dt} + \alpha\lambda^2T = 0 $$

$$ X(x) = A\sin(\lambda x) + B\cos(\lambda x) $$
$$ X(0) = 0 \implies B = 0 $$
$$ X(L) = 0 \implies \lambda_n = \frac{n\pi}{L}, \quad n = 1,2,3,... $$

$$ X_n(x) = \sin(\frac{n\pi x}{L}) $$

$$ T_n(t) = e^{-\alpha(\frac{n\pi}{L})^2t} $$

$$ u(x,t) = \sum_{n=1}^{\infty} c_n\sin(\frac{n\pi x}{L})e^{-\alpha(\frac{n\pi}{L})^2t} $$

$$ f(x) = \sum_{n=1}^{\infty} c_n\sin(\frac{n\pi x}{L}) $$

$$ c_n = \frac{2}{L}\int_0^L f(x)\sin(\frac{n\pi x}{L})dx $$

$$ c_n = \frac{2}{L}\int_0^L \sin(\frac{\pi x}{L})\sin(\frac{n\pi x}{L})dx $$

$$ c_1 = 1, \quad c_n = 0 \text{ for } n > 1 $$

$$ u(x,t) = \sin(\frac{\pi x}{L})e^{-\alpha(\frac{\pi}{L})^2t} $$

$$ \begin{pmatrix}
\text{Verification:} \\
u(0,t) = 0 \\
u(L,t) = 0 \\
u(x,0) = \sin(\frac{\pi x}{L}) \\
\end{pmatrix} $$

$$ \boxed{u(x,t) = \sin(\frac{\pi x}{L})e^{-\alpha(\frac{\pi}{L})^2t}} $$