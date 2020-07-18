

// 01 1110 000100101001
// |  |    |
// |  |    +-- the zero-padded binary number
// |  +------- the number of bits * 4, in unary
// +---------- the sign (01 postive, 10 negative)   

function modulate(n) {
    let isPositive = n >= 0;
    let num = Math.abs(n);
    let binaryString = num.toString(2);
    let bitCount = binaryString.length;
    let unaryLength = Math.ceil(bitCount / 4);
    let binaryLength = unaryLength * 4;

    // Easier than dealing with it later
    if (num == 0) {
        return "010";
    }

    let signPrefix = isPositive ? "01" : "10";
    let unary = "1".repeat(unaryLength) + "0";
    let paddedBinaryString = binaryString.padStart(binaryLength, "0");

    return signPrefix + unary + paddedBinaryString;
}

function demodulate(text) {
    // console.log({text})
    let binary = text.split('');
    // console.log({binary})
    let sign1 = binary.shift();
    let sign2 = binary.shift();
    let isPositive = sign1 == "0";
    let bitCount = 0;
    // console.log({binary})
    while (binary[0] == "1") {
        bitCount++;
        binary.shift();
    }
    if (bitCount == 0) {
        return 0;
    }
    binary.shift(); // Drop the "0" after the unary length
    // console.log("only number", {binary})
    let number = parseInt(binary.join(''), 2);
    if (!isPositive) {
        number = number * -1;
    }
    // could do some safety check here ....
    return number;
}


let primitives = {
    inc: (n) => parseInt(evalAst(n)) + 1,
    dec: (n) => parseInt(evalAst(n)) - 1,
    t: (x) => (y) => evalAst(x),
    f: (x) => (y) => evalAst(y),
    i: (x) => evalAst(x),

    // ap ap ap s x0 x1 x2   =   ap ap x0 x2 ap x1 x2
    s: (x0) => (x1) => (x2) => {
        let x0Val = evalAst(x0);
        let x1Val = evalAst(x1);
        let x2Val = evalAst(x2);
        return x0Val(x2Val)(x1Val(x2Val));
    },

    // ap ap ap c x0 x1 x2   =   ap ap x0 x2 x1
    c: (x0) => (x1) => (x2) => {
        let x0Val = evalAst(x0);
        let x1Val = evalAst(x1);
        let x2Val = evalAst(x2);
        return x0Val(x2Val)(x1Val);
    },

    mul: (x) => (y) => parseInt(evalAst(x)) * parseInt(evalAst(y)),
    div: (x) => (y) => Math.floor(parseInt(evalAst(x)) / parseInt(evalAst(y))),
    add: (x) => (y) => parseInt(evalAst(x)) + parseInt(evalAst(y)),
    neg: (x) => -1 * parseInt(evalAst(x)),
    if0: (a) => (b) => (c) => parseInt(evalAst(a)) === 0 ? evalAst(b) : evalAst(c),
    ifzero: (a) => (b) => (c) => parseInt(evalAst(a)) === 0 ? evalAst(b) : evalAst(c),
    eq: (a) => (b) => parseInt(a) === parseInt(evalAst(b)) ? primitives.t : primitives.f,
    nil: (x) => primitives.t,
    lt: (x) => (y) => parseInt(evalAst(x)) < parseInt(evalAst(y)) ? primitives.t : primitives.f,
    pwr2: (x) => 2 ** parseInt(evalAst(x)),

 

    mod: (n) => modulate(evalAst(n)),
    dem: (n) => demodulate(evalAst(n)),

    // ap ap ap cons x0 x1 x2   =   ap ap x2 x0 x1
    vec: (x0) => (x1) => (x2) => evalAst(x2)((evalAst(x0))(evalAst(x1))),
    cons: (x0) => (x1) => (x2) => {
       return (x2(x0))(x1)
    },
    // evalAst(x2)(evalAst(x0))(evalAst(x1)),

    // cons: (x0) => (x1) => (x2) => {
    //     console.log({x2, x0, x1});
    //     return x2(x0)(x1);
    // },
    // car: (list) => evalAst(list)(primitives.t),
    car: (list) => {
        // console.log("car", {list}, list.toString());
        // console.log("car eval", evalAst(list))
        return evalAst(list)(primitives.t)
        // return list(primitives.t)
    },
    // cdr: (list) => evalAst(list)(primitives.f),
    cdr: (list) => {
        // console.log("cdr", {list}, list.toString());
        // console.log("cdr eval", evalAst(list))
        return evalAst(list)(primitives.f);
        // return list(primitives.f)
    },

    isnil: (thing) => evalAst(thing) == primitives.nil ? primitives.t : primitives.f,

    // draw
    // ap draw ( )   =   |picture1|
    // ap draw ( ap ap vec 1 1 )   =   |picture2|
    // ap draw ( ap ap vec 1 2 )   =   |picture3|
    // ap draw ( ap ap vec 2 5 )   =   |picture4|
    // ap draw ( ap ap vec 1 2 , ap ap vec 3 1 )   =   |picture5|
    // ap draw ( ap ap vec 5 3 , ap ap vec 6 3 , ap ap vec 4 4 , ap ap vec 6 4 , ap ap vec 4 5 )   =   |picture6|

    draw: (list) => {
        // convert list to js list
        // [ [5,3]. [6,3]]
        // call draw stuff on the coordinates in the js list
        return primitives.t;
    },

    // multipledraw
    // ap multipledraw nil   =   nil
    // ap multipledraw ap ap cons x0 x1   =   ap ap cons ap draw x0 ap multipledraw x1
    multipledraw: (stuff) => {
        if (stuff == primitives.nil) {
            return primitives.nil;
        } else {
            let x0 = primitives.car(stuff);
            let x1 = primitives.cdr(stuff);
            let drawing = primitives.draw(x0);
            return primitives.cons(drawing)(primitives.multipledraw(x1))
        }
    },
    

    //     interact
    // ap modem x0 = ap dem ap mod x0
    // ap ap f38 x2 x0 = ap ap ap ifzero ap car x0 ( ap modem ap car ap cdr x0 , ap multipledraw ap car ap cdr ap cdr x0 ) ap ap ap interact x2 ap modem ap car ap cdr x0 ap send ap car ap cdr ap cdr x0
    // ap ap ap interact x2 x4 x3 = ap ap f38 x2 ap ap x2 x4 x3


    send: (data) => {
        let modData = primitives.mod(data);
        // do an HTTP thing, get back result
        let result = "010";
        let resultData = primitives.dem(result);
        return resultData;
    },

    modem: (x0) => primitives.dem(primitives.mod(x0)),

    // f38: (x2) => (x0) => 
    //   interp([
    //     "ap", "ap", "ap", "ifzero", "ap", "car", x0, "(", "ap", "modem", "ap", "car", "ap", "cdr", x0, ",", "ap", "multipledraw", "ap", "car", "ap", "cdr", "ap", "cdr", x0, ")", "ap", "ap", "ap", "interact", x2, "ap", "modem", "ap", "car", "ap", "cdr", x0, "ap", "send", "ap", "car", "ap", "cdr", "ap", "cdr", "x0ap", "ap", "ap", "ifzero", "ap", "car", x0, "(", "ap", "modem", "ap", "car", "ap", "cdr", x0, ",", "ap", "multipledraw", "ap", "car", "ap", "cdr", "ap", "cdr", x0, ")", "ap", "ap", "ap", "interact", x2, "ap", "modem", "ap", "car", "ap", "cdr", x0, "ap", "send", "ap", "car", "ap", "cdr", "ap", "cdr", x0
    //   ]),
    // interact: (x2) => (x4) => (x3) => interp(["ap", "ap", "f38", x2, "ap", "ap", x2, x4, x3]),


    //     f38(protocol, (flag, newState, data)) = if flag == 0
    //                 then (modem(newState), multipledraw(data))
    //                 else interact(protocol, modem(newState), send(data))
    f38: protocol => list => {
        let flag = primitives.car(list);
        let netState = primitives.car( primitives.cdr(list));
        let data = primitives.car(primitives.cdr(primitives.cdr(list)));
        if(primitives.iszero(flag) == primitives.t) {
            return primitives.cons(
                primitives.modem(newState)
            )(
                primitives.cons(
                    primitives.multipledraw(data)
                )( primitives.nil )
            )
        } else {
            return primitives.interact(protocol)(primitives.modem(newState))(primitives.send(data))
        }
    },

    // ap ap f38 x2 x0 = ap ap ap ifzero ap car x0 ( ap modem ap car ap cdr x0 , ap multipledraw ap car ap cdr ap cdr x0 ) ap ap ap interact x2 ap modem ap car ap cdr x0 ap send ap car ap cdr ap cdr x0
    // f38: x2 => x0 => 

    // ap ap ap interact x2 x4 x3 = ap ap f38 x2 ap ap x2 x4 x3
    // interact: x2 => x4 => x3 => (primitives.f38(x2))(x2(x4))(x3)

    // interact(protocol, state, vector) = f38(protocol, protocol(state, vector))
    interact: protocol => state => vector => (primitives.f38(protocol))(protocol(state)(vector))
};

let world = {};



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


// tokenStream: an array of text entries
//
// ast: a tree structure
//    ["ap", left, right]
// where left and right are the params when the token is `ap`
//    ["list", head, tail]
// where head is the current entry and tail is the remaining entries (ast)
//    val
// when it isn't an array, it is a plain value
// a plain value could be :foo reference


function getNext(tokenStream) {
    // console.log("getNext", {tokenStream})
    let token = tokenStream.shift();
    if (token == "ap") {
        let left = getNext(tokenStream);
        let right = getNext(tokenStream);
        return ["ap", left, right];
    }
    // Look up primitive

    return token;
}

function evalAst(ast) {
    // console.log("evalAst", {ast})
    if (Array.isArray(ast)) {
        // let nodeType = ast.shift();
        let nodeType = ast[0];
        if (nodeType == "ap") {
            let f = evalAst(ast[1]);
            let param = ast[2];

            if (!(f instanceof Function)) {
                console.log("evalAst error f is not a function", { f, param });
                throw new Error("Function expected");
            }
            // console.log("evalAst apply", { f, param })
            return f(param);
        }
    } else {
        if (primitives[ast]) {
            return primitives[ast];
        }
        if (world[ast]) {
            // console.log("Found in world", world[ast]);
            return evalAst(world[ast]);
        }

        return ast;
    }
}

function evil(tokenStream) {
    // console.log("evil", {tokenStream});
    let ast = getNext(tokenStream);
    // console.log("evil", {ast});
    return evalAst(ast);
}

function is(desc, a, b) {
    let aVal = evil(a);
    if (aVal === b) {
        console.log("OUTSTANDING! # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

function ok(desc, a, b) {
    if (a === b) {
        console.log("GOOD JOB! # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

function runTests() {

    is("multiplication", ["ap", "ap", "mul", "5", "3"], 15);
    is("triple inc", ["ap", "inc", "ap", "inc", "ap", "inc", 0], 3); // should be 3


    is("#22 False example", ["ap", "ap", "f", 1, 5], 5);

    //"ap" "ap" t 1 5   =  1
    is("#21 K combinator example", ["ap", "ap", "t", 1, 5], 1);

    //"ap" "ap" t "ap" "inc" 5 t   =   6
    is("#21 K combinator last example", ["ap", "ap", "t", "ap", "inc", 5, "t"], 6);


    // "ap" "inc" "ap" "inc" 0   =   2
    is("#17 and #5 function application example 1", ["ap", "inc", "ap", "inc", 0], 2);

    // "ap" "inc" "ap" "inc" "ap" "inc" 0   =   3

    is("#17 and #5 ex 2", ["ap", "inc", "ap", "inc", "ap", "inc", 0], 3);

    is("add 1, 2, 3 with curry", ["ap", "ap", "add", 1, "ap", "ap", "add", 2, 3], 6);

    is("#11 Example", ["ap", "ap", "eq", -10, -10], primitives.t);

    is("#12 Example", ["ap", "ap", "lt", -10, -12], primitives.f);

    is("#19 C Combinator ex 1", ["ap", "ap", "ap", "c", "add", 1, 2], 3);

    is("#19 C Combinator ex 2", ["ap", "ap", "ap", "c", "div", 7, 14], 2);

    is("#28 nil try 1", ["ap", "nil", "2"], primitives.t);
    is("#28 nil try 2", ["ap", "nil", "3"], primitives.t);

    is("#18 s ex 1", ["ap", "ap", "ap", "s", "add", "inc", "1"], 3);
    is("#18 s ex 2", ["ap", "ap", "ap", "s", "mul", "ap", "add", "1", "6"], 42);

    // is("#25", interp(["ap", "ap", "cons", "x0", "x1"]), interp(["ap", "ap", "cons", "x0", "x1"]))

    is("23 ex 1", ["ap", "pwr2", 7], 128);

    is("#26 car", ["ap", "car", "ap", "ap", "cons", "5", "7"], "5");
    is("#27 cdr", ["ap", "cdr", "ap", "ap", "cons", "5", "7"], "7");
    // (a b c d) -> (a . (b . (c . (d . nil))))

    is("#29 isnil nil", ["ap", "isnil", "nil"], primitives.t);
    is("#29 isnill nope", ["ap", "isnil", "ap", "ap", "cons", "x0", "x1"], primitives.f);

    // ( )   =   nil
    // is("#30 list construction empty", ["(", ")"], "nil");

    // The [ap invalid 5] should never get evaluated
    is("lazy evaluated", ["ap", "ap", "f", "ap", "invalid", "5", "42"], "42");

    world = {
        ":2048": getNext(["ap", "f", ":2048"])
    };
    is("not too recursive", ["ap", ":2048", "42"], "42");


    // ap :2048 42
    // -> ap ap f :2048 42
    // -> ap ap [ (a) => (b) => b ] :2048 42
    // -> ap [ (x) -> x ] 42
    // -> 42

    // ( x0 )   =   ap ap cons x0 nil
    // is("#30 list one", interp(["ap", "car", "(", "x0", ",", "x1", ")"]), "x0");
    // is("#30 list one", interp(["ap", "car", "ap", "cdr", "(", "x0", ",", "x1", ")"]), "x1");
    // is("#30 list one", interp(["ap", "isnil", "ap", "cdr", "ap", "cdr", "(", "x0", ",", "x1", ")"]), primitives.t);

    // ( x0 , x1 )   =   ap ap cons x0 ap ap cons x1 nil
    // ( x0 , x1 , x2 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 nil
    // ( x0 , x1 , x2 , x5 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 ap ap cons x5 nil

    ok("modulate 0", modulate(0), '010');
    ok("modulate 1", modulate(1), '01100001');
    ok("modulate -1", modulate(-1), '10100001');
    ok("modulate 4", modulate(4), '01100100');
    ok("modulate 16", modulate(16), '0111000010000')

    ok("demodulate to 0", demodulate('010'), 0);
    ok("demodulate to 1", demodulate('01100001'), 1);
    ok("demodulate to -1", demodulate('10100001'), -1);
    ok("demodulate to 4", demodulate('01100100'), 4);
    ok("demodulate to 16", demodulate('0111000010000'), 16);

    is("#14 dem ex 1", ["ap", "dem", "ap", "mod", "42"], 42);
    is("#14 dem ex 2", ["ap", "mod", "ap", "dem", "0111000010000"], "0111000010000");

}

const fs = require('fs');
const { defaultMaxListeners } = require('stream');

function loadGalaxy() {
    let functions = {};

    try {

        const data = fs.readFileSync('galaxy.txt', 'UTF-8');

        const lines = data.split(/\r?\n/);

        let program = [];

        lines.forEach((Line) => {
            let programLine = Line.split(" ");
            let memoryValue = programLine[0];
            programLine.splice(0, 2);
            functions[memoryValue] = getNext(programLine);
        });

        // console.log(functions);
        console.log("Galaxy loaded!");
        return functions;

    } catch (err) {

        console.error(err);

    }

}


function listContentToString(list) {
    // console.log("printing list content", {list})
        if (primitives.isnil(list) == primitives.t) {
            return "";
        } else {
            let head = primitives.car(list);
            let tail = primitives.cdr(list);
            // console.log("printing content with", { head, tail })
            return listToString(head) + " " + listContentToString(tail);
        }
}

function listToString(list) {
    // console.log("printing list", {list})
    if (list instanceof Function) {
        return "(" + listContentToString(list).trim() + ")";
    } else {
        return list;
    }
}

function listContentToList(list) {
    // console.log("printing list content", {list})
        if (primitives.isnil(list) == primitives.t) {
            return [];
        } else {
            let head = primitives.car(list);
            let tail = primitives.cdr(list);
            // console.log("printing content with", { head, tail })
            return [listToList(head), ...listContentToList(tail)];
        }
}

function listToList(list) {
    // console.log("printing list", {list})
    if (list instanceof Function) {
        return [ ...listContentToList(list) ];
    } else {
        return list;
    }
}

// list = evil(["ap", "ap", "cons", "3", "nil"])
// console.log(list.toString())
// console.log(listToString(list));


// list = evil(["ap", "ap", "ap", "cons", "3", "2", "nil"]);
// console.log("ast of list", getNext(["ap", "ap", "cons", "2", "ap", "ap", "cons", "3", "nil"]))
list = evil(["ap", "ap", "cons", "2", "ap", "ap", "cons", "3", "nil"]); // (2 . (3 . nil))

// console.log(list.toString())
// list_tail = primitives.cdr(list)
// console.log(list_tail);
// console.log(primitives.car(list_tail))
// list_tail_tail = primitives.cdr(list_tail);
// console.log(list_tail_tail);

// console.log(listToString(list))
// console.log(listToString(list))

// console.log(listToList(list))
// console.log(listToList(list))

// list2 = evil(["ap", "ap", "cons", "ap", "ap", "cons", "2", "nil", "ap", "ap", "cons", "5", "nil"])
// console.log(listToList(list2))

// // ap ap cons 2 ap ap cons 7 nil

// // 3 . (2 . nil)
// // ap ap cons 3 ap ap cons 463 nil => from galaxy.txt
// console.log("list", list);
// console.log("car", primitives.car(list))
// console.log("cdr", primitives.cdr(list))
// console.log("car cdr", primitives.car( primitives.cdr( list )))

// console.log(primitives.car(primitives.cdr(list)))
// console.log(listToString(list))


let galaxy = loadGalaxy();
world = galaxy;
evil(["ap", "interact", "galaxy"])

// debugger
// runTests();
