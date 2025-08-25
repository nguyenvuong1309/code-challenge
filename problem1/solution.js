// Problem 1: Three ways to sum to n

var sum_to_n_a = function (n) {
  // Iterative approach using for loop
  if (n <= 0) return 0;
  
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  // Mathematical formula: n * (n + 1) / 2
  if (n <= 0) return 0;
  
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  // Recursive approach
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  return n + sum_to_n_c(n - 1);
};

// Test cases
console.log('Testing sum_to_n_a:');
console.log('sum_to_n_a(5) =', sum_to_n_a(5)); // Should be 15
console.log('sum_to_n_a(1) =', sum_to_n_a(1)); // Should be 1
console.log('sum_to_n_a(0) =', sum_to_n_a(0)); // Should be 0

console.log('\nTesting sum_to_n_b:');
console.log('sum_to_n_b(5) =', sum_to_n_b(5)); // Should be 15
console.log('sum_to_n_b(1) =', sum_to_n_b(1)); // Should be 1
console.log('sum_to_n_b(0) =', sum_to_n_b(0)); // Should be 0

console.log('\nTesting sum_to_n_c:');
console.log('sum_to_n_c(5) =', sum_to_n_c(5)); // Should be 15
console.log('sum_to_n_c(1) =', sum_to_n_c(1)); // Should be 1
console.log('sum_to_n_c(0) =', sum_to_n_c(0)); // Should be 0