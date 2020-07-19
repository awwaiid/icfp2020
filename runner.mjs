import * as Engine from "./engine.mjs";

let a = function(x) {
    return x.split(" ");
}

//let stream = a("ap ap cons ap ap cons 5 ap ap cons 3 nil nil");
let stream = a("ap ap cons ap ap cons 5 ap ap cons 10 nil ap ap cons ap ap cons 6 ap ap cons 11 nil ap ap cons ap ap cons 5 ap ap cons 11 nil nil");

let list = Engine.evil(stream);

Engine.primitives.draw(list);