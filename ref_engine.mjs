// Built based on the reference pseudocode
// See video course https://icfpcontest2020.github.io/#/post/2054

class Expr {
    constructor() {
        this.evaluated = false;
    }
}

class Atom extends Expr {
  constructor(name) {
      super();
      this.name = name;
  }
}

class Ap extends Expr {
  constructor(fun, arg) {
      super();
      this.fun = fun;
      this.arg = arg;
  }
}

export let cons = new Atom("cons")
export let t = new Atom("t")
export let f = new Atom("f")
export let nil = new Atom("nil")

function bigAbs(n) {
    if(n >= 0n) {
        return n;
    } else {
        return -1n * n;
    }
}

export function modulate(aNum) {
    if(aNum == "nil") {
        return "00";
    }
    let n = parseBigInt(aNum);
    let isPositive = n >= 0n;
    let num = bigAbs(n);
    let binaryString = num.toString(2);
    let bitCount = binaryString.length;
    let unaryLength = Math.ceil(bitCount / 4);
    let binaryLength = unaryLength * 4;

    // Easier than dealing with it later
    if (num == 0n) {
        return "010";
    }

    let signPrefix = isPositive ? "01" : "10";
    let unary = "1".repeat(unaryLength) + "0";
    let paddedBinaryString = binaryString.padStart(binaryLength, "0");

    return signPrefix + unary + paddedBinaryString;
}


export function demodulateHelper(binary) {
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
        binary.shift();
        return new Atom(0n);
    }
    binary.shift(); // Drop the "0" after the unary length
    // console.log("only number", {binary})
    bitCount = bitCount * 4; // each one is 4 bits actually
    let numBinary = binary.splice(0, bitCount);
    let number = parseBigInt(numBinary.join(''), 2);
    if (!isPositive) {
        number = number * -1n;
    }
    // could do some safety check here ....
    return new Atom(number);
}

export function demodulate(text) {
    let binary = text.split('');
    return demodulateHelper(binary);
}

//  coords = [
//    [
//      [ -1, -3 ], [ 0, -3 ],  [ 1, -3 ],
//      [ 2, -2 ],  [ -2, -1 ], [ -1, -1 ],
//      [ 0, -1 ],  [ 3, -1 ],  [ -3, 0 ],
//      [ -1, 0 ],  [ 1, 0 ],   [ 3, 0 ],
//      [ -3, 1 ],  [ 0, 1 ],   [ 1, 1 ],
//      [ 2, 1 ],   [ -2, 2 ],  [ -1, 3 ],
//      [ 0, 3 ],   [ 1, 3 ]
//    ],
//    [ [ -7, -3 ], [ -8, -2 ] ],
//    'nil'
//  ]

// [ 0 ] -> 11 '010' 00
// [ 0, [ 3 ]] -> 11 "010" 11 11 "3"

export function modulate_list(coords) {
    // console.log("modulate_list", { coords });
    let modulated = '';
    if (Array.isArray(coords)) {
        modulated += '11';  /// open paren
        coords.forEach((elem, index) => {
            // console.log(elem);
            modulated += modulate_list(elem); // add a comma or open paren then close paren
            if(index < coords.length - 1) {
                // not the last element, add a comma
                // should we add a comma
                // yes ... unless this is the LAST elem in coords
                modulated += '11'
            }
        });
        modulated += '00';  // close paren
    } else {
        modulated += modulate(coords); // open paren or comma
    }
    // console.log("modulate_list result", {modulated});
    return modulated;
}

// "2" -> 2
// [ "2" ] -> ["2"]

function demodulateListHelper(binary) {
    let peek = binary[0].toString() + binary[1].toString();
    if(peek == '11') {
        binary.splice(0,2);
        let element = demodulateListHelper(binary);

        return new Ap(
            new Ap(
                cons,
                element
            ),
            demodulateListHelper(binary)
        );
        // return [element, ...demodulateListHelper(binary)];
    } else if (peek == '00') {
        binary.splice(0,2);
        return nil;
    } else {
         let element = demodulateHelper(binary);
         return element;
    }
}



// // expecting to receive ONE thing -- either an element or a list
// function demodulateListHelper(binary) {
//     let peek = binary[0].toString() + binary[1].toString();
//     if(peek == '11') {
//         binary.splice(0,2);
//         let element = demodulateListHelper(binary);
//         return [element, ...demodulateListHelper(binary)];
//     } else if (peek == '00') {
//         binary.splice(0,2);
//         return [];
//     } else {
//          let element = demodulateHelper(binary);
//          return element;
//     }
// }

// [ 1, [2, 3], 4]
// ,1 ,,2 ,3 ; ,4 ;
// , 1, ,2, 3;, 4;
// ,1 ,2 3 ; 4 ;


export function demodulate_list(bit_str) {
    let binary = bit_str.split('');
    // maybe slice off leading '11'?
    let result = demodulateListHelper(binary);
    if (binary.length > 0) {
        console.log({bit_str, binary});
        throw "There is stuff left!";
    }
    return result;

    // let data = [];
    // let row = -1;

    // while(binary.length > 0) {
    //     console.log(binary.length);
    //     peek = binary[0].toString() + binary[1].toString();
    //     peek2 = binary[2].toString() + binary[3].toString();
    //     switch(peek) {
    //         case '11':  // open parent
    //             binary.splice(0,2);
    //             row++;
    //             break;
    //         case '00': // close paren
    //             binary.splice(0,2);
    //             row--;
    //             if (peek2 == '11') { binary.splice(0,2); }  // we can toss the comma
    //             break;
    //         default:
    //             let num = demodulateHelper(binary);
    //             if (row <= 0) {
    //                 data.push(num);
    //             }
    //             else {
    //                 data[row].push(num);
    //             }
    //             if (peek2 == '11') { binary.splice(0,2); }  // we can toss the comma
    //     }
    // }
    
}


import axios from 'axios';

// TODO actually convert data to modulate 0's and 1's and do a POST to the server
// get the response back, demodulate it, put that in alienResponse
// let alienResponse = send(data);
async function send(data) {
    let dataList = listToList(data);
    let encodedData = modulate_list(dataList);
    console.log("Posting:", {dataList, encodedData})
    let response = await axios.post(
        'https://icfpc2020-api.testkontur.ru/aliens/send?apiKey=a9f3b65f22c448ecb5f650a7ff8e770c',
        encodedData,
        {
            responseType: 'text',
            transformResponse: res => res, // no transform
            headers: { 'Content-Type': 'text/plain' }
        }
    );
    // console.log("axios response", {response});
    // console.log("axios response raw data", response.data);
    let result = demodulate_list(response.data);
    // console.log("demodulated result");
    // console.dir(result, {depth: 1000});
    // console.log(listToList(result));

    return result;
}

function listContentToList(list) {
    // console.log("printing list content", {list})
        if (list instanceof Atom && list.name == 'nil') {
            return [];
        } else if (list instanceof Ap) {
            let f = list.fun;
            let arg = list.arg;

            if(f instanceof Ap && f.fun.name == "cons") {
                let element = listToList(f.arg);
                let restOfList = listContentToList( arg ); 
                if(restOfList) {
                    return [element, ...restOfList];
                } else {
                    return [element];
                }
            }

            return [listToList(f), ...listContentToList(arg)];
        } else if (list instanceof Atom) {
            // Normal lists shouldn't get here? Only dotted-pairs
            return [list.name];
        }
}

export function listToList(list) {
    if (list instanceof Ap) {
        return [ ...listContentToList(list) ];
    } else {
        return list.name;
    }
}

function myCar(list) {
    return list.fun.arg;
}

function myCdr(list) {
    return list.arg;
}

export async function interact(state, event) {
    console.log("in interact", listToList(event))
    let expr = new Ap( new Ap(new Atom("galaxy"), state), event);
    let res = evil(expr);
    // Note: res will be modulatable here (consists of cons, nil and numbers only)
    let flag = myCar(res);
    let newState = myCar(myCdr(res));
    let data = myCar(myCdr(myCdr(res)));

    console.log("flag", listToList(flag));
    console.log("newState", listToList(newState))
    //console.log("data", listToList(data))
   
    if (asNum(flag) == 0n) {
        return [newState, data];
    }

    let alienResponse = await send(data);
    return await interact(newState, alienResponse);
}

export function evil(expr) {
    // console.log("eval")
    // console.dir(expr, { depth: 1000});
    if(expr.evaluated) {
        return expr.evaluated;
    }
    let initialExpr = expr;
    while(true) {
        let result = tryEval(expr);
        if(result == expr) { // do a deep compare?
            initialExpr.evaluated = result;
            return result;
        }
        expr = result;
    }
}

let functions = {};

export function setFunctions(things) {
    functions = things;
}

function tryEval(expr) {
    // console.log("tryEval");
    // console.dir(expr, { depth: 1000});
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
            if (fun.name == "neg") return new Atom(-1n * asNum(evil(x)));
            if (fun.name == "i") return x;
            if (fun.name == "nil") return t;
            if (fun.name == "isnil") return new Ap(x, new Ap(t, new Ap(t, f)));
            if (fun.name == "car") return new Ap(x, t);
            if (fun.name == "cdr") return new Ap(x, f);
            if (fun.name == "inc") return new Atom(asNum(evil(x)) + 1n);
            if (fun.name == "dec") return new Atom(asNum(evil(x)) - 1n);
            if (fun.name == "pwr2") return new Atom(2n ** asNum(evil(x)));
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
                if (fun2.name == "div") return new Atom(asNum(evil(y)) / asNum(evil(x)));
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

function evilCons(a, b) {
    let res = new Ap(new Ap(cons, evil(a)), evil(b));
    res.evaluated = res;
    return res;
}

function parseBigInt(v, base=10) {
    // console.log("parseBigInt", v)
    let str = v.toString();

    let isNegative = false;
    if(str[0] == '-') {
        isNegative = true;
        str = str.slice(1);
    }

    base = BigInt(base)
    var bigint = BigInt(0);
    for (var i = 0; i < str.length; i++) {
      var code = str[str.length-1-i].charCodeAt(0) - 48; if(code >= 10) code -= 39
      bigint += base**BigInt(i) * BigInt(code)
    }
    if(isNegative) {
        bigint *= -1n;
    }
    return bigint
  }

function asNum(n) {
    if (n instanceof Atom)
        return parseBigInt(n.name)

    // console.log("asNum");
    // console.dir(n, {depth: 1000})
    // console.trace();
    throw "not a number";
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

import fs from 'fs';
export function loadGalaxy() {
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

        console.log("Galaxy loaded!");

        return functions;
    } catch (err) {
        console.error(err);
    }
}