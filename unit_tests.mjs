
import * as Engine from './engine.mjs';

function is(desc, a, b) {
    let aVal = Engine.evil(a);
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

    is("#11 Example", ["ap", "ap", "eq", -10, -10], Engine.primitives.t);

    is("#12 Example", ["ap", "ap", "lt", -10, -12], Engine.primitives.f);

    is("#19 C Combinator ex 1", ["ap", "ap", "ap", "c", "add", 1, 2], 3);
    is("#19 C Combinator ex 2", ["ap", "ap", "ap", "c", "div", 7, 14], 2);
    is("#19 C Combinator ex 3", ["ap", "ap", "ap", "c", "div", "ap", "dec", 8, "ap", "inc", 13], 2);

    is("#20 B Combinator ex 1", ["ap", "ap", "ap", "b", "inc", "dec", 14], 14);
    is("#20 B Combinator ex 2", ["ap", "ap", "ap", "ap", "b", "mul",  "dec", "ap", "ap", "add", 1, 2, 3], 6);


    is("#28 nil try 1", ["ap", "nil", "2"], Engine.primitives.t);
    is("#28 nil try 2", ["ap", "nil", "3"], Engine.primitives.t);

    is("#18 s ex 1", ["ap", "ap", "ap", "s", "add", "inc", "1"], 3);
    is("#18 s ex 2", ["ap", "ap", "ap", "s", "mul", "ap", "add", "1", "6"], 42);
    is("#18 s ex 3", ["ap", "ap", "ap", "s", "add", "inc", "ap", "inc", 0], 3);

    // is("#25", interp(["ap", "ap", "cons", "x0", "x1"]), interp(["ap", "ap", "cons", "x0", "x1"]))

    is("23 ex 1", ["ap", "pwr2", 7], 128);

    is("#26 car", ["ap", "car", "ap", "ap", "cons", "5", "7"], "5");
    is("#27 cdr", ["ap", "cdr", "ap", "ap", "cons", "5", "7"], "7");
    // (a b c d) -> (a . (b . (c . (d . nil))))

    is("#29 isnil nil", ["ap", "isnil", "nil"], Engine.primitives.t);
    is("#29 isnill nope", ["ap", "isnil", "ap", "ap", "cons", "x0", "x1"], Engine.primitives.f);

    // ( )   =   nil
    // is("#30 list construction empty", ["(", ")"], "nil");

    // The [ap invalid 5] should never get evaluated
    is("lazy evaluated", ["ap", "ap", "f", "ap", "invalid", "5", "42"], "42");

    Engine.setWorld({
        ":2048": Engine.getNext(["ap", "f", ":2048"])
    });
    is("not too recursive", ["ap", ":2048", "42"], "42");


    // ap :2048 42
    // -> ap ap f :2048 42
    // -> ap ap [ (a) => (b) => b ] :2048 42
    // -> ap [ (x) -> x ] 42
    // -> 42

    // ( x0 )   =   ap ap cons x0 nil
    // is("#30 list one", interp(["ap", "car", "(", "x0", ",", "x1", ")"]), "x0");
    // is("#30 list one", interp(["ap", "car", "ap", "cdr", "(", "x0", ",", "x1", ")"]), "x1");
    // is("#30 list one", interp(["ap", "isnil", "ap", "cdr", "ap", "cdr", "(", "x0", ",", "x1", ")"]), Engine.primitives.t);

    // ( x0 , x1 )   =   ap ap cons x0 ap ap cons x1 nil
    // ( x0 , x1 , x2 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 nil
    // ( x0 , x1 , x2 , x5 )   =   ap ap cons x0 ap ap cons x1 ap ap cons x2 ap ap cons x5 nil

    ok("modulate 0", Engine.modulate(0), '010');
    ok("modulate 1", Engine.modulate(1), '01100001');
    ok("modulate -1", Engine.modulate(-1), '10100001');
    ok("modulate 4", Engine.modulate(4), '01100100');
    ok("modulate 16", Engine.modulate(16), '0111000010000')

    ok("Engine.demodulate to 0", Engine.demodulate('010'), 0);
    ok("Engine.demodulate to 1", Engine.demodulate('01100001'), 1);
    ok("Engine.demodulate to -1", Engine.demodulate('10100001'), -1);
    ok("Engine.demodulate to 4", Engine.demodulate('01100100'), 4);
    ok("Engine.demodulate to 16", Engine.demodulate('0111000010000'), 16);

    is("#14 dem ex 1", ["ap", "dem", "ap", "mod", "42"], 42);
    is("#14 dem ex 2", ["ap", "mod", "ap", "dem", "0111000010000"], "0111000010000");

}


runTests();
