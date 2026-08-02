// string + number = string (concatenation)
// string + boolean = string (concatenation)
// string + int  = string (concatenation)

let S1 = "hello";
let S2 = " world";

console.log( S1 + S2);
console.log( typeof (S1 + S2));
// helloworld
// string

let S3 = 10;

console.log( S1 + S3);
// hello10
// string


//int + int = int (arithmetic addition)
 
let temp1 = 10;
let temp2 = 20;
console.log ( typeof (temp1 + temp2));
// 30
// number

// operating 

let a=10;
let b=20;
console.log("the sum of  "+ a + " and " + b + " is " + a + b) ;
console.log("the sum of  "+ a + " and " + b + " is " + (a + b)) ;

// the sum of  10 and 20 is 1020
// the sum of  10 and 20 is 30 

//
console.log("1" + 1);
console.log("1" - 1);

// 11


let prompt = require("prompt-sync")();

let aoge =Number (prompt ("Enter your age: "));
console.log (`age is ${aoge}`);