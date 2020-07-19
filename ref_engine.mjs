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
        return 0;
    }
    binary.shift(); // Drop the "0" after the unary length
    // console.log("only number", {binary})
    bitCount = bitCount * 4; // each one is 4 bits actually
    let numBinary = binary.splice(0, bitCount);
    let number = parseInt(numBinary.join(''), 2);
    if (!isPositive) {
        number = number * -1;
    }
    // could do some safety check here ....
    return number;
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

// not sure we need this yet
export function demodulate_list(bit_str) {
}


import axios from 'axios';

// TODO actually convert data to modulate 0's and 1's and do a POST to the server
// get the response back, demodulate it, put that in alienResponse
// let alienResponse = send(data);
async function send(data) {
    let encodedData = modulate_list(data);
    console.log("Posting:", {data, encodedData})
    let response = await axios.post('https://icfpc2020-api.testkontur.ru/aliens/send?apiKey=a9f3b65f22c448ecb5f650a7ff8e770c', encodedData);
    console.log("axios response", {response});
    let result = demodulate(response.data);
    console.log("demodulated result", {result});
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

export function interact(state, event) {
    console.log("interact", listToList(event))
    let expr = new Ap( new Ap(new Atom("galaxy"), state), event);
    let res = evil(expr);
    // Note: res will be modulatable here (consists of cons, nil and numbers only)
    let flag = myCar(res);
    let newState = myCar(myCdr(res));
    let data = myCar(myCdr(myCdr(res)));

    console.log("flag", listToList(flag));
    console.log("newState", listToList(newState))
    console.log("data", listToList(data))
   
    if (asNum(flag) == 0) {
        return [newState, data];
    }

    let alienResponse = send(data);
    return interact(newState, alienResponse);
}

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

let functions = {};

export function setFunctions(things) {
    functions = things;
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

function evilCons(a, b) {
    let res = new Ap(new Ap(cons, evil(a)), evil(b));
    res.evaluated = res;
    return res;
}

function asNum(n) {
    // console.log({n})
    if (n instanceof Atom)
        return parseInt(n.name)
    // return parseInt(n)
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
