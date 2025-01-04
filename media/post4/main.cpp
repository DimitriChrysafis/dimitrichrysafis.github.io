#include <iostream>
#include <vector>
#include <cmath>
#include <stdexcept>
#include <string>
#include <sstream>

using namespace std;

vector<vector<double>> createCompanionMatrix(const vector<double>& coefficients) {
    int degree = coefficients.size() - 1;
    if (degree < 1) {
        throw invalid_argument("DEG MUST BE AT LEAST 1");
    }

    double leadingCoefficient = coefficients[0];
    vector<double> normalizedCoefficients(degree + 1);
    for (int i = 0; i <= degree; ++i) {
        normalizedCoefficients[i] = coefficients[i] / leadingCoefficient;
    }

    vector<vector<double>> companionMatrix(degree, vector<double>(degree, 0));

    for (int i = 1; i < degree; ++i) {
        companionMatrix[i][i - 1] = 1;
    }

    for (int i = 0; i < degree; ++i) {
        companionMatrix[0][i] = -normalizedCoefficients[i + 1];
    }

    return companionMatrix;
}

bool isDiagonal(const vector<vector<double>>& matrix, double tolerance) {
    for (size_t i = 0; i < matrix.size(); ++i) {
        for (size_t j = 0; j < matrix.size(); ++j) {
            if (i != j && abs(matrix[i][j]) > tolerance) {
                return false;
            }
        }
    }
    return true;
}

pair<vector<vector<double>>, vector<vector<double>>> qrDecomposition(vector<vector<double>>& matrix, double tolerance) {
    int size = matrix.size();
    vector<vector<double>> q(size, vector<double>(size, 0));
    vector<vector<double>> r = matrix;

    for (int i = 0; i < size; ++i) {
        q[i][i] = 1;
    }

    for (int i = 0; i < size - 1; ++i) {
        for (int j = i + 1; j < size; ++j) {
            if (abs(r[j][i]) < tolerance) {
                continue;
            }
            double theta = sqrt(r[i][i] * r[i][i] + r[j][i] * r[j][i]);
            double c = r[i][i] / theta;
            double s = -r[j][i] / theta;
            for (int k = 0; k < size; ++k) {
                double temp = c * q[k][i] - s * q[k][j];
                q[k][j] = s * q[k][i] + c * q[k][j];
                q[k][i] = temp;
            }
            for (int k = i; k < size; ++k) {
                double temp = c * r[i][k] - s * r[j][k];
                r[j][k] = s * r[i][k] + c * r[j][k];
                r[i][k] = temp;
            }
        }
    }
    return {q, r};
}

vector<double> computeEigenvalues(vector<vector<double>>& matrix, double tolerance = 1e-15, int maxIterations = 10000) {
    vector<vector<double>> currentMatrix = matrix;

    for (int iter = 0; iter < maxIterations; ++iter) {
        auto [q, r] = qrDecomposition(currentMatrix, tolerance);
        currentMatrix = vector<vector<double>>(currentMatrix.size(), vector<double>(currentMatrix.size(), 0));

        for (size_t i = 0; i < matrix.size(); ++i) {
            for (size_t j = 0; j < matrix.size(); ++j) {
                for (size_t k = 0; k < matrix.size(); ++k) {
                    currentMatrix[i][j] += r[i][k] * q[k][j];
                }
            }
        }

        if (isDiagonal(currentMatrix, tolerance)) {
            break;
        }
    }

    vector<double> eigenvalues;
    for (size_t i = 0; i < currentMatrix.size(); ++i) {
        eigenvalues.push_back(currentMatrix[i][i]);
    }
    return eigenvalues;
}

vector<double> refineRoots(const vector<double>& roots, double epsilon = 1e-10) {
    vector<double> refinedRoots;
    for (double root : roots) {
        refinedRoots.push_back(abs(root - round(root)) < epsilon ? round(root) : root);
    }
    return refinedRoots;
}

vector<double> findPolynomialRoots(const vector<double>& coefficients) {
    vector<vector<double>> companionMatrix = createCompanionMatrix(coefficients);
    vector<double> eigenvalues = computeEigenvalues(companionMatrix);
    return refineRoots(eigenvalues);
}

string formatPolynomial(const vector<double>& coefficients) {
    int degree = coefficients.size() - 1;
    vector<string> terms;

    for (int i = 0; i <= degree; ++i) {
        double coeff = coefficients[i];
        int power = degree - i;
        if (coeff != 0) {
            if (power > 0) {
                terms.push_back(to_string(coeff) + "x^" + to_string(power));
            } else {
                terms.push_back(to_string(coeff));
            }
        }
    }

    stringstream ss;
    for (size_t i = 0; i < terms.size(); ++i) {
        ss << terms[i];
        if (i < terms.size() - 1) {
            ss << " + ";
        }
    }
    return ss.str();
}

int main() {
    vector<double> polynomialCoefficients = {1, -6, 11, -6};
    vector<double> roots = findPolynomialRoots(polynomialCoefficients);

    string formattedPolynomial = formatPolynomial(polynomialCoefficients);

    cout << "Polynomial: " << formattedPolynomial << endl;
    cout << "Roots: ";
    for (double root : roots) {
        cout << root << " ";
    }
    cout << endl;

    return 0;
}

