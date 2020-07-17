

let primitives = {
    inc: (n) => n + 1,
    dec: (n) => n - 1,
    t: (x) => (y) => x,
    f: (x) => (y) => y,
    s: (x0) => (x1) => (x2) => x0(x2)( x1(x2) ),
}
let inc = (n) => n + 1;
let dec = (n) => n - 1;

// let add = (add, n)

//let ap = (f) => (x) => f(x);
let ap = (f,x) => {
    //console.log("ap:", {f, x});
    return f(x);
};
//let ap = (x) => x;

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

let mul = (x) => (y) => x * y;
let div = (x) => (y) => int(x / y);
let add = (x) => (y) => x + y;
let neg = (x) => -1 * x;

// let mul = (x) => (y) => () => x * y;
// let ap = (f) => f();
// ap(mul(3)(4))

// ap ap add 1 ap ap add 1 2 = 4
// example from contest: ap ap add 1 2   =   3

// ap ap add 1 2 = 3



// ap ap ap s mul ap add 1 6   =   42
//let prog = [ap,ap,ap,s,mul,ap,add,1,6];

let ap2 = (f,x) => f(x);

// [ap,ap,mul,5,3]

// ap add ap neg 1
// ap add (ap neg 1)
// ap (add ap neg) 1


// ap ap (mul 5 3)
// ap (ap mul 5) 3
// ap (ap (mul 5)) 3
function interpret(proggie) {
    if(!Array.isArray(proggie)) {
        return [proggie];
    }
    let cmd = proggie[0];
    
    //console.log("interpret", {cmd});
    if(cmd === ap) {
        let ap_params = proggie.slice(1);

        //console.log("In ap")
        let evaluated_partial_function = interpret(ap_params);

        //console.log({evaluated_partial_function});
        let f = evaluated_partial_function[0];

        let evaluated_params = interpret(evaluated_partial_function.slice(1));

        let param = evaluated_params[0];
        let remaining_data = evaluated_params.slice(1);
        
        //let otherstuff = goodstuff.slice(2);
        //console.log({f, param});
        let result = ap(f,param);
        return interpret([result, ...remaining_data]);
    }
    //console.log("Not ap ... just returning")
    return proggie;
}

function interp(p) {
    return interpret(p)[0];
}

is("multiplication", interpret([ap,ap,mul,5,3])[0], 15);
is("triple inc", interpret([ap, inc, ap, inc, ap, inc, 0])[0], 3); // should be 3

is( "#22 False example", interpret([ap, ap, f, 1, 5])[0], 5);

//ap ap t 1 5   =  1
is( "#21 K combinator example", interpret([ap,ap,t,1, 5])[0], 1);

//ap ap t ap inc 5 t   =   6
is( "#21 K combinator last example", interpret(ap(ap(t, ap(inc, 5)), t))[0], 6);


// ap inc ap inc 0   =   2
is( "#17 and #5 function application example 1", interpret([ap, inc,ap, inc,0])[0], 2 );

// ap inc ap inc ap inc 0   =   3

is( "#17 and #5 ex 2",
    interpret(ap (inc, ap (inc,ap (inc,0))))[0],
    3);

// interpret([5]) -> [5]
// interpret([mul 5]) -> [mul 5]
// interpret(2) -> 2
// interpret([mul ap inc 3]) -> [mul ap inc 3]
// ap mul ap inc 3 -> [mul 4]
// ap [mul 4] 3 -> 12