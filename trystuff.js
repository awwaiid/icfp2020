

// add
// ap
// b
// c
// car
// cdr
// cons
// div
// eq
// galaxy
// i
// isnil
// lt
// mul
// neg
// nil
// s
// t

let primitives = {
    inc: (n) => parseInt(n) + 1,
    dec: (n) => parseInt(n) - 1,
    t: (x) => (y) => x,
    f: (x) => (y) => y,
    i: (x) => x,

    // ap ap ap s x0 x1 x2   =   ap ap x0 x2 ap x1 x2
    s: (x0) => (x1) => (x2) => x0(x2)( x1(x2) ),
    
    // ap ap ap c x0 x1 x2   =   ap ap x0 x2 x1
    c: (x0) => (x1) => (x2) =>  x0(x2)(x1),

    mul: (x) => (y) => parseInt(x) * parseInt(y),
    div: (x) => (y) => Math.floor(parseInt(x) / parseInt(y)),
    add: (x) => (y) => parseInt(x) + parseInt(y),
    neg: (x) => -1 * parseInt(x),
    if0: (a) => (b) => (c) => parseInt(a) == 0 ? b : c,
    ifzero: (a) => (b) => (c) => parseInt(a) == 0 ? b : c,
    eq: (a) => (b) => parseInt(a) === parseInt(b) ? primitives.t : primitives.f,
    nil: (x) => primitives.t,
    lt: (x) => (y) => parseInt(x) < parseInt(y) ? primitives.t : primitives.f,
    pwr2: (x) => 2 ** parseInt(x),

    vec: (x0) => (x1) => (x2) => x2(x0)(x1),
    cons: (x0) => (x1) => (x2) => x2(x0)(x1),
    // cons: (x0) => (x1) => (x2) => {
    //     console.log({x2, x0, x1});
    //     return x2(x0)(x1);
    // },
    car: (list) => list(primitives.t),
    // car: (list) => {
    //     console.log({list});
    //     return list(primitives.t)
    // },
    cdr: (list) => list(primitives.f),
    // cdr: (list) => {
    //     console.log({list});
    //     return list(primitives.f)
    // },

    isnil: (thing) => thing == primitives.nil ? primitives.t : primitives.f,


//     interact
// ap modem x0 = ap dem ap mod x0
// ap ap f38 x2 x0 = ap ap ap ifzero ap car x0 ( ap modem ap car ap cdr x0 , ap multipledraw ap car ap cdr ap cdr x0 ) ap ap ap interact x2 ap modem ap car ap cdr x0 ap send ap car ap cdr ap cdr x0
// ap ap ap interact x2 x4 x3 = ap ap f38 x2 ap ap x2 x4 x3
    modem: (x0) => primitives.dem(primitives.modem(x0)),
    f38: (x2) => (x0) => 
      interp([
        "ap", "ap", "ap", "ifzero", "ap", "car", x0, "(", "ap", "modem", "ap", "car", "ap", "cdr", x0, ",", "ap", "multipledraw", "ap", "car", "ap", "cdr", "ap", "cdr", x0, ")", "ap", "ap", "ap", "interact", x2, "ap", "modem", "ap", "car", "ap", "cdr", x0, "ap", "send", "ap", "car", "ap", "cdr", "ap", "cdr", "x0ap", "ap", "ap", "ifzero", "ap", "car", x0, "(", "ap", "modem", "ap", "car", "ap", "cdr", x0, ",", "ap", "multipledraw", "ap", "car", "ap", "cdr", "ap", "cdr", x0, ")", "ap", "ap", "ap", "interact", x2, "ap", "modem", "ap", "car", "ap", "cdr", x0, "ap", "send", "ap", "car", "ap", "cdr", "ap", "cdr", x0
      ]),
    interact: (x2) => (x4) => (x3) => interp(["ap", "ap", "f38", x2, "ap", "ap", x2, x4, x3]),
};

let world = {};


function is(desc, a, b) {
    if (a === b) {
        console.log("OUTSTANDING! # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

function extractLiteralList(proggie) {
    // pull out the list, return it, and the rest after
    let theList = interpret(proggie);
    let first = theList[0];
    let rest = theList.slice(1);
    if (first == ")") {
        return ["nil", ...rest]
    }
    return ["ap", "ap", "cons", first, ...extractLiteralList(rest)];
}

function interpret(proggie) {
    // console.log("interp:", {proggie});
    if(!Array.isArray(proggie)) {
        return [proggie];
    }
    let cmd = proggie[0];
    
    //console.log("interpret", {cmd});
    if(cmd === "ap") {
        let ap_params = proggie.slice(1);

        //console.log("In ap")
        let evaluated_partial_function = interpret(ap_params);

        //console.log({evaluated_partial_function});
        let f = evaluated_partial_function[0];

        let evaluated_params = interpret(evaluated_partial_function.slice(1));

        let param = evaluated_params[0];
        let remaining_data = evaluated_params.slice(1);
        
        //let otherstuff = goodstuff.slice(2);
        // console.log({f, param});
        let result = f(param);
        return interpret([result, ...remaining_data]);
    }
    if(primitives[cmd]) {
        return [primitives[cmd], ...proggie.slice(1)];
    }
    if(world[cmd]) {
        return interpret([...(world[cmd]), ...proggie.slice(1)]);
    }
    if(cmd == "(") {
        return extractLiteralList(proggie.slice(1));
    }
    //console.log("Not ap ... just returning")
    return proggie;
}

function interp(p) {
    return interpret(p)[0];
}

function runTests() {

    is("multiplication", interp(["ap","ap","mul","5","3"]), 15);
    is("triple inc", interp(["ap", "inc", "ap", "inc", "ap", "inc", 0]), 3); // should be 3
    
    
    is( "#22 False example", interp(["ap", "ap", "f", 1, 5]), 5);
    
    //"ap" "ap" t 1 5   =  1
    is( "#21 K combinator example", interp(["ap","ap","t",1, 5]), 1);

    //"ap" "ap" t "ap" "inc" 5 t   =   6
    is( "#21 K combinator last example", interp(["ap", "ap", "t", "ap", "inc", 5, "t"]), 6);


    // "ap" "inc" "ap" "inc" 0   =   2
    is( "#17 and #5 function application example 1", interp(["ap", "inc","ap", "inc",0]), 2 );

    // "ap" "inc" "ap" "inc" "ap" "inc" 0   =   3

    is( "#17 and #5 ex 2",
        interp(["ap","inc","ap","inc","ap","inc",0]),
        3);

    is("add 1, 2, 3 with curry", interp(["ap","ap","add",1,"ap","ap","add",2,3]), 6);

    is("#11 Example", interp(["ap","ap","eq",-10,-10]), primitives.t);

    is("#12 Example", interp(["ap","ap","lt",-10,-12]), primitives.f);

    is("#19 C Combinator ex 1", interp(["ap","ap","ap","c","add",1,2]), 3);

    is("#28 nil try 1", interp(["ap", "nil", "2"]), primitives.t);
    is("#28 nil try 2", interp(["ap", "nil", "3"]), primitives.t);

    is("#18 s ex 1", interp(["ap", "ap", "ap", "s", "add", "inc", "1"]),   3);
    is("#18 s ex 2", interp(["ap", "ap", "ap", "s", "mul", "ap", "add", "1", "6"]), 42);

    // is("#25", interp(["ap", "ap", "cons", "x0", "x1"]), interp(["ap", "ap", "cons", "x0", "x1"]))

    is("#26 car", interp(["ap", "car", "ap", "ap", "cons", "5", "7"]), "5");
    is("#27 cdr", interp(["ap", "cdr", "ap", "ap", "cons", "5", "7"]), "7");
    // (a b c d) -> (a . (b . (c . (d . nil))))

    is("#29 isnil nil", interp(["ap", "isnil", "nil"]), primitives.t);
    is("#29 isnill nope", interp(["ap", "isnil", "ap", "ap", "cons", "x0", "x1"]), primitives.f);
       
    // ( )   =   nil
    is("#30 list construction empty", interp(["(", ")"]), "nil");

    // ( x0 )   =   ap ap cons x0 nil
    // is("#30 list one", interp(["ap", "car", "(", "x0", ",", "x1", ")"]), "x0");
    // is("#30 list one", interp(["ap", "car", "ap", "cdr", "(", "x0", ",", "x1", ")"]), "x1");
    // is("#30 list one", interp(["ap", "isnil", "ap", "cdr", "ap", "cdr", "(", "x0", ",", "x1", ")"]), primitives.t);

    // ( x0 , x1 )   =   ap ap cons x0 ap ap cons x1 nil
    // ( x0 , x1 , x2 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 nil
    // ( x0 , x1 , x2 , x5 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 ap ap cons x5 nil
    
}

const fs = require('fs');
const { defaultMaxListeners } = require('stream');

// const interpret = require("./trystuff.js");
//import fs from "fs";


function loadGalaxy() {
  let functions = {};

try {
    
    const data = fs.readFileSync('galaxy.txt', 'UTF-8');

    const lines = data.split(/\r?\n/);

    let program = [];

    lines.forEach((Line) => {
        let programLine = Line.split(" ");
        let memoryValue = programLine[0];
        programLine.splice(0,2);
        functions[memoryValue] = programLine;
    });

    // console.log(functions);
    console.log("Galaxy loaded!");
    return functions;

} catch (err) {

    console.error(err);
    
}

}



// let galaxy = loadGalaxy();
// world = galaxy;
// interpret(["ap", "interact", "galaxy"])


runTests();

// export default {
//     interpret
// };
