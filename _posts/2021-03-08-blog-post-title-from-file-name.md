## Fourier Series Approximation in C#

In this post, we'll explore how the Fourier series approximates a periodic function, such as a square wave, by summing sine and cosine terms. To help visualize this, we've embedded a video that demonstrates the Fourier series in action.

---

### Watch the Fourier Series in Action

Below is a video that shows how the Fourier series approximates a square wave with increasing terms.


<video width="600" controls>
  <source src="media/my_first_blog.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

Click play on the video to see how the approximation improves as we add more terms to the Fourier series.

---

### Fourier Series: What is it?

A Fourier series is a way to approximate a periodic function using sums of sine and cosine waves. Here's the formula for a general Fourier series:

\[
f(x) = a_0 + \sum_{n=1}^{N} \left( a_n \cos(n \omega x) + b_n \sin(n \omega x) \right)
\]

Where:
- \(a_0\) is the average (DC) component of the function.
- \(a_n\) and \(b_n\) are the Fourier coefficients.
- \( \omega \) is the frequency of the wave.

---

### Code Example: Fourier Series in C#

Here’s a simple C# program that computes the Fourier series approximation of a square wave:

```csharp
using System;

class FourierSeries
{
    public static void Main()
    {
        int N = 10; // Number of terms in the Fourier series
        double T = 2 * Math.PI; // Period of the function
        double a0 = 0; // DC component (a0 term)

        // Fourier series sum approximation
        double sum = a0 / 2;

        for (int n = 1; n <= N; n++)
        {
            // Calculate coefficients (an, bn) for a square wave
            double an = (2 / Math.PI) * (Math.Cos(n * Math.PI / 2) - Math.Cos(n * Math.PI));
            double bn = (2 / Math.PI) * (Math.Sin(n * Math.PI / 2) - Math.Sin(n * Math.PI));

            // Add the Fourier series terms
            sum += an * Math.Cos(n * T) + bn * Math.Sin(n * T);
        }

        Console.WriteLine($"Fourier Series Approximation (N={N} terms) for f(x): {sum}");
    }
}
