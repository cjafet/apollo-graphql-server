// You are climbing a staircase. It takes n steps to reach the top.

// Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?


// Example 1:

// Input: n = 2
// Output: 2
// Explanation: There are two ways to climb to the top.
// 1. 1 step + 1 step
// 2. 2 steps
// Example 2:

// Input: n = 3
// Output: 3
// Explanation: There are three ways to climb to the top.
// 1. 1 step + 1 step + 1 step
// 2. 1 step + 2 steps
// 3. 2 steps + 1 step

let fibo = [];

climb = steps => {
    fibo.push(steps);
    if (fibo.length>0) {
        let len = fibo.length;
    }
    console.log(fibo);
    if (fibo.length > 1) {
        console.log(fibo[fibo.length-1]);
    }
    console.log(fibo);
}

climb(1);
climb(2);
climb(3);
climb(4);
climb(5);

