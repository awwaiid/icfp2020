// See video course https://icfpcontest2020.github.io/#/post/2054

// class Expr
//     optional Expr Evaluated
// { evaluated: bool }
class Expr {
    constructor() {
        this.evaluated = false;
    }
}

// class Atom extends Expr
//     string Name
// { evaluated: bool, name: string }
class Atom extends Expr {
  constructor(name) {
      super();
      this.name = name;
  }
}

// class Ap extends Expr
//     Expr Fun
//     Expr Arg
// { evaluated: bool, fun: {...}, arg: { ... }}
class Ap extends Expr {
  constructor(fun, arg) {
      super();
      this.fun = fun;
      this.arg = arg;
  }
}

// class Vect
//     number X
//     number Y
// { x: num, y: num }
class Vect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let cons = new Atom("cons")
let t = new Atom("t")
let f = new Atom("f")
let nil = new Atom("nil")


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

import axios from 'axios';

    // TODO actually convert data to modulate 0's and 1's and do a POST to the server
    // get the response back, demodulate it, put that in alienResponse
    // let alienResponse = send(data);
async function send(data) {
    let encodedData = modulate(data);
    console.log("Posting:", encodedData)
    let response = await axios.post('https://icfp2020-api.testkontur.ru/aliens/send?apiKey=a9f3b65f22c448ecb5f650a7ff8e770c', encodedData);
    let result = demodulate(response.data);
    return result;
    // await axios.post(....)
    // blocking HTTP call?
    // let rawResult;
    // return demodulate(rawResult);

}

// Map<string, Expr> functions = PARSE_FUNCTIONS("galaxy.txt")

import fs from 'fs';

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
            functions[memoryValue] = parse(programLine);
        });

        // console.log(functions);
        console.log("Galaxy loaded!");
        return functions;

    } catch (err) {

        console.error(err);

    }

}


// [1, 2 3] -> (1 . (2 . (3 . nil)))
// Ap("cons", Atom(1), Ap("cons", Atom(2), Ap("cons", Atom(3), Atom(nil))))

// [] -> Atom(nil)
// [3] -> (3 . nil) -> Ap[ Ap(Atom("cons"), Atom("3")), Atom("nil") ]

function listContentToList(list) {
    // console.log("printing list content", {list})
        if (list instanceof Atom && list.name == 'nil') {
            return [];
        } else if (list instanceof Ap) {
            let f = list.fun;
            let arg = list.arg;

            // console.log("Checking for sublist based on", f)

            if(f instanceof Ap && f.fun.name == "cons") {
                let element = listToList(f.arg);
                let restOfList = listContentToList( arg ); 
                // console.log({restOfList})
                if(restOfList) {
                    return [element, ...restOfList];

                } else {
                    return [element];
                }
            }
      
            // console.log("printing content with", { f, arg })
            return [listToList(f), ...listContentToList(arg)];
        } else if (list instanceof Atom) {
            // Normal lists shouldn't get here
            return [list.name];
        }
}

export function listToList(list) {
    // console.log("listToList", {depth: 20})
    // console.dir( list);
    if (list instanceof Ap) {
        return [ ...listContentToList(list) ];
    } else {
        return list.name;
    }
}

function myCar(list) {
    // Ap(Ap(cons, head),tail)
    // console.log("myCar");
    // console.dir(list)
    return list.fun.arg;
}

function myCdr(list) {
    return list.arg;
}


// // See https://message-from-space.readthedocs.io/en/latest/message38.html
// (Expr, Expr) interact(Expr state, Expr event)
//     Expr expr = Ap(Ap(Atom("galaxy"), state), event)
//     Expr res = evil(expr)
//     // Note: res will be modulatable here (consists of cons, nil and numbers only)
//     var [flag, newState, data] = GET_LIST_ITEMS_FROM_EXPR(res)
//     if (asNum(flag) == 0)
//         return (newState, data)
//     return interact(newState, SEND_TO_ALIEN_PROXY(data))

function interact(state, event) {
    console.log("interact", listToList(event))
    let expr = new Ap( new Ap(new Atom("galaxy"), state), event);
    let res = evil(expr);
    // Note: res will be modulatable here (consists of cons, nil and numbers only)
    let flag = myCar(res);
    let newState = myCar(myCdr(res));
    let data = myCar(myCdr(myCdr(res)));

    console.log("flag", listToList(flag));
    console.log("newState", listToList(newState))

    // console.log(listToList(data))
    // asdf
   
    if (asNum(flag) == 0) {
        return [newState, data];
    }

    // TODO actually convert data to modulate 0's and 1's and do a POST to the server
    // get the response back, demodulate it, put that in alienResponse
    let alienResponse = send(data);
    //let alienResponse = new Atom("0"); // SEND_TO_ALIEN_PROXY(data)
    return interact(newState, alienResponse)
    // return interact(newState, SEND_TO_ALIEN_PROXY(data))
}

// Expr evil(Expr expr)
//     if (expr.Evaluated != null)
//         return expr.Evaluated
//     Expr initialExpr = expr
//     while (true)
//         Expr result = tryEval(expr)
//         if (result == expr)
//             initialExpr.Evaluated = result
//             return result
//         expr = result
export function evil(expr) {
    // console.log("eval", expr)
    if(expr.evaluated) {
        return expr.evaluated;
    }
    let initialExpr = expr;
    while(true) {
        let result = tryEval(expr);
        if(result == expr) {
            initialExpr.evaluated = result;
            return result;
        }
        expr = result;
    }
}

// Expr tryEval(Expr expr)
//     if (expr.Evaluated != null)
//         return expr.Evaluated
//     if (expr is Atom && functions[expr.Name] != null)
//         return functions[expr.Name]
//     if (expr is Ap)
//         Expr fun = evil(expr.Fun)
//         Expr x = expr.Arg
//         if (fun is Atom)
//             if (fun.Name == "neg") return Atom(-asNum(evil(x)))
//             if (fun.Name == "i") return x
//             if (fun.Name == "nil") return t
//             if (fun.Name == "isnil") return Ap(x, Ap(t, Ap(t, f)))
//             if (fun.Name == "car") return Ap(x, t)
//             if (fun.Name == "cdr") return Ap(x, f)
//         if (fun is Ap)
//             Expr fun2 = evil(fun.Fun)
//             Expr y = fun.Arg
//             if (fun2 is Atom)
//                 if (fun2.Name == "t") return y
//                 if (fun2.Name == "f") return x
//                 if (fun2.Name == "add") return Atom(asNum(evil(x)) + asNum(evil(y)))
//                 if (fun2.Name == "mul") return Atom(asNum(evil(x)) * asNum(evil(y)))
//                 if (fun2.Name == "div") return Atom(asNum(evil(y)) / asNum(evil(x)))
//                 if (fun2.Name == "lt") return asNum(evil(y)) < asNum(evil(x)) ? t : f
//                 if (fun2.Name == "eq") return asNum(evil(x)) == asNum(evil(y)) ? t : f
//                 if (fun2.Name == "cons") return evilCons(y, x)
//             if (fun2 is Ap)
//                 Expr fun3 = evil(fun2.Fun)
//                 Expr z = fun2.Arg
//                 if (fun3 is Atom)
//                     if (fun3.Name == "s") return Ap(Ap(z, x), Ap(y, x))
//                     if (fun3.Name == "c") return Ap(Ap(z, x), y)
//                     if (fun3.Name == "b") return Ap(z, Ap(y, x))
//                     if (fun3.Name == "cons") return Ap(Ap(x, z), y)
//     return expr

let functions = loadGalaxy();
export function setFunctions(things) {
    functions = things;
    // console.log("set functions to:", functions)
}

function tryEval(expr) {
    // console.log("tryEval", {expr})
    if (expr.evaluated) {
        return expr.evaluated
    }

    if (expr instanceof Atom && functions[expr.name]) {
        return functions[expr.name]
    }

    if (expr instanceof Ap) {
        let fun = evil(expr.fun);
        let x = expr.arg;
        if (fun instanceof Atom) {
            if (fun.name == "neg") return new Atom(-1 * asNum(evil(x)));
            if (fun.name == "i") return x;
            if (fun.name == "nil") return t;
            if (fun.name == "isnil") return new Ap(x, new Ap(t, new Ap(t, f)));
            if (fun.name == "car") return new Ap(x, t);
            if (fun.name == "cdr") return new Ap(x, f);
            if (fun.name == "inc") return new Atom(asNum(evil(x)) + 1);
            if (fun.name == "dec") return new Atom(asNum(evil(x)) - 1);
            if (fun.name == "pwr2") return new Atom(2 ** asNum(evil(x)));
            if (fun.name == "mod") return new Atom(modulate(asNum(evil(x))));
            if (fun.name == "dem") return new Atom(demodulate(evil(x).name));
        }
        if (fun instanceof Ap) {
            let fun2 = evil(fun.fun);
            let y = fun.arg;
            if (fun2 instanceof Atom) {
                if (fun2.name == "t") return y;
                if (fun2.name == "f") return x;
                if (fun2.name == "add") return new Atom(asNum(evil(x)) + asNum(evil(y)));
                if (fun2.name == "mul") return new Atom(asNum(evil(x)) * asNum(evil(y)));
                if (fun2.name == "div") return new Atom(Math.floor(asNum(evil(y)) / asNum(evil(x))));
                if (fun2.name == "lt") return asNum(evil(y)) < asNum(evil(x)) ? t : f;
                if (fun2.name == "eq") return asNum(evil(x)) == asNum(evil(y)) ? t : f;
                if (fun2.name == "cons") return evilCons(y, x);
            }
            if (fun2 instanceof Ap) {
                let fun3 = evil(fun2.fun)
                let z = fun2.arg
                if (fun3 instanceof Atom) {
                    if (fun3.name == "s") return new Ap(new Ap(z, x), new Ap(y, x));
                    if (fun3.name == "c") return new Ap(new Ap(z, x), y);
                    if (fun3.name == "b") return new Ap(z, new Ap(y, x));
                    if (fun3.name == "cons") return new Ap(new Ap(x, z), y);
                }
            }
        }
    }
    return expr;
}


// Expr evilCons(Expr a, Expr b)
//     Expr res = Ap(Ap(cons, evil(a)), evil(b))
//     res.Evaluated = res
//     return res
function evilCons(a, b) {
    let res = new Ap(new Ap(cons, evil(a)), evil(b));
    res.evaluated = res;
    return res;
}

// number asNum(Expr n)
//     if (n is Atom)
//         return PARSE_NUMBER(n.Name)
//     ERROR("not a number")
function asNum(n) {
    // console.log({n})
    if (n instanceof Atom)
        return parseInt(n.name)
    // return parseInt(n)
    throw "not a number";
}


// while(true) 
//     Expr click = Ap(Ap(cons, Atom(vector.X)), Atom(vector.Y))
//     var (newState, images) = interact(state, click)
//     PRINT_IMAGES(images)
//     vector = REQUEST_CLICK_FROM_USER()
//     state = newState

// See https://message-from-space.readthedocs.io/en/latest/message39.html
let state = nil;
let vector = new Vect(0, 0);

import readlineSync from 'readline-sync';
// import readline from 'readline';
import { render } from './render.mjs';

// let rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

async function main() {
    while(true) {
        console.log("main")
        // TODO get the x,y from the user or the bot
        let click = new Ap(new Ap(cons, new Atom(vector.x)), new Atom(vector.y));
        console.log("click:", click)
        let [newState, images] = interact(state, click)

        //PRINT_IMAGES(images)
        // console.log("images");
        // console.dir(images, {depth: 200})
        let imagesData = listToList(images);
        // console.log(imagesData);
        // await renderAll(imageData, 'output.png')
        await render(imagesData[0], 'output.png')
        await render(imagesData[1], 'output2.png')

        let input = readlineSync.question("> ");
        let [x, y] = input.split(' ');
        vector.x = x;
        vector.y = y;
        state = newState;
    }
}


export function parse(tokenStream) {
    // console.log("getNext", {tokenStream})
    let token = tokenStream.shift();
    if (token == "ap") {
        let left = parse(tokenStream);
        let right = parse(tokenStream);
        return new Ap(left, right);
    }
    return new Atom(token);
}


// console.log(new Atom("5"));

// let x = new Ap(new Ap(new Atom("add"), new Atom("5")), new Atom(3));

// // given ["ap", "asdf"] -> AP()

// console.log(evil(x));

// let foo = parse(["ap", "ap", "add", "5", "7"]);
// console.log(JSON.stringify(foo));
// console.log(evil(foo))

// is("multiplication", ["ap", "ap", "mul", "5", "3"], 15);
// let m = parse(["ap", "ap", "mul", "5", "3"]);
// let result = evil(m);
// console.log({result})


// let triple = parse(["ap", "inc", "ap", "inc", "ap", "inc", 0]);
// console.log(JSON.stringify(triple));
// let tripleResult = evil(triple);
// console.log({tripleResult})



// let myList = new Ap( new Ap(new Atom("cons"), new Atom("3")), new Atom("nil") );
// let bigList = new Ap( new Ap(new Atom("cons"), new Atom("9")), myList);
// let nestedList = new Ap( new Ap(new Atom("cons"), myList), bigList);

// console.log(listToList(myList));
// console.log(listToList(bigList));
// console.log(listToList(nestedList));

// [ [ [1,2], [3,4] ] ]
// ap ap cons ap ap cons ap ap cons ap ap cons 1 ap ap cons 2 ap ap cons ap ap cons 3 ap ap cons 4 nil nil  nil

// (3 . (5 . nil)) <----
// (3 . 5)         <----

// let p = parse([ "ap", "ap", "cons", "-1", "-3"]);
// let p = parse([
//     "ap", "ap", "cons", "ap", "ap", "cons", "-1", "-3",
//     "ap", "ap", "cons", "ap", "ap", "cons", "7", "21",
//    "nil"]);
// //let p = parse(["ap", "cons", "ap", "ap", "cons", "ap", "ap", "cons", "-1", "-3", "ap", "ap", "cons", "ap", "ap", "cons", "0", "-3", "ap", "ap", "cons", "ap", "ap", "cons", "1", "-3", "nil"]);
// console.log(listToList(p))

main().then(() => {
    console.log("main is done?")
})
