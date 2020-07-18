
import { listToList } from "./list_utils.mjs";

// 01 1110 000100101001
// |  |    |
// |  |    +-- the zero-padded binary number
// |  +------- the number of bits * 4, in unary
// +---------- the sign (01 postive, 10 negative)   

export function modulate(n) {
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

export function demodulate(text) {
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


export let primitives = {
    inc: (n) => parseInt(evalAst(n)) + 1,
    dec: (n) => parseInt(evalAst(n)) - 1,
    t: (x) => (y) => evalAst(x),
    f: (x) => (y) => evalAst(y),
    i: (x) => evalAst(x),

    // ap ap ap s x0 x1 x2   =   ap ap x0 x2 ap x1 x2
    s: (x0) => (x1) => (x2) => {
        let x0Val = evalAst(x0);
        let x1Val = evalAst(x1);
        // let x2Val = evalAst(x2);
        let x2Val = x2;
        return x0Val(x2Val)(x1Val(x2Val));
    },

    // ap ap ap c x0 x1 x2   =   ap ap x0 x2 x1
    c: (x0) => (x1) => (x2) => {
        let x0Val = evalAst(x0);
        // let x1Val = evalAst(x1);
        // let x2Val = evalAst(x2);
        let x1Val = x1;
        let x2Val = x2;
        return x0Val(x2Val)(x1Val);
    },

    // b
    // ap ap ap b x0 x1 x2   =   ap x0 ap x1 x2
    // ap ap ap b inc dec x0   =   x0
    b: x0 => x1 => x2 => {
        let evalX0 = evalAst(x0);
        let evalX1 = evalAst(x1);
        //let evalX2 = evalAst(x2);
        let evalX2 = x2;
        return evalX0(evalX1(evalX2));
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
        console.log(listtoList(list));
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
        console.log("send", listToList(data));
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

    // ap ap cons flag ap ap cons newState ap ap cons data nil
    f38: protocol => list => {
        let flag = primitives.car(list);
        let netState = primitives.car( primitives.cdr(list));
        let data = primitives.car(primitives.cdr(primitives.cdr(list)));

        console.log("f38", {flag, netState, data});
        
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
    interact: protocol => state => vector => {
        console.log("interact", {protocol, state, vector})
        let evalProtocol = evalAst(protocol);
        console.log("interact protocol", { evalProtocol });
        console.log("interact protocol content", evalProtocol.toString())
        let f38Result = primitives.f38(evalProtocol);
        console.log("f38Result", f38Result.toString());
        let protoStateResult = evalProtocol(state);
        console.log("protoStateResult", protoStateResult.toString())
        let protoVectorResult = protoStateResult(vector);
        console.log("protoVectorResult", protoVectorResult.toString())
        let composedREsult = f38Result(protoVectorResult);
        return composedREsult;
        // return f38Result()
        // return (primitives.f38(evalProtocol))(evalProtocol(state)(vector));
    }
};

let world = {};

export function setWorld(newWorld) {
    world = newWorld;
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


export function getNext(tokenStream) {
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

let evalDepth = 0;
function evalAst(ast) {
    evalDepth++;
    // console.log("evalAst", ast.toString())
    // console.trace("Here!")
    // console.log("evalAst", {evalDepth, ast})
    // console.log("evalAst", {evalDepth})
    if (Array.isArray(ast)) {
        // let nodeType = ast.shift();
        let nodeType = ast[0];
        if (nodeType == "ap") {
            let f = evalAst(ast[1]);
            let param = ast[2];
            // console.log("applying", {f, param})

            if (!(f instanceof Function)) {
                console.log("evalAst error f is not a function", { f, param });
                throw new Error("Function expected");
            }
            // console.log("evalAst apply", { f, param })
            let result = f(param);
            evalDepth--;
            return result;
        }
        throw new Error("AP expected");
    } else {
        if (primitives[ast]) {
            // console.log("Found primitive", ast, primitives[ast])
            evalDepth--;
            return primitives[ast];
        }
        if (world[ast]) {
            // console.log("Found in world", ast, world[ast]);

            let result = evalAst(world[ast]);
            evalDepth--;
            return result;
        }
        evalDepth--;
        return ast;
    }
}

export function evil(tokenStream) {
    // console.log("evil", {tokenStream});
    let ast = getNext(tokenStream);
    // console.log("evil", {ast});
    return evalAst(ast);
}
