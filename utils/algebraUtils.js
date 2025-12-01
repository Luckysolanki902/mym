/**
 * Generate an algebraic equation to represent a number
 * Format: ax + b = c where x is the number
 * Coefficient 'a' is a prime number > 10
 * All values are natural numbers (positive integers)
 */

// Prime numbers greater than 10
const PRIME_COEFFICIENTS = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

/**
 * Generate equation for a given number
 * @param {number} actualNumber - The actual number to encode
 * @returns {object} - Equation components { coefficient, constant, result, solution }
 */
export const generateEquation = (actualNumber) => {
    // Ensure we're working with a positive integer
    const x = Math.max(1, Math.floor(actualNumber));
    
    // Pick a random prime coefficient > 10
    const a = PRIME_COEFFICIENTS[Math.floor(Math.random() * PRIME_COEFFICIENTS.length)];
    
    // Generate a random constant b (1 to 50)
    const b = Math.floor(Math.random() * 50) + 1;
    
    // Calculate result: ax + b = c
    const c = a * x + b;
    
    return {
        coefficient: a,      // e.g., 13
        constant: b,         // e.g., 19
        result: c,          // e.g., 28
        solution: x,        // The actual number (online count)
        equation: `${a}n + ${b} = ${c}`
    };
};

/**
 * Generate equation string for display
 * @param {number} actualNumber - The actual number
 * @returns {string} - Formatted equation
 */
export const getEquationString = (actualNumber) => {
    const { coefficient, constant, result } = generateEquation(actualNumber);
    return `${coefficient}n + ${constant} = ${result}`;
};

/**
 * Generate equation with hint about what x represents
 * @param {number} actualNumber - The actual number
 * @param {string} context - Context like "people online", "users waiting"
 * @returns {object} - Equation with context
 */
export const generateEquationWithContext = (actualNumber, context = "people online") => {
    const eq = generateEquation(actualNumber);
    return {
        ...eq,
        hint: `n ${context}`,
        fullText: `${eq.coefficient}n + ${eq.constant} = ${eq.result}`,
        solution: eq.solution
    };
};
