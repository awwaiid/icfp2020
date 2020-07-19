
import * as Engine from './engine.mjs';
import * as RefEngine from './ref_engine.mjs';

function is(desc, a, b) {
    // let aVal = Engine.evil(a);
    let aVal = RefEngine.evil( RefEngine.parse(a)).name;
    if (aVal === b) {
        console.log("OUTSTANDING! # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", aVal, " expected ", b)
    }
}

function stringify(a) {
    return JSON.stringify(a,
        (key, value) =>
                    typeof value === 'bigint'
                        ? value.toString()
                        : value
        );
}

function ok(desc, a, b) {
    if (stringify(a) === stringify(b)) {
        console.log("GOOD JOB! # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

function runTests() {

    is("multiplication", ["ap", "ap", "mul", "5", "3"], 15n);
    is("single inc", ["ap", "inc", "2"], 3n);
    is("double inc", ["ap", "inc", "ap", "inc", "2"], 4n);

    is("triple inc", ["ap", "inc", "ap", "inc", "ap", "inc", "0"], 3n); // should be 3

    is("#22 False example", ["ap", "ap", "f", "1", "foo"], "foo");

    //"ap" "ap" t 1 5   =  1
    is("#21 K combinator example", ["ap", "ap", "t", "foo", "5"], "foo");

    //"ap" "ap" t "ap" "inc" 5 t   =   6
    is("#21 K combinator last example", ["ap", "ap", "t", "ap", "inc", "5", "t"], 6n);


    // "ap" "inc" "ap" "inc" 0   =   2
    is("#17 and #5 function application example 1", ["ap", "inc", "ap", "inc", "0"], 2n);

    // "ap" "inc" "ap" "inc" "ap" "inc" 0   =   3

    is("#17 and #5 ex 2", ["ap", "inc", "ap", "inc", "ap", "inc", "0"], 3n);

    is("add 1, 2, 3 with curry", ["ap", "ap", "add", "1", "ap", "ap", "add", "2", "3"], 6n);

    is("#11 Example", ["ap", "ap", "eq", "-10", "-10"], "t");

    is("#12 Example", ["ap", "ap", "lt", "-10", "-12"], "f");

    is("#19 C Combinator ex 1", ["ap", "ap", "ap", "c", "add", "1", "2"], 3n);
    is("#19 C Combinator ex 2", ["ap", "ap", "ap", "c", "div", "7", "14"], 2n);
    is("#19 C Combinator ex 3", ["ap", "ap", "ap", "c", "div", "ap", "dec", "8", "ap", "inc", "13"], 2n);

    is("#20 B Combinator ex 1", ["ap", "ap", "ap", "b", "inc", "dec", "14"], 14n);
    is("#20 B Combinator ex 2", ["ap", "ap", "ap", "ap", "b", "mul",  "dec", "ap", "ap", "add", "1", "2", "3"], 6n);


    is("#28 nil try 1", ["ap", "nil", "2"], "t");
    is("#28 nil try 2", ["ap", "nil", "3"], "t");

    is("#18 s ex 1", ["ap", "ap", "ap", "s", "add", "inc", "1"], 3n);
    is("#18 s ex 2", ["ap", "ap", "ap", "s", "mul", "ap", "add", "1", "6"], 42n);
    is("#18 s ex 3", ["ap", "ap", "ap", "s", "add", "inc", "ap", "inc", "0"], 3n);

    // is("#25", interp(["ap", "ap", "cons", "x0", "x1"]), interp(["ap", "ap", "cons", "x0", "x1"]))

    is("23 ex 1", ["ap", "pwr2", "7"], 128n);

    is("#26 car", ["ap", "car", "ap", "ap", "cons", "5", "7"], "5");
    is("#27 cdr", ["ap", "cdr", "ap", "ap", "cons", "5", "7"], "7");
    // (a b c d) -> (a . (b . (c . (d . nil))))

    is("#29 isnil nil", ["ap", "isnil", "nil"], "t");
    is("#29 isnill nope", ["ap", "isnil", "ap", "ap", "cons", "x0", "x1"], "f");

    // ( )   =   nil
    // is("#30 list construction empty", ["(", ")"], "nil");

    // The [ap invalid 5] should never get evaluated
    is("lazy evaluated", ["ap", "ap", "f", "ap", "invalid", "5", "42"], "42");

    RefEngine.setFunctions({
        ":2048": RefEngine.parse(["ap", "f", ":2048"])
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

    ok("modulate 0", RefEngine.modulate(0), '010');
    ok("modulate 1", RefEngine.modulate(1), '01100001');
    ok("modulate -1", RefEngine.modulate(-1), '10100001');
    ok("modulate 4", RefEngine.modulate(4), '01100100');
    ok("modulate 16", RefEngine.modulate(16), '0111000010000');

    ok("demodulate to 0", RefEngine.listToList(RefEngine.demodulate('010')), 0n);
    ok("demodulate to 1", RefEngine.listToList(RefEngine.demodulate('01100001')), 1n);
    ok("demodulate to -1", RefEngine.listToList(RefEngine.demodulate('10100001')), -1n);
    ok("demodulate to 4", RefEngine.listToList(RefEngine.demodulate('01100100')), 4n);
    ok("demodulate to 16", RefEngine.listToList(RefEngine.demodulate('0111000010000')), 16n);

    ok("modulate_list (0)", RefEngine.modulate_list([0n]), '1101000');
    ok("modulate_list (1,(2,3),4)", RefEngine.modulate_list([1n,[2n,3n],4n]), '1101100001111101100010110110001100110110010000');

    ok("demodulate_list modulated (0)", RefEngine.listToList(RefEngine.demodulate_list('1101000')), [0n]);
    ok("demodulate_list modulated (1,(2,3),4)", RefEngine.listToList(RefEngine.demodulate_list('1101100001111101100010110110001100110110010000')), [1n, [2n, 3n], 4n]);
    ok("demodulate_list modulated (1,(2,3),4)", RefEngine.listToList(RefEngine.demodulate_list('1101100001110111110010110100011101100')), [1n, 23099n]);



    // is("#13 mod ex 1", ["ap", "dem", "ap", "mod", "42"], 42);
    // is("#14 dem ex 2", ["ap", "mod", "ap", "dem", "0111000010000"], "0111000010000");
}

runTests();
