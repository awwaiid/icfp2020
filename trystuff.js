

let inc = (n) => n + 1;
let dec = (n) => n - 1;

// let add = (add, n)

//let ap = (f) => (x) => f(x);
let ap = (f,x) => f(x);


// function ap(f) {
//     return function(x) {
//         return f(x);
//     }
// }
// ap(inc)(ap(inc)(0))

function is(desc, a, b) {
    if (a === b) {
        console.log("OK # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

// ap inc ap inc 0   =   2
is( "#17 and #5 function application example 1", ap(inc,ap(inc,0)), 2 );

// ap inc ap inc ap inc 0   =   3

is( "#17 and #5 ex 2",
    ap (inc, ap (inc,ap (inc,0))),
    3);


// Brock's Guess from vague 2003 lambda calculus memories

is( "#6 Predenssor example", ap(dec,2), 1);

let t = (x) => (y) => x;
let f = (x) => (y) => y;

//ap ap t 1 5   =  1
is( "#21 K combinator example", ap(ap(t,1), 5), 1);

//ap ap t ap inc 5 t   =   6
is( "#21 K combinator last example", ap(ap(t, ap(inc, 5)), t), 6);

//is( "#21 K combinator last example 2", ap(ap(t(ap(inc (5)),t))), 6);

//ap(ap(t(ap(inc (5)),t)

// ((((ap ap) t) ap) inc) 5) t )  =   6
// ap ap (t ap (inc 5 t))   =   6


// ap (ap (t (t, ap (inc (5))))))

// ap(ap)( t(t)(ap(inc)(5)) )

//ap ap t x0 x1   =   x0

//ap ap t ap inc 5 t   =   6


//ap ap f x0 x1   =   x1
is( "#22 False example", ap(ap(f,1), 5), 5);

// s
// ap ap ap s x0 x1 x2   =   ap ap x0 x2 ap x1 x2
// ap ap ap s add inc 1   =   3
// ap ap ap s mul ap add 1 6   =   42

let s = (x0) => (x1) => (x2) => x0(x2)( x1(x2) );

// ap inc ap dec x0   =   x0
// ap dec ap inc x0   =   x0
// ap dec ap ap add x0 1   =   x0
// ap ap add ap ap add 2 3 4   =   9
// ap ap add 2 ap ap add 3 4   =   9
// ap ap add ap ap mul 2 3 4   =   10
// ap ap mul 2 ap ap add 3 4   =   14
// inc   =   ap add 1
// dec   =   ap add ap neg 1


// hello

/// magic



//stuff

